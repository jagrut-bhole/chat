import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/helpers/authHelper";
import { NextResponse } from "next/server";

export async function GET() : Promise<NextResponse> {
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
            )
        }

        const userProfile = await prisma.user.findUnique({
            where: {
                id: user.id
            },
            select: {
                id: true,
                username: true,
                createdAt: true,
                latitude: true,
                longitude: true,
                lastLocation: true,
                groups: true,
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: "User profile fetched successfully",
                data: userProfile
            },
            {
                status: 200,
            }
        )

    } catch (error) {
        console.error('Error in GET /api/auth/profile', error);
        return NextResponse.json(
            {
                success: false,
                message: "Error occured while fetching the user profile",
            },
            {
                status: 500,
            }
        );
    }
}