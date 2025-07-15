// Explicit exports from each module to avoid conflicts
export type { EmailMessage, EmailProvider, FetchOptions } from "./fetcher";
export { EmailFetchError, EmailFetcher } from "./fetcher";

export type { GmailEmail, GmailAttachment } from "./gmail-sync";
export { GmailClient } from "./gmail-sync";

export { EmailProcessor } from "./processor";
export type {
  ProcessingJob,
  ProcessingResult,
  ProcessingOptions,
} from "./processor";
export { ProcessingError } from "./processor";

export { EmailSyncService, emailSyncService } from "./sync-service";
export type { SyncOptions, SyncResult } from "./sync-service";

export {
  EMAIL_TYPES,
  EMAIL_PRIORITY,
  sendEmail,
  renderEmailTemplate,
  AUTOMATION_TRIGGERS,
  AUTOMATION_SCHEDULES,
  EmailAutomationService,
} from "./automation";
export type { EmailAutomation } from "./automation";

export {
  getEmailStats,
  getEmailAnalytics,
  exportEmailData,
} from "./management";
export type { EmailStats, EmailAnalytics } from "./management";

export { testEmailConnection, validateEmailConfig } from "./test";
export type { EmailTestResult } from "./test";

// Email types and interfaces
export interface Email {
  id: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  body: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  timestamp: Date;
  read: boolean;
  starred: boolean;
  labels: string[];
  threadId: string;
  messageId: string;
  inReplyTo?: string;
  references?: string[];
  priority: "high" | "normal" | "low";
  size: number;
  snippet: string;
  provider: "gmail" | "outlook" | "slack";
  metadata?: Record<string, unknown>;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  data?: Buffer;
  url?: string;
}
