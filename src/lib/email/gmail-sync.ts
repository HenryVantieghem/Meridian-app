import { google } from 'googleapis';

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

export class GmailClient {
  private oauth2Client: unknown;
  private gmail: ReturnType<typeof google.gmail>;

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
        messages.map((message: { id: string }) => this.getMessage(message.id))
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
   * Parse Gmail message data into our format
   */
  private parseMessage(messageData: unknown): GmailEmail {
    const data = messageData as { [key: string]: unknown };
    const headers = (data.payload as { headers?: unknown[] })?.headers || [];
    const getHeader = (name: string) => 
      (headers as Array<{ name: string; value: string }>).find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    const from = getHeader('From');
    const to = getHeader('To');
    const cc = getHeader('Cc');
    const bcc = getHeader('Bcc');
    const subject = getHeader('Subject');
    const date = getHeader('Date');

    const { text, html } = this.extractBody(data.payload);
    const attachments = this.extractAttachments(data.payload);

    return {
      id: data.id,
      threadId: data.threadId,
      from: this.extractEmail(from),
      fromName: this.extractName(from),
      to: this.extractEmails(to),
      cc: this.extractEmails(cc),
      bcc: this.extractEmails(bcc),
      subject: subject || '(No Subject)',
      snippet: data.snippet || '',
      body: text,
      bodyHtml: html,
      date: new Date(date || Date.now()),
      isRead: !data.labelIds?.includes('UNREAD'),
      isStarred: data.labelIds?.includes('STARRED') || false,
      labels: data.labelIds || [],
      attachments,
      priority: this.determinePriority(data),
      category: this.determineCategory(data),
    };
  }

  /**
   * Extract body content from message payload
   */
  private extractBody(payload: unknown): { text: string; html: string } {
    let text = '';
    let html = '';

    const extractPart = (part: Record<string, unknown>) => {
      if (part.mimeType === 'text/plain') {
        text = Buffer.from(part.body.data as string, 'base64').toString();
      } else if (part.mimeType === 'text/html') {
        html = Buffer.from(part.body.data as string, 'base64').toString();
      }

      if (part.parts) {
        (part.parts as Record<string, unknown>[]).forEach(extractPart);
      }
    };

    extractPart(payload);
    return { text, html };
  }

  /**
   * Extract attachments from message payload
   */
  private extractAttachments(payload: unknown): GmailAttachment[] {
    const attachments: GmailAttachment[] = [];

    const extractPart = (part: Record<string, unknown>) => {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          id: part.body.attachmentId as string,
          filename: part.filename as string,
          mimeType: part.mimeType as string,
          size: parseInt(part.body.size as string) || 0,
        });
      }

      if (part.parts) {
        (part.parts as Record<string, unknown>[]).forEach(extractPart);
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
    return match ? match[1] : header.trim();
  }

  /**
   * Extract name from header
   */
  private extractName(header: string): string {
    const match = header.match(/^(.+?)\s*</);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract multiple emails from header
   */
  private extractEmails(header: string): string[] {
    if (!header) return [];
    return header.split(',').map((email) => this.extractEmail(email.trim()));
  }

  /**
   * Determine message priority based on content and sender
   */
  private determinePriority(_messageData: unknown): 'high' | 'medium' | 'low' {
    // Placeholder: implement real priority logic
    return 'medium';
  }

  /**
   * Determine message category
   */
  private determineCategory(_messageData: unknown): 'primary' | 'social' | 'promotions' | 'updates' | 'forums' {
    // Placeholder: implement real category logic
    return 'primary';
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ access_token: string; refresh_token?: string }> {
    try {
      const { credentials } = (this.oauth2Client as any).refreshAccessToken();
      return {
        access_token: credentials.access_token!,
        refresh_token: credentials.refresh_token ?? undefined
      };
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 