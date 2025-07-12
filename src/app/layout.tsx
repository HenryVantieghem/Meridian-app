import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./client-layout";

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
