"use client";

import Link from "next/link";
import { Bookmark, LogOut, Settings, User } from "lucide-react";

import { signOut } from "@/lib/auth-client";
import { getRank } from "@/lib/xp";
import { getStreakStatus } from "@/lib/streak";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StreakFlame } from "@/components/shared/streak-flame";
import type { ProfileSummary } from "@/lib/data/dashboard";

const ITEMS = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

/**
 * The sidebar's identity surface and account menu.
 *
 * Adapted from the kokonutui profile-dropdown pattern, with two substantive
 * departures. The reference showed name + email; `ProfileSummary` deliberately
 * carries no email (it's not needed anywhere else in the shell, and threading
 * PII through the layout for a subtitle isn't worth it), so the subtitle is
 * rank + streak — which is what a returning user actually wants to see. And the
 * avatar is initials on a gradient ring rather than a remote image, because the
 * app has no upload flow and a hard-coded stock photo would be a lie.
 *
 * `compact` is the collapsed-sidebar form: avatar only, anchored bottom-left.
 */
export function ProfileMenu({
  profile,
  compact = false,
  className,
}: {
  profile: ProfileSummary;
  compact?: boolean;
  className?: string;
}) {
  const rank = getRank(profile.level);
  const streakStatus = getStreakStatus(profile.currentStreak);
  const initials = profile.displayName.slice(0, 2).toUpperCase();

  // Gradient ring wraps the photo; `AvatarFallback` covers a missing or
  // failed-to-load image with initials, so there's never an empty circle.
  const avatar = (
    <span className="relative block shrink-0 rounded-full bg-gradient-to-br from-primary via-game-epic to-accent p-0.5">
      <Avatar className="h-9 w-9 bg-card after:border-0">
        {profile.avatarUrl && (
          <AvatarImage
            src={profile.avatarUrl}
            alt=""
            // Google's CDN 403s the request when a referrer is attached.
            referrerPolicy="no-referrer"
          />
        )}
        <AvatarFallback className="bg-card text-xs font-bold uppercase text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
    </span>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center rounded-2xl border border-border-subtle bg-card/50 transition-[background-color,border-color] duration-(--dur-fast) hover:border-border-strong hover:bg-card focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          compact ? "justify-center p-1" : "w-full gap-3 p-2.5",
          className,
        )}
        aria-label={`Account menu for ${profile.displayName}`}
      >
        {avatar}
        {!compact && (
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-medium leading-tight text-foreground">
              {profile.displayName}
            </span>
            <span className="mt-0.5 block truncate text-2xs leading-tight text-muted-foreground">
              {rank} · Lvl {profile.level}
            </span>
            <span className="mt-1 flex items-center gap-1 text-2xs">
              <StreakFlame status={streakStatus} className="h-3 w-3" />
              <span className="font-semibold text-foreground tabular-nums">
                {profile.currentStreak}
              </span>
              <span className="text-muted-foreground">day streak</span>
            </span>
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align={compact ? "start" : "center"}
        sideOffset={8}
        // The base popup pins itself to the trigger width, which would give a
        // 44px menu next to a collapsed avatar.
        className="w-60 min-w-60 rounded-2xl p-1.5"
      >
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
          {avatar}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {profile.displayName}
            </p>
            <p className="truncate text-2xs text-muted-foreground">
              {rank} · Level {profile.level} · {profile.xp.toLocaleString()} XP
            </p>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1.5" />

        {ITEMS.map((item) => (
          <DropdownMenuItem key={item.href} className="rounded-xl px-2 py-2" render={<Link href={item.href} />}>
            <item.icon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{item.label}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="my-1.5" />

        <DropdownMenuItem
          variant="destructive"
          className="rounded-xl px-2 py-2"
          onClick={() => void signOut()}
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
