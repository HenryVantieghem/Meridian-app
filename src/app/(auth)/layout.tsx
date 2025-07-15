import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Napoleon AI",
  description:
    "Sign in or create your account to access Napoleon AI, your AI Strategic Commander.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream to-white">
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
