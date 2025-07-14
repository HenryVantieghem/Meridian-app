import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAuth } from '@clerk/nextjs';
import ProtectedRoute from './ProtectedRoute';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  it('should render children when user is authenticated', () => {
    (useAuth as jest.MockedFunction<typeof useAuth>).mockReturnValue({
      userId: 'test-user-id',
      isSignedIn: true,
      isLoaded: true,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show loading state when auth is not loaded', () => {
    (useAuth as jest.MockedFunction<typeof useAuth>).mockReturnValue({
      userId: null,
      isSignedIn: false,
      isLoaded: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to sign-in when user is not authenticated', () => {
    (useAuth as jest.MockedFunction<typeof useAuth>).mockReturnValue({
      userId: null,
      isSignedIn: false,
      isLoaded: true,
    });

    const mockPush = vi.fn();
    vi.mock('next/navigation', () => ({
      useRouter: () => ({
        push: mockPush,
      }),
    }));

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(mockPush).toHaveBeenCalledWith('/sign-in');
  });

  it('should show access denied message when user is not authenticated', () => {
    (useAuth as jest.MockedFunction<typeof useAuth>).mockReturnValue({
      userId: null,
      isSignedIn: false,
      isLoaded: true,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Please sign in to access this page.')).toBeInTheDocument();
  });
}); 