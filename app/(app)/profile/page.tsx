"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userProfileRequest, updateLocation } from "@/api-axios/authRequest";
import { UserProfileSchema } from "@/types/Schemas/AuthSchema";
import { z } from "zod";
import { ArrowLeft, MapPin, Calendar, Lock, Shield, Map } from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal ";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Profile() {
  const [user, setUser] = useState<z.infer<typeof UserProfileSchema> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const { status } = useSession();
  const router = useRouter();

  const handleUpdateLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    const toastId = toast.loading("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await updateLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          if (response.success) {
            toast.success(response.message || "Location updated successfully", { id: toastId });

            await fetchUserProfile();
          } else {
            toast.error(response.message || "Failed to update location", { id: toastId });
          }
        } catch (error: any) {
          console.error("Error updating location:", error);
          toast.error(error?.message || "Failed to update location", { id: toastId });
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Failed to get your location. Please enable location access.", { id: toastId });
      }
    );
  };

  const fetchUserProfile = async () => {
    if (status === "authenticated") {
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
    } else if (status === "unauthenticated") {
      setError("Please sign in to view your profile");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!user || !user.data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">No profile data available</p>
      </div>
    );
  }

  const profileData = user.data;

  return (
    <div className="min-h-screen bg-black pt-10  ">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full max-w-2xl mx-auto pb-12 px-6 py-8"
      >
        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center text-zinc-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Main Card */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
          {/* Header/Banner */}
          <div className="h-32 bg-gradient-to-r from-zinc-800 to-zinc-700"></div>

          <div className="px-8 pb-8">
            {/* Avatar Row */}
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <img
                src={`https://ui-avatars.com/api/?name=${profileData.username}&background=ffffff&color=000000&size=128`}
                alt={profileData.username}
                className="w-28 h-28 rounded-3xl border-4 border-zinc-900 shadow-lg bg-zinc-900"
              />
            </div>

            {/* User Info Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">{profileData.username}</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {/* Member Since */}
              <div className="p-4 rounded-xl bg-black border border-zinc-800 flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl text-white">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Joined</p>
                  <p className="text-base font-semibold text-zinc-200">
                    {new Date(profileData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Groups Created Count */}
              <div className="p-4 rounded-xl bg-black border border-zinc-800 flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl text-white">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                    Groups Created
                  </p>
                  <p className="text-base font-semibold text-zinc-200">
                    {profileData.groupMemberships.length} Groups
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-t border-zinc-800/50"></div>

              {/* Location Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                  <MapPin size={18} className="text-white" />
                  <h3>Location Settings</h3>
                </div>
                <div className="bg-black p-5 rounded-xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-300 mb-1">Current Location</p>
                    <p className="text-xs text-zinc-500">
                      {profileData.location ||
                        (profileData.latitude
                          ? `${profileData.latitude.toFixed(4)}, ${profileData.longitude?.toFixed(4)}`
                          : "Not set")}
                    </p>
                  </div>
                  <button
                    onClick={handleUpdateLocation}
                    className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg border border-zinc-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <Map size={14} /> Update Location
                  </button>
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                  <Lock size={18} className="text-white" />
                  <h3>Security</h3>
                </div>
                <div className="bg-black p-5 rounded-xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-300 mb-1">Password</p>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <span className="text-xs tracking-[0.2em]">••••••••••••••••</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="py-2 px-4 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      </motion.div>
    </div>
  );
}
