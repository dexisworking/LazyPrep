import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { SiteFooter } from "@/components/shared/site-footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark className="h-6 w-6" />
            <Wordmark className="text-lg" />
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-4 py-14">{children}</main>
      <SiteFooter />
    </div>
  );
}
