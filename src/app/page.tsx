import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Napoleon - AI-Powered Email Management",
  description:
    "The luxury AI-powered productivity platform that transforms communication chaos into strategic clarity. Designed for C-level executives who demand excellence.",
  keywords: [
    "executive productivity",
    "AI strategic commander",
    "luxury productivity platform",
    "executive email management",
    "AI-powered prioritization",
    "C-level communication tools",
    "strategic AI assistant",
    "executive productivity platform",
  ],
  openGraph: {
    title: "Napoleon - AI-Powered Email Management",
    description:
      "The luxury AI-powered productivity platform that transforms communication chaos into strategic clarity. Designed for C-level executives who demand excellence.",
    type: "website",
    url: "/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Napoleon - Luxury AI Strategic Commander",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Napoleon - AI-Powered Email Management",
    description:
      "The luxury AI-powered productivity platform that transforms communication chaos into strategic clarity. Designed for C-level executives who demand excellence.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function LandingPage() {
  return (
    <div id="main-content" className="min-h-screen bg-white">
      {/* Simple Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-brand-burgundy/10 border border-brand-burgundy/20 mb-8">
              <span className="text-brand-burgundy font-medium text-sm">
                Luxury AI Strategic Commander
              </span>
            </div>
          </div>

          <h1 className="text-6xl text-black font-serif mb-6 leading-tight">
            Transform <span className="text-brand-burgundy">Chaos</span> into{" "}
            <span className="text-brand-burgundy">Clarity</span>.
          </h1>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Transform communication chaos into strategic clarity through
            intelligent email management, AI-powered prioritization, and
            luxury UX design. Designed for C-level executives who demand
            excellence.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <a
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-2xl px-8 py-4 bg-brand-burgundy text-white hover:bg-brand-burgundy/90 text-lg transition-all duration-200 font-medium"
            >
              Get Started
              <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl px-8 py-4 bg-white text-brand-burgundy border border-brand-burgundy/20 hover:bg-brand-burgundy/5 text-lg transition-all duration-200 font-medium"
            >
              <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-1v3M15 3v3M8.5 20l.94-3M15.5 20l-.94-3" />
              </svg>
              View Dashboard
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-12 text-gray-600">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Enterprise Security</span>
            </div>
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-medium">Lightning Performance</span>
            </div>
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-brand-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span className="text-sm font-medium">AI-Powered Intelligence</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
