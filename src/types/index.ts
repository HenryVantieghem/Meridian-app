// Export database types
export type { Database } from "./database";

// User Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
  subscription: Subscription;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  pushNotifications: boolean;
  timezone: string;
  language: string;
  persona: UserPersona;
}

export interface UserPersona {
  role: string;
  industry: string;
  communicationStyle: "formal" | "casual" | "professional";
  priorities: string[];
}

export interface Subscription {
  id: string;
  status: "active" | "canceled" | "past_due" | "unpaid";
  plan: "free" | "pro" | "enterprise";
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

// Email Types
export interface Email {
  id: string;
  userId: string;
  externalId: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: string;
  bodyHtml?: string;
  attachments: Attachment[];
  receivedAt: Date;
  read: boolean;
  starred: boolean;
  archived: boolean;
  labels: string[];
  threadId: string;
  priority: EmailPriority;
  analysis?: EmailAnalysis;
}

export interface EmailAddress {
  name?: string;
  email: string;
}

export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url?: string;
}

export interface EmailAnalysis {
  id: string;
  emailId: string;
  summary: string;
  keyPoints: string[];
  actionItems: ActionItem[];
  sentiment: "positive" | "negative" | "neutral";
  urgency: "high" | "medium" | "low";
  category: string;
  confidence: number;
  aiModel: string;
  createdAt: Date;
}

export interface ActionItem {
  id: string;
  description: string;
  dueDate?: Date;
  priority: "high" | "medium" | "low";
  completed: boolean;
  assignedTo?: string;
}

export type EmailPriority = "critical" | "high" | "medium" | "low" | "none";

// AI Types
export interface AIResponse<T = unknown> {
  data: T;
  confidence: number;
  model: string;
  tokens: number;
  processingTime: number;
}

export interface EmailAnalysisRequest {
  emailId: string;
  content: string;
  context?: {
    userRole: string;
    industry: string;
    recentEmails?: string[];
  };
}

export interface ReplyGenerationRequest {
  emailId: string;
  tone: "formal" | "casual" | "professional";
  length: "short" | "medium" | "long";
  includeActionItems: boolean;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface SignUpForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInForm {
  email: string;
  password: string;
}

export interface OnboardingForm {
  role: string;
  industry: string;
  communicationStyle: "formal" | "casual" | "professional";
  priorities: string[];
  emailIntegration: "gmail" | "outlook" | "other";
}

// Component Props Types
export interface ButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface InputProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Webhook Types
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: unknown;
  };
  created: number;
}

export interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name?: string;
    last_name?: string;
  };
}

// Utility Types
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// Theme Types
export type Theme = "light" | "dark" | "system";

// Notification Types
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Slack Types
export interface SlackMessage {
  id: string;
  userId: string;
  workspaceId: string;
  channelId: string;
  channelName: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date | string;
  reactions: Array<{
    emoji: string;
    count: number;
    users?: string[];
  }>;
  threadCount?: number;
  priority: "low" | "medium" | "high";
  read: boolean;
  archived: boolean;
  type?: "message" | "file" | "event";
}
