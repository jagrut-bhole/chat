import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { geoLocation, formatLocation } from "@/lib/geocode";

// Schema
import { SignupSchemaRequest, SignupResponse } from "./SignupSchema";

export async function POST(req: NextRequest): Promise<NextResponse<SignupResponse>> {
  try {
    const body = await req.json();

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

    const { username, password, latitude, longitude } = validationResult.data;

    const existingUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (existingUser) {
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

    const hashedPassword = await bcrypt.hash(password, 12);

    let locationData: {
      latitude?: number;
      longitude?: number;
      location?: string;
      lastLocation?: Date;
    } = {};

    if (latitude !== undefined && longitude !== undefined) {
      try {
        const geocodeResult = await geoLocation({ latitude, longitude });
        const formattedLocation = formatLocation(geocodeResult);

        locationData = {
          latitude,
          longitude,
          location: formattedLocation,
          lastLocation: new Date(),
        };
      } catch (error) {
        console.error("Geocoding error during signup:", error);
        locationData = {
          latitude,
          longitude,
          lastLocation: new Date(),
        };
      }
    }

    const user = await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
        ...locationData,
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
        createdAt: user.createdAt.toISOString(),
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
