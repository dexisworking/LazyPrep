"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Zap, BookOpen, Target, Brain, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "@/lib/auth-client";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getRank } from "@/lib/xp";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userLevel = 1;
  const displayName = session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "Explorer";
  const userRank = getRank(userLevel);

  const handleSignOut = async () => {
    onClose();
    await signOut();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
      <DialogContent className="fixed inset-y-0 left-0 z-50 flex h-full w-[280px] flex-col border-r border-border bg-sidebar p-0 text-sidebar-foreground shadow-2xl transition-all duration-300 focus:outline-none data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight">
              Net<span className="text-primary">Prep</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {routes.map((route) => {
            const isActive = pathname === route.href || pathname?.startsWith(`${route.href}/`);
            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-2 border-primary pl-2.5"
                    : "text-muted-foreground"
                )}
              >
                <route.icon className={cn("h-4 w-4", route.color)} />
                {route.label}
              </Link>
            );
          })}
        </div>

        {/* User Card */}
        <div className="border-t border-border/50 p-4 space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-card/35 p-3 border border-border/40">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {displayName.slice(0, 2).toUpperCase()}
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
      </DialogContent>
    </Dialog>
  );
}
