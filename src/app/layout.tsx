import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ClerkWrapper from "./client-layout";

// Validate environment variables on app startup
import "@/lib/invariantEnv";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const playfair = Playfair_Display({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: "Napoleon - AI-Powered Email Management",
    template: "%s | Napoleon",
  },
  description: "Transform communication chaos into clarity through intelligent email management, AI-powered prioritization, and elegant UX design.",
  keywords: [
    "email management",
    "AI productivity",
    "email prioritization",
    "communication tools",
    "AI assistant",
    "productivity platform",
  ],
      authors: [{ name: "Napoleon Team" }],
    creator: "Napoleon",
    publisher: "Napoleon",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Napoleon - AI-Powered Email Management",
    description: "Transform communication chaos into clarity through intelligent email management, AI-powered prioritization, and elegant UX design.",
    siteName: "Napoleon",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
                  alt: "Napoleon - AI-Powered Email Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Napoleon - AI-Powered Email Management",
    description: "Transform communication chaos into clarity through intelligent email management, AI-powered prioritization, and elegant UX design.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={playfair.variable}>
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/playfair-display-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-brand-burgundy focus:text-white focus:px-4 focus:py-2 focus:rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-burgundy"
        >
          Skip to main content
        </a>
        <ClerkWrapper>{children}</ClerkWrapper>
      </body>
    </html>
  );
}
