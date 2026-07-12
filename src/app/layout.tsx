import type { Metadata, Viewport } from "next";
import { Geist, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SwRegister } from "@/components/shared/sw-register";
import { AppIconSync } from "@/components/shared/app-icon-sync";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
// Wordmark-only face: rounded geometric bold matching the LazyPrep reference.
const poppins = Poppins({ weight: ["600", "700"], subsets: ["latin"], variable: "--font-wordmark" });

const APP_NAME = "LazyPrep";
const APP_TITLE = "LazyPrep — The Preparation Operating System";
const APP_DESCRIPTION =
  "Your complete preparation operating system for certifications, competitive exams, and professional training. Study smarter with gamified learning, smart revision, and real-time analytics.";

export const metadata: Metadata = {
  metadataBase: new URL("https://lazyprep.iamdex.codes"),
  title: {
    default: APP_TITLE,
    template: "%s | LazyPrep",
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  category: "education",
  alternates: { canonical: "/" },
  authors: [{ name: "Dibyanshu Singh" }],
  creator: "Dibyanshu Singh",
  publisher: "LazyPrep",
  formatDetection: { telephone: false, email: false, address: false },
  keywords: [
    "exam preparation",
    "AI course generator",
    "AI study tutor",
    "certification prep",
    "CCNA",
    "competitive exams",
    "spaced repetition",
    "flashcards",
    "mock tests",
    "study platform",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    url: "https://lazyprep.iamdex.codes",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    creator: "@SekharDibyanshu",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  // app/icon.svg + app/icon.png are auto-injected by Next's file convention;
  // only the public apple-touch icon needs declaring here.
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable, poppins.variable)}>
      <body className={`${geist.variable} ${poppins.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <SwRegister />
        <AppIconSync />
        <Analytics />
      </body>
    </html>
  );
}
