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
  private oauth2Client: any;
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
   * Parse Gmail message data into our format
   */
  private parseMessage(messageData: any): GmailEmail {
    const headers = messageData.payload?.headers || [];
    const getHeader = (name: string) => 
      headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    const from = getHeader('From');
    const to = getHeader('To');
    const cc = getHeader('Cc');
    const bcc = getHeader('Bcc');
    const subject = getHeader('Subject');
    const date = getHeader('Date');

    const { text, html } = this.extractBody(messageData.payload);
    const attachments = this.extractAttachments(messageData.payload);

    return {
      id: messageData.id,
      threadId: messageData.threadId,
      from: this.extractEmail(from),
      fromName: this.extractName(from),
      to: this.extractEmails(to),
      cc: this.extractEmails(cc),
      bcc: this.extractEmails(bcc),
      subject: subject || '(No Subject)',
      snippet: messageData.snippet || '',
      body: text,
      bodyHtml: html,
      date: new Date(date || Date.now()),
      isRead: !messageData.labelIds?.includes('UNREAD'),
      isStarred: messageData.labelIds?.includes('STARRED') || false,
      labels: messageData.labelIds || [],
      attachments,
      priority: this.determinePriority(messageData),
      category: this.determineCategory(messageData),
    };
  }

  /**
   * Extract body content from message payload
   */
  private extractBody(payload: any): { text: string; html: string } {
    let text = '';
    let html = '';

    const extractPart = (part: any) => {
      if (part.mimeType === 'text/plain') {
        text = Buffer.from(part.body.data, 'base64').toString();
      } else if (part.mimeType === 'text/html') {
        html = Buffer.from(part.body.data, 'base64').toString();
      }

      if (part.parts) {
        part.parts.forEach(extractPart);
      }
    };

    extractPart(payload);
    return { text, html };
  }

  /**
   * Extract attachments from message payload
   */
  private extractAttachments(payload: any): GmailAttachment[] {
    const attachments: GmailAttachment[] = [];

    const extractPart = (part: any) => {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          id: part.body.attachmentId,
          filename: part.filename,
          mimeType: part.mimeType,
          size: parseInt(part.body.size) || 0,
        });
      }

      if (part.parts) {
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
    return header.split(',').map(email => this.extractEmail(email.trim()));
  }

  /**
   * Determine message priority based on content and sender
   */
  private determinePriority(messageData: any): 'high' | 'medium' | 'low' {
    const subject = messageData.payload?.headers?.find((h: any) => h.name === 'Subject')?.value || '';
    const from = messageData.payload?.headers?.find((h: any) => h.name === 'From')?.value || '';
    
    const highPriorityKeywords = ['urgent', 'asap', 'important', 'critical', 'emergency'];
    const lowPriorityKeywords = ['newsletter', 'promotion', 'marketing', 'unsubscribe'];
    
    const subjectLower = subject.toLowerCase();
    const fromLower = from.toLowerCase();
    
    if (highPriorityKeywords.some(keyword => subjectLower.includes(keyword))) {
      return 'high';
    }
    
    if (lowPriorityKeywords.some(keyword => subjectLower.includes(keyword) || fromLower.includes(keyword))) {
      return 'low';
    }
    
    return 'medium';
  }

  /**
   * Determine message category
   */
  private determineCategory(messageData: any): 'primary' | 'social' | 'promotions' | 'updates' | 'forums' {
    const labels = messageData.labelIds || [];
    
    if (labels.includes('CATEGORY_PERSONAL')) return 'primary';
    if (labels.includes('CATEGORY_SOCIAL')) return 'social';
    if (labels.includes('CATEGORY_PROMOTIONS')) return 'promotions';
    if (labels.includes('CATEGORY_UPDATES')) return 'updates';
    if (labels.includes('CATEGORY_FORUMS')) return 'forums';
    
    return 'primary';
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ access_token: string; refresh_token?: string }> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return {
        access_token: credentials.access_token!,
        refresh_token: credentials.refresh_token ?? undefined
      };
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error}`);
    }
  }
} 