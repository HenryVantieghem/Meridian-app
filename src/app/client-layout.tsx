'use client';
import { ClerkProvider } from '@clerk/nextjs';
import * as React from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-brand-burgundy hover:bg-brand-burgundy-dark',
          card: 'shadow-soft',
          headerTitle: 'text-gray-900',
          headerSubtitle: 'text-gray-600',
          socialButtonsBlockButton: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
          formFieldInput: 'input-field',
          formFieldLabel: 'text-sm font-medium text-gray-900',
          formFieldLabelRow: 'mb-1',
                      footerActionLink: 'text-brand-burgundy hover:text-brand-burgundy-dark',
        },
        variables: {
          colorPrimary: '#D4AF37',
          colorBackground: '#FFFFFF',
          colorText: '#000000',
          colorTextSecondary: '#6B7280',
          colorInputBackground: '#FFFFFF',
          colorInputText: '#000000',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
} 