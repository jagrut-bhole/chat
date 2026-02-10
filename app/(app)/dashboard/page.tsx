"use client";
import { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import GroupCard from "@/components/GroupCard";
import JoinedGroupCard from "@/components/JoinedGroupCard";
import CreateGroupDialog from "@/components/CreateGroupDialog";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";

import { createGroupRequest, joinGroupRequest, fetchJoinedGroupsRequest, fetchAllGroupsRequest } from "@/api-axios/groupRequest";
import { toast } from "sonner";

interface Group {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    maxMembers?: number | null;
    expiryDate?: string | null;
    createdAt: string;
}

type TabKey = "joined" | "all";
export default function Dashboard() {
    const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [activeTab, setActiveTab] = useState<TabKey>("joined");
    const [direction, setDirection] = useState<"left" | "right">("left");
    const [isAnimating, setIsAnimating] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [createLoading, setCreateLoading] = useState(false);
    const [joinLoading, setJoinLoading] = useState(false);

    // Fetch groups on mount
    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const [joinedResponse, allResponse] = await Promise.all([
                fetchJoinedGroupsRequest(),
                fetchAllGroupsRequest(),
            ]);

            if (joinedResponse.success && joinedResponse.data) {
                setJoinedGroups(joinedResponse.data);
            }

            if (allResponse.success && allResponse.data) {
                setAllGroups(allResponse.data);
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
            toast.error("Failed to load groups");
        } finally {
            setLoading(false);
        }
    };

    const switchTab = (tab: TabKey) => {
        if (tab === activeTab || isAnimating) return;
        setDirection(tab === "all" ? "left" : "right");
        setIsAnimating(true);
        setTimeout(() => {
            setActiveTab(tab);
            setIsAnimating(false);
        }, 250);
    };

    const handleCreateGroup = async (newGroup: {
        name: string;
        description: string;
        maxMembers?: number;
        expiryDate?: Date;
    }) => {
        try {
            // Get user's current location
            if (!navigator.geolocation) {
                toast.error("Geolocation is not supported by your browser");
                return;
            }

            setCreateLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const response = await createGroupRequest({
                            groupName: newGroup.name,
                            description: newGroup.description || "",
                            maxMembers: newGroup.maxMembers,
                            expiryDate: newGroup.expiryDate?.toISOString(),
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });

                        if (response.success) {
                            toast.success("Group created successfully!");
                            // Refresh groups
                            await fetchGroups();
                            setActiveTab("joined");
                            setCreateDialogOpen(false);
                        }
                    } catch (error: unknown) {
                        console.error("Error creating group:", error);
                        toast.error(error instanceof Error ? error.message : "Failed to create group");
                    } finally {
                        setCreateLoading(false);
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                    toast.error("Failed to get your location. Please enable location access.");
                    setCreateLoading(false);
                }
            );
        } catch (error) {
            console.error("Error in handleCreateGroup:", error);
            toast.error("Failed to create group");
            setCreateLoading(false);
        }
    };

    const handleJoin = async (id: string) => {
        setJoinLoading(true);
        try {
            const response = await joinGroupRequest({ groupId: id });
            
            if (response.success) {
                toast.success("Successfully joined the group!");
                // Refresh groups
                await fetchGroups();
            }
        } catch (error: unknown) {
            console.error("Error joining group:", error);
            toast.error(error instanceof Error ? error.message : "Failed to join group");
        } finally {
            setJoinLoading(false);
        }
    };

    const slideOut = isAnimating
        ? direction === "left"
            ? "animate-slide-out-left"
            : "animate-slide-out-right"
        : "";
    const slideIn = !isAnimating
        ? direction === "left"
            ? "animate-slide-in-right"
            : "animate-slide-in-left"
        : "";

  return (
    <div className="min-h-screen bg-black">
      {joinLoading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white font-medium">Joining group...</p>
          </div>
        </div>
      )}
      <DashboardHeader />
      <main className="mx-auto max-w-6xl px-6 py-8 md:py-12 space-y-8">
        {/* Header section */}
        <div className="flex flex-col gap-6">
          {/* Title row + Create button */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Groups
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Join anonymous communities or create your own
              </p>
            </div>
            <CreateGroupDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              onCreateGroup={handleCreateGroup}
              isLoading={createLoading}
            >
              <Button className="gap-1.5 bg-white text-black hover:bg-zinc-200 shadow-sm hover:shadow-md transition-all">
                <Plus className="h-4 w-4" />
                Create Group
              </Button>
            </CreateGroupDialog>
          </div>
          {/* Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex h-12 items-center rounded-xl bg-zinc-900/50 p-1.5 border border-zinc-800">
              <button
                onClick={() => switchTab("joined")}
                className={`inline-flex items-center justify-center rounded-lg px-6 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === "joined"
                    ? "bg-zinc-800 text-white shadow-sm ring-1 ring-white/10"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Joined Groups
                <span
                  className={`ml-2 text-xs rounded-full px-2 py-0.5 ${
                    activeTab === "joined"
                      ? "bg-black/30 text-white"
                      : "bg-black/20 text-zinc-500"
                  }`}
                >
                  {joinedGroups.length}
                </span>
              </button>
              <button
                onClick={() => switchTab("all")}
                className={`inline-flex items-center justify-center rounded-lg px-6 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === "all"
                    ? "bg-zinc-800 text-white shadow-sm ring-1 ring-white/10"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                All Groups
                <span
                  className={`ml-2 text-xs rounded-full px-2 py-0.5 ${
                    activeTab === "all"
                      ? "bg-black/30 text-white"
                      : "bg-black/20 text-zinc-500"
                  }`}
                >
                  {allGroups.length}
                </span>
              </button>
            </div>
          </div>
        </div>
        {/* Tab content with slide animation */}
        <div className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <p className="text-zinc-400">Loading groups...</p>
            </div>
          ) : (
            <div className={`${slideOut || slideIn}`}>
              {activeTab === "joined" && (
                <>
                  {joinedGroups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl mb-2">
                        👋
                      </div>
                      <div>
                        <p className="text-white font-medium text-lg mb-1">
                          No groups yet
                        </p>
                        <p className="text-zinc-500 text-sm">
                          You haven&apos;t joined any groups yet. Get started
                          below.
                        </p>
                      </div>
                      <div className="flex gap-3 mt-2">
                        <Button
                          onClick={() => setCreateDialogOpen(true)}
                          className="gap-1.5 bg-white text-black hover:bg-zinc-200 cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                          Create Group
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => switchTab("all")}
                          className="gap-1.5 bg-white text-black cursor-pointer hover:bg-zinc-200" 
                        >
                          Join a Group
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                      {joinedGroups.map((g) => (
                        <JoinedGroupCard
                          key={g.id}
                          name={g.name}
                          description={g.description}
                          memberCount={g.memberCount}
                          maxMembers={g.maxMembers || undefined}
                          expiryDate={g.expiryDate || undefined}
                          onAction={() => {}}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
              {activeTab === "all" && (
                <>
                  {allGroups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl mb-4">
                        🎉
                      </div>
                      <p className="text-white font-medium text-lg mb-1">
                        All caught up!
                      </p>
                      <p className="text-zinc-500 text-sm">
                        No groups available to join right now.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allGroups.map((g) => (
                        <GroupCard
                          key={g.id}
                          name={g.name}
                          description={g.description}
                          memberCount={g.memberCount}
                          maxMembers={g.maxMembers || undefined}
                          expiryDate={g.expiryDate || undefined}
                          isJoined={false}
                          onAction={() => handleJoin(g.id)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
