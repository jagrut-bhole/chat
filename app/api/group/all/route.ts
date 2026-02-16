import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelper";
import { AllGroupsResponse } from "./AllGroupsSchema";
import { getDistanceInKm } from "@/constants/distance";

export async function GET(): Promise<NextResponse<AllGroupsResponse>> {
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
        groupMembers: {
          none: {
            userId: user.id,
          },
        },
      },
      include: {
        _count: {
          select: {
            groupMembers: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const MAX_RADIUS_KM = 40;

    const nearbyGroups = groups.filter((group) => {
      if (!group.latitude || !group.longitude || !user.latitude || !user.longitude) {
        return false;
      }

      const distance = getDistanceInKm(
        user.latitude,
        user.longitude,
        group.latitude,
        group.longitude
      );

      return distance <= MAX_RADIUS_KM;
    });

    const formattedGroups = nearbyGroups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      memberCount: group._count.groupMembers,
      maxMembers: group.maxMembers,
      expiryDate: group.expiresAt?.toISOString() || null,
      createdAt: group.createdAt.toISOString(),
    }));

    return NextResponse.json(
      {
        success: true,
        message: "All groups fetched successfully",
        data: formattedGroups,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error in GET /api/group/all: ${error}`);
    return NextResponse.json(
      {
        success: false,
        message: "Error occurred while fetching all groups",
      },
      {
        status: 500,
      }
    );
  }
}
