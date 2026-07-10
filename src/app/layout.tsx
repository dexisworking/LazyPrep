import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SwRegister } from "@/components/shared/sw-register";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const APP_NAME = "NetPrep";
const APP_TITLE = "NetPrep — The Preparation Operating System";
const APP_DESCRIPTION =
  "Your complete preparation operating system for certifications, competitive exams, and professional training. Study smarter with gamified learning, smart revision, and real-time analytics.";

export const metadata: Metadata = {
  metadataBase: new URL("https://netprep.iamdex.codes"),
  title: {
    default: APP_TITLE,
    template: "%s | NetPrep",
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "exam preparation",
    "AI course generator",
    "certification prep",
    "competitive exams",
    "spaced repetition",
    "flashcards",
    "study platform",
  ],
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    url: "https://netprep.iamdex.codes",
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
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${geist.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <SwRegister />
      </body>
    </html>
  );
}
