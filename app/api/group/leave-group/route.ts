import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelper";
import { leaveGroupSchema } from "./leaveGroupSchema";
import { getGroupById } from "@/helpers/groupHelper";

export async function DELETE(req: NextRequest): Promise<NextResponse> {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized"
                },
                {
                    status: 401
                }
            )
        }

        const body = await req.json();
        const validationResult = leaveGroupSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request"
                },
                {
                    status: 400
                }
            )
        }

        const { groupId } = validationResult.data;

        const group = await getGroupById(groupId);

        if (!group) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Group Not Found!"
                },
                {
                    status: 404
                }
            )
        }

        const groupMember = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: user.id,
                    groupId: group.id,
                },
            },
        });

        if (!groupMember) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not a member of this group!"
                },
                {
                    status: 403
                }
            )
        }

        await prisma.groupMember.delete({
            where: {
                userId_groupId: {
                    userId: user.id,
                    groupId,
                }
            }
        })

        return NextResponse.json(
            {
                success: true,
                message: "Group left successfully"
            },
            {
                status: 200
            }
        )

    } catch (error) {
        console.error(`Error leaving group: ${error}`);
        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error"
            },
            {
                status: 500
            }
        )
    }
}