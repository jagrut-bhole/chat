"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Send,
  Settings,
  Users,
  LogOut,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { toast } from "sonner";

// --- Types ---
interface ChatMessage {
  id: string;
  groupId: string;
  userId: string;
  username: string;
  content: string | null;
  createdAt: string;
}

interface GroupInfo {
  id: string;
  name: string;
  memberCount: number;
  maxMembers?: number | null;
}

// --- Helpers ---
function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateSeparator(dateStr: string) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${day}-${month}-${year} · ${time}`;
}

function isSameDay(d1: string, d2: string) {
  const a = new Date(d1);
  const b = new Date(d2);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

export default function GroupChat() {
  const { id: groupId } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const isAtBottomRef = useRef(true);
  const initialScrollDone = useRef(false);

  const currentUserId = session?.user?.id;
  const currentUsername = session?.user?.username;

  // --- Fetch group info ---
  const fetchGroupInfo = useCallback(async () => {
    try {
      const response = await axios.get("/api/group/joined");
      if (response.data.success && response.data.data) {
        const group = response.data.data.find(
          (g: GroupInfo) => g.id === groupId
        );
        if (group) {
          setGroupInfo(group);
        }
      }
    } catch (err) {
      console.error("Error fetching group info:", err);
    }
  }, [groupId]);

  // --- Fetch messages (initial + pagination) ---
  const fetchMessages = useCallback(
    async (cursor?: string | null) => {
      try {
        const params = new URLSearchParams({ groupId: groupId });
        if (cursor) params.set("cursor", cursor);

        const response = await axios.get(
          `/api/group/chat?${params.toString()}`
        );

        if (response.data.success) {
          const { messages: newMessages, nextCursor: newCursor, hasMore: more } =
            response.data.data;

          if (cursor) {
            // Loading older messages (prepend)
            setMessages((prev) => [...newMessages, ...prev]);
          } else {
            // Initial load
            setMessages(newMessages);
          }

          setNextCursor(newCursor);
          setHasMore(more);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        toast.error("Failed to load messages");
      }
    },
    [groupId]
  );

  // --- WebSocket connection ---
  useEffect(() => {
    if (!currentUserId || !currentUsername || !groupId) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Connected");
      setConnected(true);

      // Join the group room
      ws.send(
        JSON.stringify({
          type: "join",
          groupId: groupId,
          userId: currentUserId,
          username: currentUsername,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "new_message") {
          const msg: ChatMessage = data.message;

          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });

          // Auto-scroll if user is at the bottom
          if (isAtBottomRef.current) {
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 50);
          }
        }

        if (data.type === "error") {
          console.error("[WS] Server error:", data.message);
        }
      } catch (err) {
        console.error("[WS] Parse error:", err);
      }
    };

    ws.onclose = () => {
      console.log("[WS] Disconnected");
      setConnected(false);
    };

    ws.onerror = (err) => {
      console.error("[WS] Error:", err);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [currentUserId, currentUsername, groupId]);

  // --- Initial data load ---
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchGroupInfo(), fetchMessages()]);
      setLoading(false);
    };
    init();
  }, [fetchGroupInfo, fetchMessages]);

  // --- Scroll to bottom on initial load ---
  useEffect(() => {
    if (!loading && messages.length > 0 && !initialScrollDone.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
      initialScrollDone.current = true;
    }
  }, [loading, messages.length]);

  // --- Scroll detection ---
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    // Check if at bottom
    isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 80;
    setShowScrollDown(!isAtBottomRef.current && messages.length > 0);

    // Check if at top → load more
    if (scrollTop < 100 && hasMore && !loadingMore) {
      loadOlderMessages();
    }
  }, [hasMore, loadingMore, messages.length]);

  // --- Load older messages ---
  const loadOlderMessages = useCallback(async () => {
    if (!hasMore || loadingMore || !nextCursor) return;

    setLoadingMore(true);
    const container = messagesContainerRef.current;
    const prevScrollHeight = container?.scrollHeight || 0;

    await fetchMessages(nextCursor);

    // Maintain scroll position after prepending
    requestAnimationFrame(() => {
      if (container) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeight;
      }
    });

    setLoadingMore(false);
  }, [hasMore, loadingMore, nextCursor, fetchMessages]);

  // --- Send message ---
  const handleSend = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(
      JSON.stringify({
        type: "message",
        content: input.trim(),
      })
    );

    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLeave = async () => {
    try {
      const response = await axios.delete("/api/group/leave-group", {
        data: { groupId: groupId },
      });
      if (response.data.success) {
        toast.success("Left the group");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Error leaving group:", err);
      toast.error("Failed to leave group");
    }
    setLeaveConfirm(false);
  };

  // const handleDelete = () => {
  //   setDeleteConfirm(false);
  //   router.push("/dashboard");
  // };

  // --- Render date separator ---
  const renderDateSeparator = (dateStr: string) => (
    <div className="flex items-center justify-center my-4">
      <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-full px-4 py-1.5">
        <span className="text-[11px] font-medium text-zinc-400 tracking-wide">
          {formatDateSeparator(dateStr)}
        </span>
      </div>
    </div>
  );

  // --- Render message ---
  const renderMessage = (msg: ChatMessage) => {
    const isMe = msg.userId === currentUserId;

    return (
      <div
        key={msg.id}
        className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
      >
        <div
          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMe
            ? "bg-white text-black rounded-br-md"
            : "bg-zinc-800/80 text-zinc-100 rounded-bl-md border border-zinc-700/50"
            }`}
        >
          {!isMe && (
            <p className="text-xs font-semibold mb-0.5 text-zinc-400">
              {msg.username}
            </p>
          )}
          <p className="text-sm leading-relaxed break-words">{msg.content}</p>
          <p
            className={`text-[10px] mt-1 ${isMe ? "text-black/50" : "text-zinc-500"
              }`}
          >
            {formatTime(msg.createdAt)}
          </p>
        </div>
      </div>
    );
  };

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-black items-center justify-center">
        <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
        <p className="text-zinc-500 mt-3 text-sm">Loading chat...</p>
      </div>
    );
  }

  const groupName = groupInfo?.name || "Group Chat";
  const memberCount = groupInfo?.memberCount || 0;
  const maxMembers = groupInfo?.maxMembers;

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/80 bg-black/95 backdrop-blur-md sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
          className="shrink-0 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white truncate">
            {groupName}
          </h1>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              {connected ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span className="text-green-400">Connected</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  <span className="text-red-400">Disconnected</span>
                </>
              )}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {memberCount}
              {maxMembers ? `/${maxMembers}` : ""} members
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-zinc-900 border-zinc-800"
          >
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-zinc-300 hover:text-white focus:text-white focus:bg-zinc-800"
              onClick={() => setLeaveConfirm(true)}
            >
              <LogOut className="h-4 w-4" />
              Leave Group
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            {/* <DropdownMenuItem
              className="gap-2 cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-zinc-800"
              onClick={() => setDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete Group
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative"
      >
        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-3">
            <div className="flex items-center gap-2 bg-zinc-800/60 rounded-full px-4 py-2">
              <Loader2 className="h-4 w-4 text-zinc-400 animate-spin" />
              <span className="text-xs text-zinc-400">Loading older messages...</span>
            </div>
          </div>
        )}

        {/* No more messages indicator */}
        {!hasMore && messages.length > 0 && (
          <div className="flex justify-center py-3">
            <div className="bg-zinc-800/40 border border-zinc-700/30 rounded-full px-4 py-1.5">
              <span className="text-[11px] text-zinc-500">Conversation Started!!</span>
            </div>
          </div>
        )}

        {/* Messages with date separators */}
        {messages.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl">
              💬
            </div>
            <div>
              <p className="text-white font-medium text-lg mb-1">
                No messages yet
              </p>
              <p className="text-zinc-500 text-sm">
                Be the first to say something!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const showDateSeparator =
              index === 0 ||
              !isSameDay(messages[index - 1].createdAt, msg.createdAt);

            return (
              <div key={msg.id}>
                {showDateSeparator && renderDateSeparator(msg.createdAt)}
                {renderMessage(msg)}
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollDown && (
        <div className="absolute bottom-20 right-6 z-10">
          <Button
            size="icon"
            onClick={scrollToBottom}
            className="rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 shadow-lg h-10 w-10 cursor-pointer"
          >
            <ChevronDown className="h-5 w-5 text-zinc-300" />
          </Button>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-zinc-800/80 bg-black/95 backdrop-blur-md px-3 py-3">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={connected ? "Type a message..." : "Connecting..."}
            disabled={!connected}
            className="flex-1 rounded-full bg-zinc-900 border-zinc-800 px-4 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700"
          />
          <Button
            size="icon"
            className="shrink-0 rounded-full bg-white text-black hover:bg-zinc-200 disabled:opacity-40 cursor-pointer"
            onClick={handleSend}
            disabled={!input.trim() || !connected}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Leave confirmation */}
      <AlertDialog open={leaveConfirm} onOpenChange={setLeaveConfirm}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Leave Group?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              You&apos;ll no longer receive messages from this group. You can
              rejoin anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeave}
              className="bg-white text-black hover:bg-zinc-200 cursor-pointer"
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete confirmation */}
      {/* <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Group?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This action cannot be undone. All messages and members will be
              removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  );
}
