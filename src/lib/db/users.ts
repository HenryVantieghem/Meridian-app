import { supabase, supabaseAdmin } from "./supabase";
import { User, UserPreferences, Subscription } from "@/types";

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        *,
        user_preferences (*),
        subscriptions (*)
      `,
      )
      .eq("clerk_id", clerkId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // User not found
      }
      throw error;
    }

    return data as User;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to get user");
  }
}

/**
 * Create new user
 */
export async function createUser(userData: {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}): Promise<User> {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        clerk_id: userData.clerkId,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        avatar_url: userData.avatarUrl,
      })
      .select(
        `
        *,
        user_preferences (*),
        subscriptions (*)
      `,
      )
      .single();

    if (error) {
      throw error;
    }

    return data as User;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to create user");
  }
}

/**
 * Update user profile
 */
export async function updateUser(
  clerkId: string,
  updates: Partial<Pick<User, "firstName" | "lastName" | "avatarUrl">>,
): Promise<User> {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        avatar_url: updates.avatarUrl,
      })
      .eq("clerk_id", clerkId)
      .select(
        `
        *,
        user_preferences (*),
        subscriptions (*)
      `,
      )
      .single();

    if (error) {
      throw error;
    }

    return data as User;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to update user");
  }
}

/**
 * Get user preferences
 */
export async function getUserPreferences(
  clerkId: string,
): Promise<UserPreferences | null> {
  try {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq(
        "user_id",
        supabase.from("users").select("id").eq("clerk_id", clerkId).single(),
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as UserPreferences;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to get user preferences");
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  clerkId: string,
  updates: Partial<UserPreferences>,
): Promise<UserPreferences> {
  try {
    const { data, error } = await supabase
      .from("user_preferences")
      .update(updates)
      .eq(
        "user_id",
        supabase.from("users").select("id").eq("clerk_id", clerkId).single(),
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data as UserPreferences;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to update user preferences");
  }
}

/**
 * Get user subscription
 */
export async function getUserSubscription(
  clerkId: string,
): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq(
        "user_id",
        supabase.from("users").select("id").eq("clerk_id", clerkId).single(),
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as Subscription;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to get user subscription");
  }
}

/**
 * Update user subscription
 */
export async function updateUserSubscription(
  clerkId: string,
  updates: Partial<Subscription>,
): Promise<Subscription> {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .update(updates)
      .eq(
        "user_id",
        supabase.from("users").select("id").eq("clerk_id", clerkId).single(),
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data as Subscription;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to update user subscription");
  }
}

/**
 * Delete user account
 */
export async function deleteUser(clerkId: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("clerk_id", clerkId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to delete user");
  }
}

/**
 * Check if user exists
 */
export async function userExists(clerkId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return false;
      }
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to check if user exists");
  }
}
