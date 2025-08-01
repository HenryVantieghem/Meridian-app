import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "test_key";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test_anon_key";
process.env.STRIPE_SECRET_KEY = "sk_test_key";
process.env.OPENAI_API_KEY = "sk-test-key";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock Clerk
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    userId: "test-user-id",
    isSignedIn: true,
    isLoaded: true,
    sessionId: "test-session-id",
    getToken: vi.fn().mockResolvedValue("test-token"),
  }),
  useUser: () => ({
    user: {
      id: "test-user-id",
      emailAddresses: [{ emailAddress: "test@example.com" }],
      firstName: "Test",
      lastName: "User",
    },
    isLoaded: true,
  }),
  useClerk: () => ({
    signOut: vi.fn(),
    openSignIn: vi.fn(),
    openSignUp: vi.fn(),
    loaded: true,
  }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignInButton: ({ children }: { children: React.ReactNode }) => children,
  SignUpButton: ({ children }: { children: React.ReactNode }) => children,
  UserButton: () => React.createElement("div", {}, "User Button"),
}));

// Mock Framer Motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) =>
      React.createElement("div", props, children),
    button: ({ children, ...props }: any) =>
      React.createElement("button", props, children),
  },
  AnimatePresence: ({ children }: any) => children,
}));
