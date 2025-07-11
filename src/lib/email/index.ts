export * from './fetcher';
export * from './gmail-sync';
export * from './processor';
export * from './sync-service';
export * from './automation';
export * from './management';
export * from './test';

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
  priority: 'high' | 'normal' | 'low';
  size: number;
  snippet: string;
  provider: 'gmail' | 'outlook' | 'slack';
  metadata?: Record<string, any>;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  data?: Buffer;
  url?: string;
}

export interface EmailProvider {
  name: string;
  type: 'gmail' | 'outlook' | 'slack';
  enabled: boolean;
  config: Record<string, any>;
}

export interface FetchOptions {
  maxResults?: number;
  query?: string;
  labelIds?: string[];
  includeSpamTrash?: boolean;
  pageToken?: string;
}

export interface EmailFetcher {
  fetchEmails(options?: FetchOptions): Promise<Email[]>;
  fetchEmailById(id: string): Promise<Email | null>;
  sendEmail(email: Partial<Email>): Promise<void>;
  markAsRead(id: string): Promise<void>;
  markAsUnread(id: string): Promise<void>;
  addLabel(id: string, label: string): Promise<void>;
  removeLabel(id: string, label: string): Promise<void>;
  moveToTrash(id: string): Promise<void>;
  restoreFromTrash(id: string): Promise<void>;
} 