'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ClerkProvider } from '@clerk/nextjs';

export default function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isRouterReady, setIsRouterReady] = useState(false);
  
  useEffect(() => {
    // Ensure router context is available
    setIsRouterReady(true);
  }, [pathname]);
  
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#D4AF37',
        },
      }}
    >
      {isRouterReady ? children : <div>Loading...</div>}
    </ClerkProvider>
  );
} 