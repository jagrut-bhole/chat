import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send, Plus, Image, Camera, Settings, Users, LogOut, Trash2 } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface Message {
  id: string;
  text: string;
  sender: string;
  isMe: boolean;
  timestamp: Date;
}

const GROUP_DATA: Record<string, { name: string; memberCount: number; maxMembers?: number }> = {
  "1": { name: "Late Night Coders", memberCount: 24, maxMembers: 50 },
  "2": { name: "Startup Confessions", memberCount: 112 },
  "3": { name: "Design Roast", memberCount: 67, maxMembers: 100 },
  "4": { name: "Music Discovery", memberCount: 43 },
  "5": { name: "Fitness Accountability", memberCount: 31, maxMembers: 40 },
  "6": { name: "Book Club Anonymous", memberCount: 19 },
  "7": { name: "Side Project Show", memberCount: 88 },
  "8": { name: "Vent Room", memberCount: 204 },
};

const SAMPLE_MESSAGES: Message[] = [
  { id: "1", text: "Hey everyone! Just joined this group 👋", sender: "Anon_42", isMe: false, timestamp: new Date(Date.now() - 3600000) },
  { id: "2", text: "Welcome! Great to have you here.", sender: "Anon_17", isMe: false, timestamp: new Date(Date.now() - 3500000) },
  { id: "3", text: "Thanks! Excited to be part of this.", sender: "You", isMe: true, timestamp: new Date(Date.now() - 3400000) },
  { id: "4", text: "What's everyone working on today?", sender: "Anon_88", isMe: false, timestamp: new Date(Date.now() - 1800000) },
  { id: "5", text: "Building a side project with React 🚀", sender: "You", isMe: true, timestamp: new Date(Date.now() - 1700000) },
  { id: "6", text: "Nice! Share a screenshot when you can", sender: "Anon_42", isMe: false, timestamp: new Date(Date.now() - 900000) },
];

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function GroupChat() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES);
  const [input, setInput] = useState("");
  const [attachOpen, setAttachOpen] = useState(false);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const group = GROUP_DATA[id || ""] || { name: "Unknown Group", memberCount: 0 };
  const onlineCount = Math.max(1, Math.floor(group.memberCount * 0.3));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: crypto.randomUUID(),
      text: input.trim(),
      sender: "You",
      isMe: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = () => {
    setAttachOpen(false);
    fileInputRef.current?.click();
  };

  const handleCameraOpen = () => {
    setAttachOpen(false);
    cameraInputRef.current?.click();
  };

  const handleLeave = () => {
    setLeaveConfirm(false);
    router.back();
  };

  const handleDelete = () => {
    setDeleteConfirm(false);
    router.back();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-card">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">{group.name}</h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              {onlineCount} online
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {group.memberCount}{group.maxMembers ? `/${group.maxMembers}` : ""} members
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover">
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setLeaveConfirm(true)}>
              <LogOut className="h-4 w-4" />
              Leave Group
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive" onClick={() => setDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4" />
              Delete Group
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                msg.isMe
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}
            >
              {!msg.isMe && (
                <p className="text-xs font-semibold mb-0.5 opacity-70">{msg.sender}</p>
              )}
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t bg-card px-3 py-3">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setAttachOpen(true)}>
            <Plus className="h-5 w-5" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-muted border-0 px-4"
          />
          <Button size="icon" className="shrink-0 rounded-full" onClick={handleSend} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" />

      {/* Attachment modal */}
      <Dialog open={attachOpen} onOpenChange={setAttachOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Attach</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="justify-start gap-3 h-12" onClick={handleImageSelect}>
              <Image className="h-5 w-5 text-primary" />
              Upload Image
            </Button>
            <Button variant="outline" className="justify-start gap-3 h-12" onClick={handleCameraOpen}>
              <Camera className="h-5 w-5 text-primary" />
              Open Camera
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leave confirmation */}
      <AlertDialog open={leaveConfirm} onOpenChange={setLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Group?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll no longer receive messages from this group. You can rejoin anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeave}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All messages and members will be removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
