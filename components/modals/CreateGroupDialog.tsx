"use client";
import { useState, useEffect, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGroup: (group: {
    name: string;
    description: string;
    maxMembers?: number;
    expiryDate?: Date;
  }) => void;
  children: ReactNode;
  isLoading?: boolean;
}
export default function CreateGroupDialog({
  open,
  onOpenChange,
  onCreateGroup,
  children,
  isLoading = false,
}: CreateGroupDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  // Reset form when dialog closes
  useEffect(() => {
    if (!open && !isLoading) {
      // Use setTimeout to avoid cascading renders
      const timer = setTimeout(() => {
        setName("");
        setDescription("");
        setMaxMembers("");
        setExpiryDate("");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isLoading) return;
    onCreateGroup({
      name: name.trim(),
      description: description.trim(),
      maxMembers: maxMembers ? parseInt(maxMembers, 10) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {isLoading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-100 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white font-medium">Creating group...</p>
          </div>
        </div>
      )}
      <DialogContent className="sm:max-w-md bg-black border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Group</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Set up your anonymous group. Others can discover and join it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="group-name" className="text-white text-sm">
              Group Name
            </Label>
            <Input
              id="group-name"
              placeholder="e.g. Late Night Coders"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:border-white focus-visible:ring-white/20"
              required
            />
          </div>
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="group-description" className="text-white text-sm">
              Description
            </Label>
            <Textarea
              id="group-description"
              placeholder="What's this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:border-white focus-visible:ring-white/20 min-h-20"
            />
          </div>
          {/* Max Members + Expiry row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-members" className="text-white text-sm">
                Max Members
                <span className="text-zinc-500 ml-1 font-normal">(optional)</span>
              </Label>
              <Input
                id="max-members"
                type="number"
                min="2"
                placeholder="50"
                value={maxMembers}
                onChange={(e) => setMaxMembers(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:border-white focus-visible:ring-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry-date" className="text-white text-sm">
                Expiry Date
                <span className="text-zinc-500 ml-1 font-normal">(optional)</span>
              </Label>
              <Input
                id="expiry-date"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:border-white focus-visible:ring-white/20 dark:scheme-dark"
              />
            </div>
          </div>
          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-zinc-800 bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900 disabled:opacity-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
            >
              Create Group
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
