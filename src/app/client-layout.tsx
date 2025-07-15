'use client';
import { ClerkProvider } from '@clerk/nextjs';

export default function ClerkWrapper({ children }: { children: React.ReactNode }) {
  // Handle missing Clerk keys gracefully in production
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!publishableKey && process.env.NODE_ENV === 'production') {
    // Return children without Clerk in production if key is missing
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey || 'pk_test_development'}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#D4AF37',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
} 