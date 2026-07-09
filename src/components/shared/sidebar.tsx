"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, BookOpen, Target, Brain, User, Settings, LogOut, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRank } from "@/lib/xp";

const routes = [
  {
    label: "Dashboard",
    icon: Zap,
    href: "/dashboard",
    color: "text-primary",
  },
  {
    label: "Courses",
    icon: BookOpen,
    href: "/courses",
    color: "text-accent",
  },
  {
    label: "Practice",
    icon: Target,
    href: "/practice",
    color: "text-np-red",
  },
  {
    label: "Flashcards",
    icon: Brain,
    href: "/flashcards",
    color: "text-np-success",
  },
  {
    label: "Profile",
    icon: User,
    href: "/profile",
    color: "text-primary",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-muted-foreground",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // Hardcoded defaults for MVP profile info until database link is established
  const userXp = 0;
  const userLevel = 1;
  const userStreak = 0;
  
  const displayName = session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "Explorer";
  const userRank = getRank(userLevel);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex h-full flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      {/* App Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border/50">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <Zap className="h-4 w-4 text-primary" />
        </div>
        <span className="text-lg font-bold tracking-tight">
          Net<span className="text-primary">Prep</span>
        </span>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 space-y-1 px-4 py-6">
        {routes.map((route) => {
          const isActive = pathname === route.href || pathname?.startsWith(`${route.href}/`);
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-2 border-primary pl-2.5" : "text-muted-foreground"
              )}
            >
              <route.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", route.color)} />
              {route.label}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile Section */}
      <div className="border-t border-border/50 p-4 space-y-3">
        <div className="flex items-center gap-3 rounded-lg bg-card/30 p-3 border border-border/40">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
              {displayName.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-medium leading-none truncate text-foreground">
              {displayName}
            </h4>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              {userRank} (Lvl {userLevel})
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
