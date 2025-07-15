import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only throw error if we're not in build mode and the variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV) {
    throw new Error("Missing Supabase environment variables");
  }
  // For build time, create a mock client
  console.warn(
    "Supabase environment variables not found, using mock client for build",
  );
}

// Client for browser usage (with RLS)
export const supabase = createClient<Database>(
  supabaseUrl || "https://mock.supabase.co",
  supabaseAnonKey || "mock-key",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        "x-application-name": "napoleon-app",
      },
    },
  },
);

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl || "https://mock.supabase.co",
  supabaseServiceKey || "mock-service-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        "x-application-name": "napoleon-app-admin",
      },
    },
  },
);

// Utility function to handle database errors
export function handleDatabaseError(error: unknown): never {
  console.error("Database error:", error);

  const dbError = error as { code?: string; message?: string };

  if (dbError.code === "23505") {
    throw new Error("Duplicate entry found");
  }

  if (dbError.code === "23503") {
    throw new Error("Referenced record not found");
  }

  if (dbError.code === "42P01") {
    throw new Error("Table not found");
  }

  throw new Error(dbError.message || "Database operation failed");
}

// Utility function to retry database operations
export async function retryDatabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: unknown }>,
  maxRetries = 3,
  delay = 1000,
): Promise<{ data: T | null; error: unknown }> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;

      const dbError = error as { code?: string };

      // Don't retry on certain errors
      if (
        dbError.code === "23505" ||
        dbError.code === "23503" ||
        dbError.code === "42P01"
      ) {
        throw error;
      }

      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, i)),
        );
      }
    }
  }

  throw lastError;
}
