// Billing and subscription management components
// Following @.cursorrules payment specifications and design system

export { PricingCard } from "./PricingCard";
export { CheckoutButton } from "./CheckoutButton";
export { BillingPortal } from "./BillingPortal";
export { PaymentStatus } from "./PaymentStatus";

// Re-export types for external use
export type CheckoutButtonProps = {
  priceId: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
  onSuccess?: (sessionId: string) => void;
  onError?: (error: string) => void;
};
export type BillingPortalProps = {
  className?: string;
  onPortalOpen?: () => void;
  onPortalClose?: () => void;
};
export type PaymentStatusProps = {
  status: "success" | "error" | "loading" | "pending" | "canceled";
  message?: string;
  details?: string;
  sessionId?: string;
  subscriptionId?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
};
