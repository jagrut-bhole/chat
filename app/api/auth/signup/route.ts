import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Schema
import { SignupSchemaRequest, SignupResponse } from "./SignupSchema";

export async function POST(req: NextRequest): Promise<NextResponse<SignupResponse>> {
  try {
    const body = await req.json();

    // Zod schema validation (handles username/password requirements automatically)
    const validationResult = SignupSchemaRequest.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: validationResult.error.issues[0]?.message || "Invalid input",
        },
        {
          status: 400,
        }
      );
    }

    const { username, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (existingUser) {
      // ✅ FIXED: if user EXISTS, return error
      return NextResponse.json(
        {
          success: false,
          message: "Username already exists. Please choose a different username.",
        },
        {
          status: 409,
        }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt.toISOString(), // ✅ FIXED: Convert to string
      },
    });
  } catch (error) {
    console.error("SignUp Backend Error: ", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while creating the account",
      },
      {
        status: 500,
      }
    );
  }
}
