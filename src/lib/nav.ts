import {
  Zap,
  BookOpen,
  Target,
  Brain,
  User,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavRoute = {
  label: string;
  icon: LucideIcon;
  href: string;
  /** Accent class for the icon. */
  color: string;
  /** Shown in the mobile bottom tab bar (max 5). */
  mobilePrimary: boolean;
};

/**
 * Single source of truth for app navigation — consumed by the desktop
 * sidebar, the mobile sheet drawer, and the mobile bottom tab bar.
 */
export const navRoutes: NavRoute[] = [
  { label: "Dashboard", icon: Zap, href: "/dashboard", color: "text-primary", mobilePrimary: true },
  { label: "Courses", icon: BookOpen, href: "/courses", color: "text-accent", mobilePrimary: true },
  { label: "Practice", icon: Target, href: "/practice", color: "text-np-red", mobilePrimary: true },
  { label: "Flashcards", icon: Brain, href: "/flashcards", color: "text-np-success", mobilePrimary: true },
  { label: "Profile", icon: User, href: "/profile", color: "text-primary", mobilePrimary: true },
  { label: "Settings", icon: Settings, href: "/settings", color: "text-muted-foreground", mobilePrimary: false },
];

export function isRouteActive(pathname: string | null, href: string): boolean {
  return pathname === href || Boolean(pathname?.startsWith(`${href}/`));
}
