import dynamic from 'next/dynamic';

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