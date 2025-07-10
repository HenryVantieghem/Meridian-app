import { WebClient } from '@slack/web-api';
import { SocketModeClient } from '@slack/socket-mode';
import { LogLevel } from '@slack/logger';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/monitoring/logging';
import { performanceMonitor } from '@/lib/monitoring/logging';
import crypto from 'crypto';

// Slack integration types
export interface SlackWorkspace {
  id: string;
  name: string;
  domain: string;
  icon?: string;
  isEnterprise: boolean;
}

export interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
  isMember: boolean;
  memberCount: number;
  topic?: string;
  purpose?: string;
}

export interface SlackMessage {
  id: string;
  channel: string;
  channelName: string;
  text: string;
  user: string;
  userName: string;
  timestamp: string;
  threadTs?: string;
  reactions?: Array<{
    name: string;
    count: number;
    users: string[];
  }>;
  attachments?: Array<{
    type: string;
    url?: string;
    title?: string;
    text?: string;
  }>;
  priority?: 'high' | 'medium' | 'low';
  category?: 'work' | 'personal' | 'project' | 'meeting';
}

export interface SlackUser {
  id: string;
  name: string;
  realName?: string;
  email?: string;
  avatar?: string;
  isBot: boolean;
  isDeleted: boolean;
}

export interface SlackIntegration {
  id: string;
  userId: string;
  workspaceId: string;
  workspaceName: string;
  accessToken: string;
  botToken?: string;
  userToken?: string;
  webhookUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Slack client manager
export class SlackClientManager {
  private clients = new Map<string, WebClient>();
  private socketClients = new Map<string, SocketModeClient>();
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  async getClient(workspaceId: string): Promise<WebClient> {
    if (this.clients.has(workspaceId)) {
      return this.clients.get(workspaceId)!;
    }

    // Get integration from database
    const { data: integration, error } = await this.supabase
      .from('slack_integrations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .single();

    if (error || !integration) {
      throw new Error('Slack integration not found or inactive');
    }

    const client = new WebClient(integration.accessToken);
    this.clients.set(workspaceId, client);
    return client;
  }

  async getSocketClient(workspaceId: string): Promise<SocketModeClient> {
    if (this.socketClients.has(workspaceId)) {
      return this.socketClients.get(workspaceId)!;
    }

    const { data: integration } = await this.supabase
      .from('slack_integrations')
      .select('bot_token')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .single();

    if (!integration?.bot_token) {
      throw new Error('Bot token not available for Socket Mode');
    }

    const socketClient = new SocketModeClient({
      appToken: integration.bot_token,
      logLevel: LogLevel.INFO,
    });

    this.socketClients.set(workspaceId, socketClient);
    return socketClient;
  }

  async disconnectClient(workspaceId: string): Promise<void> {
    const client = this.clients.get(workspaceId);
    if (client) {
      this.clients.delete(workspaceId);
    }

    const socketClient = this.socketClients.get(workspaceId);
    if (socketClient) {
      await socketClient.disconnect();
      this.socketClients.delete(workspaceId);
    }
  }
}

// Slack integration manager
export class SlackIntegrationManager {
  private clientManager = new SlackClientManager();
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // OAuth2 authentication flow
  async initiateOAuth(userId: string): Promise<string> {
    const clientId = process.env.SLACK_CLIENT_ID;
    const redirectUri = process.env.SLACK_REDIRECT_URI;
    const scope = [
      'channels:read',
      'channels:history',
      'chat:write',
      'users:read',
      'users:read.email',
      'reactions:read',
      'reactions:write',
      'groups:read',
      'groups:history',
      'im:read',
      'im:history',
      'mpim:read',
      'mpim:history',
    ].join(',');

    const state = Math.random().toString(36).substring(2);
    
    // Store state for verification
    await this.supabase
      .from('oauth_states')
      .insert({
        state,
        userId,
        provider: 'slack',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      });

    const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`;
    
    return authUrl;
  }

  async handleOAuthCallback(code: string, state: string): Promise<SlackIntegration> {
    // Verify state
    const { data: stateRecord, error: stateError } = await this.supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('provider', 'slack')
      .gt('expiresAt', new Date().toISOString())
      .single();

    if (stateError || !stateRecord) {
      throw new Error('Invalid or expired OAuth state');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.SLACK_REDIRECT_URI!,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      throw new Error(`Slack OAuth error: ${tokenData.error}`);
    }

    // Get workspace info
    const client = new WebClient(tokenData.access_token);
    const teamInfo = await client.team.info();

    // Store integration
    const { data: integration, error } = await this.supabase
      .from('slack_integrations')
      .insert({
        user_id: stateRecord.userId,
        workspace_id: tokenData.team.id,
        workspace_name: teamInfo.team?.name || 'Unknown Workspace',
        access_token: tokenData.access_token,
        bot_token: tokenData.access_token,
        user_token: tokenData.access_token,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to store Slack integration: ${error.message}`);
    }

