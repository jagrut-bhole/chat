"use client";
import { useState, useRef } from "react";
import RandomChatModal from "@/components/modals/RandomChatModal";
import MatchingPage from "@/components/RandomChat/MatchingPage";
import ChatPage from "@/components/RandomChat/RandomChat";
import { User, LogOut, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type RandomChatState = "idle" | "confirming" | "matching" | "chatting";

export default function DashboardHeader() {
  const [chatState, setChatState] = useState<RandomChatState>("idle");
  const [partnerName, setPartnerName] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    // Clear all cookies
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    // Sign out and redirect to home
    await signOut({ redirect: false });
    router.push("/");
  };

  const handleMatched = (ws: WebSocket, name: string) => {
    wsRef.current = ws;
    setPartnerName(name);
    setChatState("chatting");
  };

  const handleLeaveChat = () => {
    wsRef.current = null;
    setPartnerName("");
    setChatState("idle");
  };

  const handleFindNew = () => {
    wsRef.current = null;
    setPartnerName("");
    setChatState("matching");
  };

  const userId = session?.user?.id || "";
  const username = session?.user?.username || "";

  return (
    <>
      {/* Only show header when not in matching/chatting state */}
      {chatState !== "matching" && chatState !== "chatting" && (
        <header className="sticky top-0 z-40 w-full bg-foreground text-white backdrop-blur supports-backdrop-filter:bg-black/60">
          <div className="mx-auto flex h-18 max-w-552 items-center justify-between px-6">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              AnonChat
            </Link>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="gap-1.5 cursor-pointer"
                onClick={() => setChatState("confirming")}
              >
                <MessageCircle className="h-4 w-4 text-foreground " />
                <span className="hidden sm:inline text-foreground">Chat with Random</span>
                <span className="sm:hidden">Random</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        A
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-black">
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-white"
                    onClick={() => router.push("/profile")}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-red-500"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
      )}

      {/* Confirmation Modal */}
      <RandomChatModal
        isOpen={chatState === "confirming"}
        onClose={() => setChatState("idle")}
        onConfirm={() => setChatState("matching")}
      />

      {/* Matching Page — searching for partner */}
      {chatState === "matching" && userId && (
        <MatchingPage
          userId={userId}
          username={username}
          onMatched={handleMatched}
          onCancel={() => setChatState("idle")}
        />
      )}

      {/* Active Random Chat */}
      {chatState === "chatting" && wsRef.current && (
        <div className="fixed inset-0 z-50 bg-black">
          <ChatPage
            ws={wsRef.current}
            partnerName={partnerName}
            onLeave={handleLeaveChat}
            onFindNew={handleFindNew}
          />
        </div>
      )}
    </>
  );
}
