import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface GmailEmail {
  id: string;
  threadId: string;
  from: string;
  fromName: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  snippet: string;
  body: string;
  bodyHtml: string;
  date: Date;
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
  attachments: GmailAttachment[];
  priority: 'high' | 'medium' | 'low';
  category: 'primary' | 'social' | 'promotions' | 'updates' | 'forums';
}

export interface GmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  data?: string;
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface GmailLabel {
  id: string;
  name: string;
  type: 'system' | 'user';
  messagesTotal: number;
  threadsTotal: number;
}

export class GmailClient {
  private oauth2Client: OAuth2Client;
  private gmail: any;

  constructor(accessToken: string, refreshToken?: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * Get user profile information
   */
  async getProfile(): Promise<GmailProfile> {
    try {
      const response = await this.gmail.users.getProfile({
        userId: 'me',
      });

      return {
        emailAddress: response.data.emailAddress!,
        messagesTotal: parseInt(response.data.messagesTotal || '0'),
        threadsTotal: parseInt(response.data.threadsTotal || '0'),
        historyId: response.data.historyId!,
      };
    } catch (error) {
      throw new Error(`Failed to get Gmail profile: ${error}`);
    }
  }

  /**
   * Get all labels
   */
  async getLabels(): Promise<GmailLabel[]> {
    try {
      const response = await this.gmail.users.labels.list({
        userId: 'me',
      });

      return response.data.labels?.map((label: any) => ({
        id: label.id!,
        name: label.name!,
        type: label.type!,
        messagesTotal: parseInt(label.messagesTotal || '0'),
        threadsTotal: parseInt(label.threadsTotal || '0'),
      })) || [];
    } catch (error) {
      throw new Error(`Failed to get Gmail labels: ${error}`);
    }
  }

  /**
   * Get messages with optional filtering
   */
  async getMessages(options: {
    maxResults?: number;
    q?: string;
    labelIds?: string[];
    includeSpamTrash?: boolean;
  } = {}): Promise<GmailEmail[]> {
    try {
      const {
        maxResults = 50,
        q = '',
        labelIds = [],
        includeSpamTrash = false,
      } = options;

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults,
        q,
        labelIds,
        includeSpamTrash,
      });

      const messages = response.data.messages || [];
      const detailedMessages = await Promise.all(
        messages.map((message: any) => this.getMessage(message.id))
      );

      return detailedMessages.filter(Boolean) as GmailEmail[];
    } catch (error) {
      throw new Error(`Failed to get Gmail messages: ${error}`);
    }
  }

  /**
   * Get a single message by ID
   */
  async getMessage(messageId: string): Promise<GmailEmail | null> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      return this.parseMessage(response.data);
    } catch (error) {
      console.error(`Failed to get message ${messageId}:`, error);
      return null;
    }
  }

  /**
   * Mark message as read/unread
   */
  async markAsRead(messageId: string, read: boolean = true): Promise<void> {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: read ? ['UNREAD'] : [],
          addLabelIds: read ? [] : ['UNREAD'],
        },
      });
    } catch (error) {
      throw new Error(`Failed to mark message as ${read ? 'read' : 'unread'}: ${error}`);
    }
  }

  /**
   * Star/unstar message
   */
  async toggleStar(messageId: string, starred: boolean = true): Promise<void> {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: starred ? [] : ['STARRED'],
          addLabelIds: starred ? ['STARRED'] : [],
        },
      });
    } catch (error) {
      throw new Error(`Failed to ${starred ? 'star' : 'unstar'} message: ${error}`);
    }
  }

  /**
   * Move message to trash
   */
  async trashMessage(messageId: string): Promise<void> {
    try {
      await this.gmail.users.messages.trash({
        userId: 'me',
        id: messageId,
      });
    } catch (error) {
      throw new Error(`Failed to trash message: ${error}`);
    }
  }

  /**
   * Send email
   */
  async sendEmail(email: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    bodyHtml?: string;
    attachments?: GmailAttachment[];
  }): Promise<string> {
    try {
      const message = this.createMessage(email);
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: message,
        },
      });

      return response.data.id!;
    } catch (error) {
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  /**
   * Get history for real-time updates
   */
  async getHistory(startHistoryId: string): Promise<any[]> {
    try {
      const response = await this.gmail.users.history.list({
        userId: 'me',
        startHistoryId,
        historyTypes: ['messageAdded', 'messageDeleted', 'labelAdded', 'labelRemoved'],
      });

      return response.data.history || [];
    } catch (error) {
      throw new Error(`Failed to get Gmail history: ${error}`);
    }
  }

  /**
   * Parse Gmail message to unified format
   */
  private parseMessage(messageData: any): GmailEmail {
    const headers = messageData.payload?.headers || [];
    const getHeader = (name: string) => 
      headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    const body = this.extractBody(messageData.payload);
    const attachments = this.extractAttachments(messageData.payload);

    return {
      id: messageData.id!,
      threadId: messageData.threadId!,
      from: this.extractEmail(getHeader('from')),
      fromName: this.extractName(getHeader('from')),
      to: this.extractEmails(getHeader('to')),
      cc: this.extractEmails(getHeader('cc')),
      bcc: this.extractEmails(getHeader('bcc')),
      subject: getHeader('subject'),
      snippet: messageData.snippet || '',
      body: body.text || '',
      bodyHtml: body.html || '',
      date: new Date(getHeader('date')),
      isRead: !messageData.labelIds?.includes('UNREAD'),
      isStarred: messageData.labelIds?.includes('STARRED') || false,
      labels: messageData.labelIds || [],
      attachments,
      priority: this.determinePriority(messageData),
      category: this.determineCategory(messageData),
    };
  }

  /**
   * Extract email body (text and HTML)
   */
  private extractBody(payload: any): { text: string; html: string } {
    let text = '';
    let html = '';

    const extractPart = (part: any) => {
      if (part.mimeType === 'text/plain') {
        text = Buffer.from(part.body.data, 'base64').toString();
      } else if (part.mimeType === 'text/html') {
        html = Buffer.from(part.body.data, 'base64').toString();
      } else if (part.parts) {
        part.parts.forEach(extractPart);
      }
    };

    extractPart(payload);
    return { text, html };
  }

  /**
   * Extract attachments from message
   */
  private extractAttachments(payload: any): GmailAttachment[] {
    const attachments: GmailAttachment[] = [];

    const extractPart = (part: any) => {
      if (part.filename && part.body.data) {
        attachments.push({
          id: part.body.attachmentId || part.body.data,
          filename: part.filename,
          mimeType: part.mimeType,
          size: parseInt(part.body.size || '0'),
        });
      } else if (part.parts) {
        part.parts.forEach(extractPart);
      }
    };

    extractPart(payload);
    return attachments;
  }

  /**
   * Extract email address from header
   */
  private extractEmail(header: string): string {
    const match = header.match(/<(.+?)>/);
    return match ? match[1] : header;
  }

  /**
   * Extract name from header
   */
  private extractName(header: string): string {
    const match = header.match(/^(.+?)\s*</);
    return match ? match[1].replace(/"/g, '') : '';
  }

  /**
   * Extract multiple email addresses
   */
  private extractEmails(header: string): string[] {
    if (!header) return [];
    return header.split(',').map(email => this.extractEmail(email.trim()));
  }

  /**
   * Determine message priority
   */
  private determinePriority(messageData: any): 'high' | 'medium' | 'low' {
    const labels = messageData.labelIds || [];
    const subject = messageData.snippet || '';

    // High priority indicators
    if (labels.includes('IMPORTANT') || 
        subject.toLowerCase().includes('urgent') ||
        subject.toLowerCase().includes('asap') ||
        subject.toLowerCase().includes('important')) {
      return 'high';
    }

    // Low priority indicators
    if (labels.includes('CATEGORY_PROMOTIONS') ||
        labels.includes('CATEGORY_SOCIAL') ||
        subject.toLowerCase().includes('newsletter') ||
        subject.toLowerCase().includes('promotion')) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * Determine message category
   */
  private determineCategory(messageData: any): 'primary' | 'social' | 'promotions' | 'updates' | 'forums' {
    const labels = messageData.labelIds || [];

    if (labels.includes('CATEGORY_SOCIAL')) return 'social';
    if (labels.includes('CATEGORY_PROMOTIONS')) return 'promotions';
    if (labels.includes('CATEGORY_UPDATES')) return 'updates';
    if (labels.includes('CATEGORY_FORUMS')) return 'forums';

    return 'primary';
  }

  /**
   * Create base64 encoded message for sending
   */
  private createMessage(email: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    bodyHtml?: string;
    attachments?: GmailAttachment[];
  }): string {
    const lines = [
      `To: ${email.to.join(', ')}`,
      email.cc ? `Cc: ${email.cc.join(', ')}` : '',
      email.bcc ? `Bcc: ${email.bcc.join(', ')}` : '',
      `Subject: ${email.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      email.bodyHtml || email.body,
    ].filter(Boolean);

    return Buffer.from(lines.join('\r\n')).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ access_token: string; refresh_token?: string }> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return {
        access_token: credentials.access_token!,
        refresh_token: credentials.refresh_token ?? undefined,
      };
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error}`);
    }
  }
}

/**
 * Create Gmail OAuth2 URL for authorization
 */
export function createGmailAuthUrl(): string {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.send',
    ],
    prompt: 'consent',
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
}> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);
  return {
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token ?? undefined,
  };
} 