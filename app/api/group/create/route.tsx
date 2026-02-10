import prisma  from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelper";
import { createGroupSchema, CreateGroupResponse} from "./CreateGroupSchema";

export async function POST(req:NextRequest): Promise<NextResponse<CreateGroupResponse>> {
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
            )
        }

        const { groupName, description, maxMembers, expiryDate, latitude, longitude } = validationResult.data;

        const group = await prisma.group.create({
            data: {
                name: groupName,
                description,
                maxMembers,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                latitude,
                longitude,
                lastLocation: new Date(),
                members: {
                    connect: { 
                        id: user.id 
                    }
                }
            },
            include: {
                members: true
            }
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
                    expiryDate: group.expiryDate,
                    createdAt: group.createdAt,
                }
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