    // Clean up state
    await this.supabase
      .from('oauth_states')
      .delete()
      .eq('state', state);

    return integration;
  }

  async getWorkspaces(userId: string): Promise<SlackWorkspace[]> {
    const { data: integrations, error } = await this.supabase
      .from('slack_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to get Slack workspaces: ${error.message}`);
    }

    return integrations.map(integration => ({
      id: integration.workspace_id,
      name: integration.workspace_name,
      domain: integration.workspace_name.toLowerCase().replace(/\s+/g, '-'),
      isEnterprise: false, // Could be enhanced with actual workspace info
    }));
  }

  async getChannels(workspaceId: string): Promise<SlackChannel[]> {
    const client = await this.clientManager.getClient(workspaceId);

    try {
      const [channelsResponse, groupsResponse, imsResponse] = await Promise.all([
        client.conversations.list({ types: 'public_channel' }),
        client.conversations.list({ types: 'private_channel' }),
        client.conversations.list({ types: 'im,mpim' }),
      ]);

      const channels = [
        ...(channelsResponse.channels || []),
        ...(groupsResponse.channels || []),
        ...(imsResponse.channels || []),
      ].map(channel => ({
        id: channel.id!,
        name: channel.name || channel.user || 'Unknown',
        isPrivate: channel.is_private || false,
        isMember: channel.is_member || false,
        memberCount: channel.num_members || 0,
        topic: channel.topic?.value,
        purpose: channel.purpose?.value,
      }));

      return channels;
    } catch (error) {
      throw new Error(`Failed to get Slack channels: ${error}`);
    }
  }

  async getMessages(workspaceId: string, channelId: string, limit = 50): Promise<SlackMessage[]> {
    const client = await this.clientManager.getClient(workspaceId);

    try {
      const response = await client.conversations.history({
        channel: channelId,
        limit,
        inclusive: true,
      });

      const messages = await Promise.all(
        (response.messages || []).map(async (message) => {
          // Get user info if available
          let userName = 'Unknown User';
          if (message.user) {
            try {
              const userResponse = await client.users.info({ user: message.user });
              userName = userResponse.user?.real_name || userResponse.user?.name || 'Unknown User';
            } catch (error) {
              console.error(`Failed to get user info for ${message.user}:`, error);
            }
          }

          // Get channel info
          let channelName = 'Unknown Channel';
          try {
            const channelResponse = await client.conversations.info({ channel: channelId });
            channelName = channelResponse.channel?.name || 'Unknown Channel';
          } catch (error) {
            console.error(`Failed to get channel info for ${channelId}:`, error);
          }

          return {
            id: message.ts!,
            channel: channelId,
            channelName,
            text: message.text || '',
            user: message.user || 'system',
            userName,
            timestamp: message.ts!,
            threadTs: message.thread_ts,
            reactions: message.reactions?.map(reaction => ({
              name: reaction.name ?? '',
              count: reaction.count ?? 0,
              users: reaction.users || [],
            })),
            attachments: message.attachments?.map(attachment => ({
              type: 'unknown',
              url: attachment.url,
              title: attachment.title,
              text: attachment.text,
            })),
            priority: this.determineMessagePriority(message),
            category: this.determineMessageCategory(message),
          };
        })
      );

      return messages;
    } catch (error) {
      throw new Error(`Failed to get Slack messages: ${error}`);
    }
  }

