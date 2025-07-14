import { clerkClient } from '@clerk/nextjs/server';
import { createUser, getUserByClerkId, userExists } from '@/lib/db/users';
import { verifyToken as clerkVerifyToken } from '@clerk/clerk-sdk-node';

/**
 * Clerk configuration for JWT templates and OAuth providers
 */
export const clerkConfig = {
  // JWT template for Supabase integration
  jwtTemplate: {
    name: 'supabase',
    claims: {
      sub: '{{user.id}}',
      email: '{{user.primary_email_address.email_address}}',
      name: '{{user.first_name}} {{user.last_name}}',
      picture: '{{user.image_url}}',
      aud: 'authenticated',
      role: 'authenticated',
      exp: '{{exp}}',
      iat: '{{iat}}',
    },
  },
  
  // OAuth providers configuration
  oauthProviders: {
    google: {
      clientId: process.env.CLERK_GOOGLE_CLIENT_ID,
      clientSecret: process.env.CLERK_GOOGLE_CLIENT_SECRET,
    },
    microsoft: {
      clientId: process.env.CLERK_MICROSOFT_CLIENT_ID,
      clientSecret: process.env.CLERK_MICROSOFT_CLIENT_SECRET,
    },
  },
  
  // Security settings
  security: {
    rateLimit: {
      signIn: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
      signUp: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
    },
    session: {
      maxAge: 7 * 24 * 60 * 60, // 7 days
      updateAge: 24 * 60 * 60, // 24 hours
    },
  },
};

/**
 * Get Clerk user and create/update database user
 */
export async function getOrCreateUser(clerkId: string) {
  try {
    // Get user from database
    let user = await getUserByClerkId(clerkId);
    
    if (!user) {
      // Get Clerk user data
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(clerkId);
      
      if (!clerkUser) {
        throw new Error('Clerk user not found');
      }
      
      // Create user in database
      user = await createUser({
        clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        avatarUrl: clerkUser.imageUrl || undefined,
      });
    }
    
    return user;
  } catch (error) {
    console.error('Error getting or creating user:', error);
    throw error;
  }
}

/**
 * Sync user data from Clerk to database
 */
export async function syncUserFromClerk(clerkId: string) {
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkId);
    
    if (!clerkUser) {
      throw new Error('Clerk user not found');
    }
    
    const exists = await userExists(clerkId);
    
    if (!exists) {
      // Create new user
      return await createUser({
        clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        avatarUrl: clerkUser.imageUrl || undefined,
      });
    } else {
      // Update existing user
      const { updateUser } = await import('@/lib/db/users');
      return await updateUser(clerkId, {
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        avatarUrl: clerkUser.imageUrl || undefined,
      });
    }
  } catch (error) {
    console.error('Error syncing user from Clerk:', error);
    throw error;
  }
}

/**
 * Handle user deletion from Clerk
 */
export async function handleUserDeletion(clerkId: string) {
  try {
    const { deleteUser } = await import('@/lib/db/users');
    await deleteUser(clerkId);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Get user session data
 */
export async function getUserSession(clerkId: string) {
  try {
    const user = await getOrCreateUser(clerkId);
    const { getUserPreferences, getUserSubscription } = await import('@/lib/db/users');
    
    const [preferences, subscription] = await Promise.all([
      getUserPreferences(clerkId),
      getUserSubscription(clerkId),
    ]);
    
    return {
      user,
      preferences,
      subscription,
    };
  } catch (error) {
    console.error('Error getting user session:', error);
    throw error;
  }
}

/**
 * Validate user access to features based on subscription
 */
export function hasFeatureAccess(
  subscription: unknown,
  feature: 'email_analysis' | 'ai_replies' | 'priority_alerts' | 'advanced_analytics'
): boolean {
  if (!subscription) return false;
  
  const featureAccess: Record<string, Record<string, boolean>> = {
    free: {
      email_analysis: true,
      ai_replies: false,
      priority_alerts: false,
      advanced_analytics: false,
    },
    pro: {
      email_analysis: true,
      ai_replies: true,
      priority_alerts: true,
      advanced_analytics: false,
    },
    enterprise: {
      email_analysis: true,
      ai_replies: true,
      priority_alerts: true,
      advanced_analytics: true,
    },
  };
  
  const plan = (subscription as { plan?: string }).plan || 'free';
  return featureAccess[plan]?.[feature] || false;
}

/**
 * Get user's current plan limits
 */
export function getPlanLimits(subscription: unknown) {
  const plan = (subscription as { plan?: string })?.plan || 'free';
  
  const limits: Record<string, unknown> = {
    free: {
      emailsPerMonth: 100,
      aiAnalysesPerMonth: 50,
      storageGB: 1,
      teamMembers: 1,
    },
    pro: {
      emailsPerMonth: 1000,
      aiAnalysesPerMonth: 500,
      storageGB: 10,
      teamMembers: 5,
    },
    enterprise: {
      emailsPerMonth: -1, // Unlimited
      aiAnalysesPerMonth: -1, // Unlimited
      storageGB: 100,
      teamMembers: -1, // Unlimited
    },
  };
  
  return limits[plan] || limits.free;
}

/**
 * Rate limiting utility for authentication attempts
 */
export class RateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number }>();
  
  isRateLimited(identifier: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return false;
    }
    
    if (record.count >= maxAttempts) {
      return true;
    }
    
    record.count++;
    return false;
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

/**
 * Security logging utility
 */
export function logSecurityEvent(event: string, userId?: string, details?: unknown) {
  console.log(`[SECURITY] ${event}`, {
    userId,
    timestamp: new Date().toISOString(),
    details,
  });
} 

/**
 * Verify JWT token from Clerk
 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const payload = await clerkVerifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY || '',
      audience: process.env.NEXT_PUBLIC_APP_URL || '',
      authorizedParties: [process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''],
      issuer: process.env.CLERK_ISSUER || '',
    });
    return !!payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
} 