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

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            id: user.id,
          },
        },
      },
      include: {
        members: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedGroups = groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      memberCount: group.members.length,
      maxMembers: group.maxMembers,
      expiryDate: group.expiryDate?.toISOString() || null,
      createdAt: group.createdAt.toISOString(),
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
