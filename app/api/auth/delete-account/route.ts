import { deleteAccountSchema } from "./DeleteAccountSchema";

import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(req:NextRequest): Promise<NextResponse>{
    try {

        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized!!"
                },
                {
                    status: 401
                }
            )
        }

        const user = await prisma.user.findUnique({
            where: {
                id: session.user.id
            }
        })

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found!!"
                },
                {
                    status: 404
                }
            )
        }

        const body = await req.json();
        const validationResult = deleteAccountSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid data!!"
                },
                {
                    status: 400
                }
            )
        }

        const {password, userId} = validationResult.data;

        if (userId !== user.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized!!"
                },
                {
                    status: 401
                }
            )
        }

        const isPasswordValid = bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid password!!"
                },
                {
                    status: 401
                }
            )
        }

        await prisma.$transaction(async (tx) => {
            await tx.groupMember.deleteMany({
                where: {
                    userId: user.id,
                }
            });

            await tx.user.delete({
                where: {
                    id: user.id
                }
            })
        });

        return NextResponse.json(
            {
                success: true,
                message: "User deleted successfully!!"
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.log("Error while Deleting the user!!");
        return NextResponse.json(
            {
                success: false,
                message: "Error while Deleting the user!!"
            },
            {
                status: 500
            }
        )
    }
}