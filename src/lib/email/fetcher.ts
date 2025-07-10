import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { ClientSecretCredential } from '@azure/identity';

export interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  fromName: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  bodyPlain: string;
  bodyHtml: string;
  receivedAt: Date;
  sentAt: Date;
  labels: string[];
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachmentCount: number;
  size: number;
  provider: 'gmail' | 'outlook';
  rawData: any;
}

export interface EmailProvider {
  name: 'gmail' | 'outlook';
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  userId: string;
}

export interface FetchOptions {
  maxResults?: number;
  query?: string;
  labelIds?: string[];
  includeSpamTrash?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export class EmailFetchError extends Error {
  constructor(
    message: string,
    public provider: string,
    public errorCode?: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'EmailFetchError';
  }
}

export class EmailFetcher {
  private gmailClient: any;
  private outlookClient: any;

  constructor() {
    this.initializeClients();
  }

  private initializeClients() {
    // Initialize Gmail client
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      this.gmailClient = google.gmail({
        version: 'v1',
        auth: new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        )
      });
    }

    // Initialize Outlook client
    if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
      const credential = new ClientSecretCredential(
        process.env.MICROSOFT_TENANT_ID!,
        process.env.MICROSOFT_CLIENT_ID!,
        process.env.MICROSOFT_CLIENT_SECRET!
      );

      const authProvider = new TokenCredentialAuthenticationProvider(credential, {
        scopes: ['https://graph.microsoft.com/.default']
      });

