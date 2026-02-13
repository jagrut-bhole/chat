import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelper";
import { createGroupSchema, CreateGroupResponse } from "./CreateGroupSchema";

export async function POST(req: NextRequest): Promise<NextResponse<CreateGroupResponse>> {
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

    const validationResult = createGroupSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid group data",
        },
        {
          status: 400,
        }
      );
    }

    const { groupName, description, maxMembers, expiryDate, latitude, longitude } =
      validationResult.data;

    // Creating the group and adding the creator as the first member
    const group = await prisma.group.create({
      data: {
        name: groupName,
        description,
        maxMembers,
        expiresAt: expiryDate ? new Date(expiryDate) : null,
        latitude,
        longitude,
        lastLocation: new Date(),
        groupMembers: {
          create: {
            userId: user.id,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Group created successfully",
        data: {
          groupId: group.id,
          name: group.name,
          description: group.description,
          maxMembers: group.maxMembers,
          expiryDate: group.expiresAt,
          createdAt: group.createdAt,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error in POST /api/group/create: ${error}`);
    return NextResponse.json(
      {
        success: false,
        message: "Error occured while creating the group",
      },
      {
        status: 500,
      }
    );
  }
}
