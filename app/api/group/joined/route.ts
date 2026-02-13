import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelper";
import { JoinedGroupsResponse } from "./JoinedGroupsSchema";

export async function GET(): Promise<NextResponse<JoinedGroupsResponse>> {
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

    // Fetch groups the user has joined via GroupMember junction table
    const groupMemberships = await prisma.groupMember.findMany({
      where: {
        userId: user.id,
      },
      include: {
        group: {
          include: {
            _count: {
              select: {
                groupMembers: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    const formattedGroups = groupMemberships.map((membership) => ({
      id: membership.group.id,
      name: membership.group.name,
      description: membership.group.description,
      memberCount: membership.group._count.groupMembers,
      maxMembers: membership.group.maxMembers,
      expiryDate: membership.group.expiresAt?.toISOString() || null,
      createdAt: membership.group.createdAt.toISOString(),
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Joined groups fetched successfully",
        data: formattedGroups,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error in GET /api/group/joined: ${error}`);
    return NextResponse.json(
      {
        success: false,
        message: "Error occurred while fetching joined groups",
      },
      {
        status: 500,
      }
    );
  }
}
