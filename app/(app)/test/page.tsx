"use client";

import { Button } from "@/components/ui/button";
import { userLocation } from "@/api-axios/authRequest";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function TEST() {
  const [error, setError] = useState<string>("");

  const { data: session } = useSession();

  const handleLocation = async () => {
    if (!session) {
      setError("Please sign in first");
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          if (isNaN(lat) || isNaN(lng)) {
            setError("Invalid coordinates received");
            return;
          }
          console.log("Sending location:", { latitude: lat, longitude: lng });
          try {
            const result = await userLocation({
              latitude: lat,
              longitude: lng,
            });
            console.log("Location updated successfully:", result);
            alert("Location updated!");
          } catch (error) {
            console.error("Error updating location:", error);
            setError("Failed to update location");
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Failed to get current location");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser");
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Button onClick={() => handleLocation()}>Get Location</Button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      <div className="border-amber-50 p-20">
        <h1>Hello World</h1>
        <ul>
          <li>Username: {session?.user?.username}</li>
          <li>CreatedAt: {session?.user?.createdAt}</li>
          <li>UserId: {session?.user?.id}</li>
        </ul>
      </div>
    </div>
  );
}
