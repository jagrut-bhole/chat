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

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-foreground text-white backdrop-blur supports-backdrop-filter:bg-black/60">
      <div className="mx-auto flex h-18 max-w-552 items-center justify-between px-6">
        <Link href="/" className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading, inherit)" }}>
          AnonChat
        </Link>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-1.5 cursor-pointer">
            <MessageCircle className="h-4 w-4 text-foreground " />
            <span className="hidden sm:inline text-foreground">Chat with Random</span>
            <span className="sm:hidden">Random</span>
          </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">A</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-black">
            <DropdownMenuItem className="gap-2 cursor-pointer text-white">
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer text-red-500">
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
