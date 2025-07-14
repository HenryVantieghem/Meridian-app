import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner, LoadingOverlay, Skeleton, CardSkeleton, EmailListSkeleton, DashboardSkeleton } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-8 w-8');
  });

  it('renders with custom variant', () => {
    render(<LoadingSpinner variant="primary" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('text-blue-600');
  });

  it('renders with text', () => {
    render(<LoadingSpinner text="Loading data..." showText />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    render(<LoadingSpinner icon={() => <div data-testid="custom-icon">Icon</div>} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('custom-class');
  });
});

describe('LoadingOverlay', () => {
  it('renders with default props', () => {
    render(<LoadingOverlay />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<LoadingOverlay text="Processing..." />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('renders with custom variant', () => {
    render(<LoadingOverlay variant="primary" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('text-blue-600');
  });

  it('renders without backdrop when showBackdrop is false', () => {
    render(<LoadingOverlay showBackdrop={false} />);
    const overlay = screen.getByText('Loading...').closest('div');
    expect(overlay).not.toHaveClass('bg-black/20');
  });
});

describe('Skeleton', () => {
  it('renders single line skeleton', () => {
    render(<Skeleton />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('h-4');
  });

  it('renders multiple line skeleton', () => {
    render(<Skeleton lines={3} />);
    const skeletons = screen.getAllByRole('status');
    expect(skeletons).toHaveLength(3);
  });

  it('renders with custom height', () => {
    render(<Skeleton height="h-8" />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('h-8');
  });

  it('applies custom className', () => {
    render(<Skeleton className="custom-skeleton" />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('custom-skeleton');
  });
});

describe('CardSkeleton', () => {
  it('renders card skeleton structure', () => {
    render(<CardSkeleton />);
    expect(screen.getByTestId('card-skeleton')).toBeInTheDocument();
  });

  it('renders avatar skeleton', () => {
    render(<CardSkeleton />);
    const avatar = screen.getByTestId('avatar-skeleton');
    expect(avatar).toHaveClass('w-10 h-10');
  });

  it('renders text skeletons', () => {
    render(<CardSkeleton />);
    const textSkeletons = screen.getAllByTestId('text-skeleton');
    expect(textSkeletons.length).toBeGreaterThan(0);
  });
});

describe('EmailListSkeleton', () => {
  it('renders with default count', () => {
    render(<EmailListSkeleton />);
    const emailSkeletons = screen.getAllByTestId('email-skeleton');
    expect(emailSkeletons).toHaveLength(5);
  });

  it('renders with custom count', () => {
    render(<EmailListSkeleton count={3} />);
    const emailSkeletons = screen.getAllByTestId('email-skeleton');
    expect(emailSkeletons).toHaveLength(3);
  });

  it('renders email skeleton structure', () => {
    render(<EmailListSkeleton count={1} />);
    const emailSkeleton = screen.getByTestId('email-skeleton');
    expect(emailSkeleton).toBeInTheDocument();
    expect(screen.getByTestId('email-avatar')).toBeInTheDocument();
    expect(screen.getByTestId('email-content')).toBeInTheDocument();
  });
});

describe('DashboardSkeleton', () => {
  it('renders dashboard skeleton structure', () => {
    render(<DashboardSkeleton />);
    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
  });

  it('renders header skeleton', () => {
    render(<DashboardSkeleton />);
    expect(screen.getByTestId('header-skeleton')).toBeInTheDocument();
  });

  it('renders sidebar skeleton', () => {
    render(<DashboardSkeleton />);
    expect(screen.getByTestId('sidebar-skeleton')).toBeInTheDocument();
  });

  it('renders main content skeleton', () => {
    render(<DashboardSkeleton />);
    expect(screen.getByTestId('main-content-skeleton')).toBeInTheDocument();
  });

  it('renders multiple card skeletons', () => {
    render(<DashboardSkeleton />);
    const cardSkeletons = screen.getAllByTestId('card-skeleton');
    expect(cardSkeletons.length).toBeGreaterThan(0);
  });
}); 