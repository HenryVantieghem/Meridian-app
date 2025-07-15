import dynamic from "next/dynamic";
import { LoadingSpinner } from "./LoadingSpinner";

// Lazy load heavy dashboard components
export const ProductionDashboard = dynamic(
  () =>
    import("@/components/dashboard/ProductionDashboard").then((mod) => ({
      default: mod.ProductionDashboard,
    })),
  {
    loading: () => <LoadingSpinner size="lg" text="Loading dashboard..." />,
    ssr: false,
  },
);

export const AIActionSidebar = dynamic(
  () =>
    import("@/components/dashboard/AIActionSidebar").then((mod) => ({
      default: mod.AIActionSidebar,
    })),
  {
    loading: () => <LoadingSpinner size="md" text="Loading AI..." />,
    ssr: false,
  },
);

export const ContextPanel = dynamic(
  () =>
    import("@/components/dashboard/ContextPanel").then((mod) => ({
      default: mod.ContextPanel,
    })),
  {
    loading: () => <LoadingSpinner size="md" text="Loading context..." />,
    ssr: false,
  },
);

// Lazy load email components
export const EmailList = dynamic(
  () =>
    import("@/components/email/EmailList").then((mod) => ({
      default: mod.EmailList,
    })),
  {
    loading: () => <LoadingSpinner size="md" text="Loading emails..." />,
    ssr: false,
  },
);

export const ReplyComposer = dynamic(
  () =>
    import("@/components/email/ReplyComposer").then((mod) => ({
      default: mod.ReplyComposer,
    })),
  {
    loading: () => <LoadingSpinner size="sm" text="Loading composer..." />,
    ssr: false,
  },
);

// Lazy load Slack components
export const MessageList = dynamic(
  () =>
    import("@/components/slack/MessageList").then((mod) => ({
      default: mod.MessageList,
    })),
  {
    loading: () => <LoadingSpinner size="md" text="Loading messages..." />,
    ssr: false,
  },
);

export const ChannelSelector = dynamic(
  () =>
    import("@/components/slack/ChannelSelector").then((mod) => ({
      default: mod.ChannelSelector,
    })),
  {
    loading: () => <LoadingSpinner size="sm" text="Loading channels..." />,
    ssr: false,
  },
);

// Lazy load AI components
export const ConfidenceMeter = dynamic(
  () =>
    import("@/components/ai/ConfidenceMeter").then((mod) => ({
      default: mod.ConfidenceMeter,
    })),
  {
    loading: () => <LoadingSpinner size="sm" text="Loading AI..." />,
    ssr: false,
  },
);

// Lazy load billing components
export const BillingPortal = dynamic(
  () =>
    import("@/components/billing/BillingPortal").then((mod) => ({
      default: mod.BillingPortal,
    })),
  {
    loading: () => <LoadingSpinner size="md" text="Loading billing..." />,
    ssr: false,
  },
);

export const PricingCard = dynamic(
  () =>
    import("@/components/billing/PricingCard").then((mod) => ({
      default: mod.PricingCard,
    })),
  {
    loading: () => <LoadingSpinner size="sm" text="Loading pricing..." />,
    ssr: false,
  },
);

// Lazy load onboarding components
export const OnboardingModal = dynamic(
  () => import("@/components/onboarding/OnboardingModal"),
  {
    loading: () => <LoadingSpinner size="md" text="Loading onboarding..." />,
    ssr: false,
  },
);

// Lazy load performance monitoring
export const PerformanceMonitor = dynamic(
  () =>
    import("@/components/ui/PerformanceMonitor").then((mod) => ({
      default: mod.PerformanceMonitor,
    })),
  {
    loading: () => <LoadingSpinner size="sm" text="Loading metrics..." />,
    ssr: false,
  },
);

// Lazy load marketing components
export const Hero = dynamic(
  () =>
    import("@/components/marketing/Hero").then((mod) => ({
      default: mod.Hero,
    })),
  {
    loading: () => <LoadingSpinner size="lg" text="Loading..." />,
    ssr: true,
  },
);

export const Features = dynamic(
  () =>
    import("@/components/marketing/Features").then((mod) => ({
      default: mod.Features,
    })),
  {
    loading: () => <LoadingSpinner size="md" text="Loading features..." />,
    ssr: true,
  },
);

export const Pricing = dynamic(
  () =>
    import("@/components/marketing/Pricing").then((mod) => ({
      default: mod.Pricing,
    })),
  {
    loading: () => <LoadingSpinner size="md" text="Loading pricing..." />,
    ssr: true,
  },
);

// Lazy load micro-interactions
export const AIHover = dynamic(
  () =>
    import("@/components/email/AIHover").then((mod) => ({
      default: mod.AIHover,
    })),
  {
    loading: () => null,
    ssr: false,
  },
);

export const AINotification = dynamic(
  () =>
    import("@/components/email/AINotification").then((mod) => ({
      default: mod.AINotification,
    })),
  {
    loading: () => null,
    ssr: false,
  },
);

export const SwipeToDelegate = dynamic(
  () =>
    import("@/components/email/SwipeToDelegate").then((mod) => ({
      default: mod.SwipeToDelegate,
    })),
  {
    loading: () => null,
    ssr: false,
  },
);
