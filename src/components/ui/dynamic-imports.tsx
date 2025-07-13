import dynamic from 'next/dynamic';

// Dynamic imports for heavy components
export const DynamicRichTextEditor = dynamic(
  () => import('./RichTextEditor').then((mod) => mod.RichTextEditor),
  {
    loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded" />,
    ssr: false,
  }
);

export const DynamicChart = dynamic(
  () => import('./Chart').then((mod) => mod.Chart),
  {
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
    ssr: false,
  }
);

export const DynamicGPTClient = dynamic(
  () => import('@/lib/ai/openai-client').then((mod) => mod.OpenAIClient),
  {
    loading: () => <div className="h-16 bg-gray-100 animate-pulse rounded" />,
    ssr: false,
  }
);

// Lazy load heavy UI components
export const DynamicEmailComposer = dynamic(
  () => import('@/components/email/ReplyComposer').then((mod) => mod.ReplyComposer),
  {
    loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded" />,
  }
);

export const DynamicSlackMessageList = dynamic(
  () => import('@/components/slack/MessageList').then((mod) => mod.MessageList),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded" />,
  }
);

export const DynamicBillingPortal = dynamic(
  () => import('@/components/billing/BillingPortal').then((mod) => mod.BillingPortal),
  {
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
  }
); 