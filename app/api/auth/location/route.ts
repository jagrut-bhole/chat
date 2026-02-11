import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/helpers/authHelper";
import { geoLocation, formatLocation } from "@/lib/geocode";

import { locationSchema } from "./LocationSchema";

export async function PATCH(req: NextRequest): Promise<NextResponse> {
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
      );
    }

    // checks if user has updated location in 24 hours
    if (user.lastLocation) {
      const lastUpdateTime = new Date(user.lastLocation).getTime();
      const currentTime = new Date().getTime();
      const hoursSinceLastUpdate = (currentTime - lastUpdateTime) / (1000 * 60 * 60);

      if (hoursSinceLastUpdate < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceLastUpdate);
        return NextResponse.json(
          {
            success: false,
            message: `You can only update your location once per day. Please try again in ${hoursRemaining} hour${hoursRemaining > 1 ? "s" : ""}.`,
          },
          {
            status: 429,
          }
        );
      }
    }

    let formattedLocation = "Unknown Location";
    try {
      const geocodeResult = await geoLocation({
        latitude: body.latitude,
        longitude: body.longitude,
      });
      formattedLocation = formatLocation(geocodeResult);
    } catch (error) {
      console.error("Geocoding error:", error);
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLocation: new Date(),
        latitude: body.latitude,
        longitude: body.longitude,
        location: formattedLocation,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Location updated successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
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
