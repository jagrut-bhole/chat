"use client";
import { Users, Calendar, CheckCircle } from "lucide-react";
interface JoinedGroupCardProps {
    name: string;
    description: string;
    memberCount: number;
    maxMembers?: number;
    expiryDate?: string;
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
export default function JoinedGroupCard({
    name,
    description,
    memberCount,
    maxMembers,
    expiryDate,
    onAction,
}: JoinedGroupCardProps) {
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
        <div className="group relative flex flex-col rounded-xl border border-zinc-800 bg-black/40 p-6 transition-all duration-300 hover:border-zinc-700 hover:bg-black/60">
            {/* Top row: Icon + Joined badge */}
            <div className="flex items-start justify-between mb-4">
                <div
                    className={`w-12 h-12 rounded-xl ${iconColor} flex items-center justify-center text-xl shadow-sm ring-1 ring-white/10`}
                >
                    {icon}
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400 border border-green-500/20">
                    <CheckCircle className="w-3 h-3" />
                    Joined
                </span>
            </div>
            {/* Name */}
            <h3 className="text-base font-semibold text-white mb-2">{name}</h3>
            {/* Description */}
            <p className="text-sm text-zinc-400 leading-relaxed mb-5">
                {description}
            </p>
            {/* Meta row */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-1.5 text-zinc-500">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-sm">
                        {maxMembers
                            ? `${memberCount} / ${maxMembers}`
                            : `${memberCount} members`}
                    </span>
                </div>
                {formattedExpiry && (
                    <div className="flex items-center gap-1.5 text-zinc-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-sm">{formattedExpiry}</span>
                    </div>
                )}
            </div>
            {/* Enter Group button */}
            <button
                onClick={onAction}
                className="w-full py-3 rounded-lg bg-zinc-900 text-white text-sm font-medium transition-all duration-200 hover:bg-zinc-800 cursor-pointer border border-zinc-800 hover:border-zinc-700"
            >
                Enter Group
            </button>
        </div>
    );
}