  async sendMessage(workspaceId: string, channelId: string, text: string, threadTs?: string): Promise<string> {
    const client = await this.clientManager.getClient(workspaceId);

    try {
      const response = await client.chat.postMessage({
        channel: channelId,
        text,
        thread_ts: threadTs,
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.error}`);
      }

      return response.ts!;
    } catch (error) {
      throw new Error(`Failed to send Slack message: ${error}`);
    }
  }

  async addReaction(workspaceId: string, channelId: string, timestamp: string, reaction: string): Promise<void> {
    const client = await this.clientManager.getClient(workspaceId);

    try {
      const response = await client.reactions.add({
        channel: channelId,
        timestamp,
        name: reaction,
      });

      if (!response.ok) {
        throw new Error(`Failed to add reaction: ${response.error}`);
      }
    } catch (error) {
      throw new Error(`Failed to add Slack reaction: ${error}`);
    }
  }

  async startRealTimeConnection(workspaceId: string, onMessage: (message: SlackMessage) => void): Promise<void> {
    const socketClient = await this.clientManager.getSocketClient(workspaceId);

    socketClient.on('message', async (event) => {
      if (event.type === 'events_api') {
        const { event: slackEvent } = event.payload;
        
        if (slackEvent.type === 'message') {
          try {
            const client = await this.clientManager.getClient(workspaceId);
            
            // Get user info
            let userName = 'Unknown User';
            if (slackEvent.user) {
              try {
                const userResponse = await client.users.info({ user: slackEvent.user });
                userName = userResponse.user?.real_name || userResponse.user?.name || 'Unknown User';
              } catch (error) {
                console.error(`Failed to get user info for ${slackEvent.user}:`, error);
              }
            }

            // Get channel info
            let channelName = 'Unknown Channel';
            try {
              const channelResponse = await client.conversations.info({ channel: slackEvent.channel });
              channelName = channelResponse.channel?.name || 'Unknown Channel';
            } catch (error) {
              console.error(`Failed to get channel info for ${slackEvent.channel}:`, error);
            }

            const message: SlackMessage = {
              id: slackEvent.ts!,
              channel: slackEvent.channel!,
              channelName,
              text: slackEvent.text || '',
              user: slackEvent.user || 'system',
              userName,
              timestamp: slackEvent.ts!,
              threadTs: slackEvent.thread_ts,
              priority: this.determineMessagePriority(slackEvent),
              category: this.determineMessageCategory(slackEvent),
            };

            onMessage(message);
          } catch (error) {
            console.error('Error processing real-time message:', error);
          }
        }
      }
    });

    await socketClient.start();
  }

  async stopRealTimeConnection(workspaceId: string): Promise<void> {
    await this.clientManager.disconnectClient(workspaceId);
  }

  // Webhook verification
  verifyWebhookSignature(signature: string, timestamp: string, body: string): boolean {
    const signingSecret = process.env.SLACK_SIGNING_SECRET!;
    const baseString = `v0:${timestamp}:${body}`;
    const expectedSignature = `v0=${crypto
      .createHmac('sha256', signingSecret)
      .update(baseString)
      .digest('hex')}`;

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  async handleWebhookEvent(event: any, signature: string, timestamp: string, body: string): Promise<void> {
    // Verify webhook signature
    if (!this.verifyWebhookSignature(signature, timestamp, body)) {
      throw new Error('Invalid webhook signature');
    }

    // Handle different event types
    switch (event.type) {
      case 'message':
        await this.handleMessageEvent(event);
        break;
      case 'reaction_added':
      case 'reaction_removed':
        await this.handleReactionEvent(event);
        break;
      case 'channel_created':
      case 'channel_deleted':
        await this.handleChannelEvent(event);
        break;
      default:
        logger.info(`Unhandled Slack event type: ${event.type}`);
    }
  }

  private async handleMessageEvent(event: any): Promise<void> {
    // Store message in database for processing
    await this.supabase
      .from('slack_messages')
      .insert({
        message_id: event.ts,
        channel_id: event.channel,
        user_id: event.user,
        text: event.text,
        timestamp: new Date(parseFloat(event.ts) * 1000).toISOString(),
        workspace_id: event.team,
      });
  }

  private async handleReactionEvent(event: any): Promise<void> {
    // Update message reactions in database
    await this.supabase
      .from('slack_reactions')
      .upsert({
        message_id: event.item.ts,
        channel_id: event.item.channel,
        reaction: event.reaction,
        user_id: event.user,
        timestamp: new Date().toISOString(),
      });
  }

  private async handleChannelEvent(event: any): Promise<void> {
    // Update channel information in database
    await this.supabase
      .from('slack_channels')
      .upsert({
        channel_id: event.channel.id,
        name: event.channel.name,
        workspace_id: event.team_id,
        is_private: event.channel.is_private,
        updated_at: new Date().toISOString(),
      });
  }

  async deactivateIntegration(workspaceId: string): Promise<void> {
    await this.supabase
      .from('slack_integrations')
      .update({ is_active: false })
      .eq('workspace_id', workspaceId);

    await this.clientManager.disconnectClient(workspaceId);
  }

  async deleteIntegration(workspaceId: string): Promise<void> {
    await this.supabase
      .from('slack_integrations')
      .delete()
      .eq('workspace_id', workspaceId);

    await this.clientManager.disconnectClient(workspaceId);
  }

  // Message analysis helpers
  private determineMessagePriority(message: any): 'high' | 'medium' | 'low' {
    const text = message.text?.toLowerCase() || '';
    
    // High priority indicators
    if (text.includes('urgent') || 
        text.includes('asap') || 
        text.includes('important') ||
        text.includes('emergency') ||
        text.includes('critical')) {
      return 'high';
    }

    // Low priority indicators
    if (text.includes('fun') ||
        text.includes('joke') ||
        text.includes('random') ||
        text.includes('off-topic')) {
      return 'low';
    }

    return 'medium';
  }

  private determineMessageCategory(message: any): 'work' | 'personal' | 'project' | 'meeting' {
    const text = message.text?.toLowerCase() || '';
    
    if (text.includes('meeting') || text.includes('call') || text.includes('zoom')) {
      return 'meeting';
    }
    
    if (text.includes('project') || text.includes('task') || text.includes('deadline')) {
      return 'project';
    }
    
    if (text.includes('personal') || text.includes('private')) {
      return 'personal';
    }
    
    return 'work';
  }
}

// Export singleton instances for use in API routes
export const slackManager = new SlackIntegrationManager();
export const slackIntegrationManager = new SlackIntegrationManager(); 