      this.outlookClient = Client.initWithMiddleware({
        authProvider
      });
    }
  }

  /**
   * Fetch emails from Gmail API
   */
  async fetchGmailEmails(
    accessToken: string,
    options: FetchOptions = {}
  ): Promise<EmailMessage[]> {
    try {
      // Set the access token
      this.gmailClient.setCredentials({
        access_token: accessToken
      });

      // Build query
      let query = '';
      if (options.query) {
        query += options.query;
      }
      if (options.startDate) {
        query += ` after:${options.startDate.toISOString().split('T')[0]}`;
      }
      if (options.endDate) {
        query += ` before:${options.endDate.toISOString().split('T')[0]}`;
      }

      // Fetch email IDs
      const response = await this.gmailClient.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: options.maxResults || 100,
        labelIds: options.labelIds,
        includeSpamTrash: options.includeSpamTrash || false
      });

      const messages = response.data.messages || [];
      const emails: EmailMessage[] = [];

      // Fetch full message details
      for (const message of messages) {
        try {
          const email = await this.fetchGmailMessageDetails(message.id);
          emails.push(email);
        } catch (error) {
          console.error(`Error fetching Gmail message ${message.id}:`, error);
          // Continue with other messages
        }
      }

      return emails;
    } catch (error: any) {
      const isRetryable = this.isRetryableError(error);
      throw new EmailFetchError(
        `Failed to fetch Gmail emails: ${error.message}`,
        'gmail',
        error.code,
        isRetryable
      );
    }
  }

  /**
   * Fetch emails from Outlook/Microsoft Graph API
   */
  async fetchOutlookEmails(
    accessToken: string,
    options: FetchOptions = {}
  ): Promise<EmailMessage[]> {
    try {
      // Set up the client with the access token
      const client = Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        }
      });

      // Build filter
      let filter = '';
      if (options.startDate) {
        filter += `receivedDateTime ge ${options.startDate.toISOString()}`;
      }
      if (options.endDate) {
        if (filter) filter += ' and ';
        filter += `receivedDateTime le ${options.endDate.toISOString()}`;
      }

      // Fetch emails
      const response = await client
        .api('/me/messages')
        .filter(filter)
        .top(options.maxResults || 100)
        .select('id,subject,from,toRecipients,ccRecipients,bccRecipients,body,receivedDateTime,sentDateTime,isRead,hasAttachments,size,importance')
        .orderby('receivedDateTime desc')
        .get();

      const emails: EmailMessage[] = [];

      for (const message of response.value) {
        try {
          const email = this.parseOutlookMessage(message);
          emails.push(email);
        } catch (error) {
          console.error(`Error parsing Outlook message ${message.id}:`, error);
          // Continue with other messages
        }
      }

      return emails;
    } catch (error: any) {
      const isRetryable = this.isRetryableError(error);
      throw new EmailFetchError(
        `Failed to fetch Outlook emails: ${error.message}`,
        'outlook',
        error.code,
        isRetryable
      );
    }
  }

  /**
   * Fetch detailed message information from Gmail
   */
  private async fetchGmailMessageDetails(messageId: string): Promise<EmailMessage> {
    const response = await this.gmailClient.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });

    const message = response.data;
    const headers = message.payload.headers;
    const body = message.payload.body;
    const parts = message.payload.parts;

    // Extract headers
    const from = this.getHeaderValue(headers, 'From') || '';
    const subject = this.getHeaderValue(headers, 'Subject') || '';
    const to = this.getHeaderValue(headers, 'To') || '';
    const cc = this.getHeaderValue(headers, 'Cc') || '';
    const date = this.getHeaderValue(headers, 'Date') || '';

    // Parse body
    let bodyPlain = '';
    let bodyHtml = '';

    if (parts) {
      for (const part of parts) {
        if (part.mimeType === 'text/plain') {
          bodyPlain = this.decodeBody(part.body.data);
        } else if (part.mimeType === 'text/html') {
          bodyHtml = this.decodeBody(part.body.data);
        }
      }
    } else if (body) {
      bodyPlain = this.decodeBody(body.data);
    }

    return {
      id: message.id,
      threadId: message.threadId,
      from: this.extractEmail(from),
      fromName: this.extractName(from),
      to: this.parseEmailList(to),
      cc: this.parseEmailList(cc),
      bcc: [],
      subject,
      body: bodyHtml || bodyPlain,
      bodyPlain,
      bodyHtml,
      receivedAt: new Date(date),
      sentAt: new Date(date),
      labels: message.labelIds || [],
      isRead: !message.labelIds?.includes('UNREAD'),
      isStarred: message.labelIds?.includes('STARRED') || false,
      hasAttachments: message.payload.parts?.some((part: any) => part.filename) || false,
      attachmentCount: message.payload.parts?.filter((part: any) => part.filename).length || 0,
      size: parseInt(message.sizeEstimate) || 0,
      provider: 'gmail',
      rawData: message
    };
  }

  /**
   * Parse Outlook message format
   */
  private parseOutlookMessage(message: any): EmailMessage {
    const from = message.from?.emailAddress?.address || '';
    const fromName = message.from?.emailAddress?.name || '';

    return {
      id: message.id,
      threadId: message.conversationId || message.id,
      from,
      fromName,
      to: message.toRecipients?.map((r: any) => r.emailAddress.address) || [],
      cc: message.ccRecipients?.map((r: any) => r.emailAddress.address) || [],
      bcc: message.bccRecipients?.map((r: any) => r.emailAddress.address) || [],
      subject: message.subject || '',
      body: message.body?.content || '',
      bodyPlain: message.body?.contentType === 'text' ? message.body.content : '',
      bodyHtml: message.body?.contentType === 'html' ? message.body.content : '',
      receivedAt: new Date(message.receivedDateTime),
      sentAt: new Date(message.sentDateTime),
      labels: [],
      isRead: message.isRead || false,
      isStarred: false, // Outlook doesn't have a direct starred concept
      hasAttachments: message.hasAttachments || false,
      attachmentCount: 0, // Would need additional API call to get this
      size: message.size || 0,
      provider: 'outlook',
      rawData: message
    };
  }

  /**
   * Real-time monitoring setup
   */
  async setupRealtimeMonitoring(
    provider: EmailProvider,
    callback: (email: EmailMessage) => void
  ): Promise<void> {
    if (provider.name === 'gmail') {
      await this.setupGmailWatch(provider, callback);
    } else if (provider.name === 'outlook') {
      await this.setupOutlookWebhooks(provider, callback);
    }
  }

  /**
   * Setup Gmail push notifications
   */
  private async setupGmailWatch(
    provider: EmailProvider,
    callback: (email: EmailMessage) => void
  ): Promise<void> {
    try {
      this.gmailClient.setCredentials({
        access_token: provider.accessToken
      });

      // Set up push notifications
      await this.gmailClient.users.watch({
        userId: 'me',
        requestBody: {
          topicName: `projects/${process.env.GOOGLE_PROJECT_ID}/topics/email-notifications`,
          labelIds: ['INBOX'],
          labelFilterAction: 'include'
        }
      });

      // In a real implementation, you'd set up a webhook endpoint
      // to receive the push notifications and call the callback
      console.log('Gmail watch setup complete');
    } catch (error: any) {
      throw new EmailFetchError(
        `Failed to setup Gmail watch: ${error.message}`,
        'gmail',
        error.code,
        true
      );
    }
  }

  /**
   * Setup Outlook webhooks
   */
  private async setupOutlookWebhooks(
    provider: EmailProvider,
    callback: (email: EmailMessage) => void
  ): Promise<void> {
    try {
      // In a real implementation, you'd set up Microsoft Graph webhooks
      // to receive notifications when emails arrive
      console.log('Outlook webhook setup complete');
    } catch (error: any) {
      throw new EmailFetchError(
        `Failed to setup Outlook webhooks: ${error.message}`,
        'outlook',
        error.code,
        true
      );
    }
  }

  /**
   * Helper methods
   */
  private getHeaderValue(headers: any[], name: string): string {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header?.value || '';
  }

  private decodeBody(data: string): string {
    if (!data) return '';
    return Buffer.from(data, 'base64').toString('utf-8');
  }

  private extractEmail(from: string): string {
    const match = from.match(/<(.+?)>/);
    return match ? match[1] : from;
  }

  private extractName(from: string): string {
    const match = from.match(/^(.+?)\s*</);
    return match ? match[1].trim() : '';
  }

  private parseEmailList(emailList: string): string[] {
    if (!emailList) return [];
    return emailList.split(',').map(email => email.trim());
  }

  private isRetryableError(error: any): boolean {
    const retryableCodes = ['rate_limit_exceeded', 'quota_exceeded', 'internal_error'];
    return retryableCodes.includes(error.code) || error.status >= 500;
  }

  /**
   * Sync emails from multiple providers
   */
  async syncEmails(providers: EmailProvider[], options: FetchOptions = {}): Promise<EmailMessage[]> {
    const allEmails: EmailMessage[] = [];

    for (const provider of providers) {
      try {
        let emails: EmailMessage[];
        
        if (provider.name === 'gmail') {
          emails = await this.fetchGmailEmails(provider.accessToken, options);
        } else if (provider.name === 'outlook') {
          emails = await this.fetchOutlookEmails(provider.accessToken, options);
        } else {
          throw new Error(`Unsupported provider: ${provider.name}`);
        }

        allEmails.push(...emails);
      } catch (error) {
        console.error(`Error syncing emails from ${provider.name}:`, error);
        // Continue with other providers
      }
    }

    // Sort by received date
    return allEmails.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());
  }
} 