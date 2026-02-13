import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelper";
import { joinGroupSchema, JoinGroupResponse } from "./JoinGroupSchema";

export async function POST(req: NextRequest): Promise<NextResponse<JoinGroupResponse>> {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const validationResult = joinGroupSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid group ID",
        },
        {
          status: 400,
        }
      );
    }

    const { groupId } = validationResult.data;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: {
            groupMembers: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        {
          success: false,
          message: "Group not found",
        },
        {
          status: 404,
        }
      );
    }

    // Check if user is already a member using GroupMember table
    const existingMembership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId: groupId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        {
          success: false,
          message: "You are already a member of this group",
        },
        {
          status: 400,
        }
      );
    }

    if (group.maxMembers && group._count.groupMembers >= group.maxMembers) {
      return NextResponse.json(
        {
          success: false,
          message: "Group is full",
        },
        {
          status: 400,
        }
      );
    }

    // Check if group has expired
    if (group.expiresAt && new Date(group.expiresAt) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "Group has expired",
        },
        {
          status: 400,
        }
      );
    }

    // Add user to group via GroupMember table
    await prisma.groupMember.create({
      data: {
        userId: user.id,
        groupId: groupId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully joined the group",
        data: {
          groupId: group.id,
          name: group.name,
          memberCount: group._count.groupMembers + 1,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error in POST /api/group/join: ${error}`);
    return NextResponse.json(
      {
        success: false,
        message: "Error occurred while joining the group",
      },
      {
        status: 500,
      }
    );
  }
}
