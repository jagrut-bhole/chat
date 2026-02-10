"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { userProfileRequest } from "@/api-axios/authRequest";
import { UserProfileSchema } from "@/types/Schemas/AuthSchema";
import { z } from "zod";

export default function Profile() {
    const [user, setUser] = useState<z.infer<typeof UserProfileSchema> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { status } = useSession();

    const fetchUserProfile = async () => {
        if (status === 'authenticated') {
            setLoading(true);
            setError(null);
            try {
                const userProfile = await userProfileRequest();
                const parsedUserProfile = UserProfileSchema.parse(userProfile);
                setUser(parsedUserProfile);
            } catch (error) {
                console.error("Error fetching user profile:", error);
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        } else if (status === 'unauthenticated') {
            setError("Please sign in to view your profile");
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUserProfile();
    }, [status]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!user || !user.data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>No profile data available</p>
            </div>
        );
    }

    const profileData = user.data;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-4 text-center">Your Profile</h1>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <p className="mt-1 text-sm text-gray-900">{profileData.username}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">User ID</label>
                        <p className="mt-1 text-sm text-gray-900">{profileData.id}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Created</label>
                        <p className="mt-1 text-sm text-gray-900">
                            {new Date(profileData.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last Location Update</label>
                        <p className="mt-1 text-sm text-gray-900">
                            {profileData.lastLocation ? new Date(profileData.lastLocation).toLocaleString() : 'Never'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Current Location</label>
                        {profileData.latitude !== null && profileData.longitude !== null ? (
                            <p className="mt-1 text-sm text-gray-900">
                                Latitude: {profileData.latitude.toFixed(6)}, Longitude: {profileData.longitude.toFixed(6)}
                            </p>
                        ) : (
                            <p className="mt-1 text-sm text-gray-500">Location not set</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}