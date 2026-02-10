import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/helpers/authHelper";

import { locationSchema } from "./LocationSchema";

export async function POST(req: NextRequest) : Promise<NextResponse> {
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

        const body = await req.json();

        const validationResult = locationSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid location data",
                },
                {
                    status: 400,
                }
            )
        }

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                lastLocation: new Date(),
                latitude: body.latitude,
                longitude: body.longitude,
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: "Location set successfully",
            },
            {
                status: 200,
            }
        );
        
    } 
    catch (error) {
        console.error(`Error in POST /api/auth/location: ${error}`);
        return NextResponse.json(
            {
                success: false,
                message: "Error occured while setting the users location",
            },
            {
                status: 500,
            }
        );
    }
}