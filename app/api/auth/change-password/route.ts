import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { changePasswordSchema, ChangePasswordResponse } from "./changePasswordSchema";

export async function POST(req: NextRequest): Promise<NextResponse<ChangePasswordResponse>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
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

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found!!",
        },
        {
          status: 404,
        }
      );
    }

    const body = await req.json();

    const validationResult = changePasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data",
        },
        {
          status: 400,
        }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New password cannot be same as current password",
        },
        {
          status: 400,
        }
      );
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid password",
        },
        {
          status: 401,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password changed successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in POST /api/auth/change-password", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error occured while changing the password",
      },
      {
        status: 500,
      }
    );
  }
}
