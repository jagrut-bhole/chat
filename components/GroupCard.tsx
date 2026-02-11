"use client";
import { Users, Calendar, CheckCircle, ArrowRight, LogIn } from "lucide-react";
interface GroupCardProps {
  name: string;
  description: string;
  memberCount: number;
  maxMembers?: number;
  expiryDate?: string;
  isJoined: boolean;
  onAction: () => void;
}
// Generate a deterministic emoji icon based on group name
function getGroupIcon(name: string): string {
  const icons = ["🎮", "🚀", "🎨", "🎵", "💪", "📚", "⚡", "🔥", "💬", "🌟", "🧪", "🎯"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return icons[Math.abs(hash) % icons.length];
}
// Generate a deterministic neutral background based on group name
function getIconColor(name: string): string {
  const colors = [
    "bg-zinc-800 text-zinc-100",
    "bg-stone-800 text-stone-100",
    "bg-neutral-800 text-neutral-100",
    "bg-slate-800 text-slate-100",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
export default function GroupCard({
  name,
  description,
  memberCount,
  maxMembers,
  expiryDate,
  isJoined,
  onAction,
}: GroupCardProps) {
  const icon = getGroupIcon(name);
  const iconColor = getIconColor(name);
  const formattedExpiry = expiryDate
    ? new Date(expiryDate).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
    : null;
  return (
    <div className="group relative flex flex-col rounded-xl border border-zinc-800 bg-black/40 p-5 transition-all duration-300 hover:border-zinc-700 hover:bg-black/60">
      {/* Icon + Badge row */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-12 h-12 rounded-xl ${iconColor} flex items-center justify-center text-xl shadow-sm ring-1 ring-white/10`}
        >
          {icon}
        </div>
        {isJoined && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400 border border-green-500/20">
            <CheckCircle className="w-3 h-3" />
            Joined
          </span>
        )}
      </div>
      {/* Name */}
      <h3 className="text-sm font-semibold text-white mb-1.5 line-clamp-1">{name}</h3>
      {/* Description */}
      <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-3 flex-1">
        {description}
      </p>
      {/* Meta row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 text-zinc-500">
          <Users className="w-3.5 h-3.5" />
          <span className="text-xs">
            {maxMembers ? `${memberCount} / ${maxMembers}` : `${memberCount} members`}
          </span>
        </div>
        {formattedExpiry && (
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs">{formattedExpiry}</span>
          </div>
        )}
      </div>
      {/* Action button */}
      {isJoined ? (
        <button
          onClick={onAction}
          className="w-full py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium transition-all duration-200 hover:bg-zinc-800 cursor-pointer border border-zinc-800 hover:border-zinc-700 flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span className="hidden sm:inline">Enter Group</span>
        </button>
      ) : (
        <button
          onClick={onAction}
          className="w-full py-2.5 rounded-lg bg-white text-black text-sm font-medium transition-all duration-200 hover:bg-zinc-200 cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          <span className="hidden sm:inline">Join Group</span>
        </button>
      )}
    </div>
  );
}
