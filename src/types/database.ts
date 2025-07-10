export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          theme: 'light' | 'dark' | 'system';
          email_notifications: boolean;
          push_notifications: boolean;
          timezone: string;
          language: string;
          role: string | null;
          industry: string | null;
          communication_style: 'formal' | 'casual' | 'professional';
          priorities: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: 'light' | 'dark' | 'system';
          email_notifications?: boolean;
          push_notifications?: boolean;
          timezone?: string;
          language?: string;
          role?: string | null;
          industry?: string | null;
          communication_style?: 'formal' | 'casual' | 'professional';
          priorities?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: 'light' | 'dark' | 'system';
          email_notifications?: boolean;
          push_notifications?: boolean;
          timezone?: string;
          language?: string;
          role?: string | null;
          industry?: string | null;
          communication_style?: 'formal' | 'casual' | 'professional';
          priorities?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string | null;
          status: 'active' | 'canceled' | 'past_due' | 'unpaid';
          plan: 'free' | 'pro' | 'enterprise';
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id?: string | null;
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid';
          plan?: 'free' | 'pro' | 'enterprise';
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_subscription_id?: string | null;
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid';
          plan?: 'free' | 'pro' | 'enterprise';
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      emails: {
        Row: {
          id: string;
          user_id: string;
          external_id: string;
          from_address: any;
          to_addresses: any;
          cc_addresses: any | null;
          bcc_addresses: any | null;
          subject: string;
          body: string;
          body_html: string | null;
          attachments: any;
          received_at: string;
          read: boolean;
          starred: boolean;
          archived: boolean;
          labels: string[];
          thread_id: string;
          priority: 'critical' | 'high' | 'medium' | 'low' | 'none';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          external_id: string;
          from_address: any;
          to_addresses: any;
          cc_addresses?: any | null;
          bcc_addresses?: any | null;
          subject: string;
          body: string;
          body_html?: string | null;
          attachments?: any;
          received_at: string;
          read?: boolean;
          starred?: boolean;
          archived?: boolean;
          labels?: string[];
          thread_id: string;
          priority?: 'critical' | 'high' | 'medium' | 'low' | 'none';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          external_id?: string;
          from_address?: any;
          to_addresses?: any;
          cc_addresses?: any | null;
          bcc_addresses?: any | null;
          subject?: string;
          body?: string;
          body_html?: string | null;
          attachments?: any;
          received_at?: string;
          read?: boolean;
          starred?: boolean;
          archived?: boolean;
          labels?: string[];
          thread_id?: string;
          priority?: 'critical' | 'high' | 'medium' | 'low' | 'none';
          created_at?: string;
          updated_at?: string;
        };
      };
      email_analyses: {
        Row: {
          id: string;
          email_id: string;
          summary: string;
          key_points: string[];
          sentiment: 'positive' | 'negative' | 'neutral';
          urgency: 'high' | 'medium' | 'low';
          category: string;
          confidence: number;
          ai_model: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email_id: string;
          summary: string;
          key_points: string[];
          sentiment: 'positive' | 'negative' | 'neutral';
          urgency: 'high' | 'medium' | 'low';
          category: string;
          confidence: number;
          ai_model: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email_id?: string;
          summary?: string;
          key_points?: string[];
          sentiment?: 'positive' | 'negative' | 'neutral';
          urgency?: 'high' | 'medium' | 'low';
          category?: string;
          confidence?: number;
          ai_model?: string;
          created_at?: string;
        };
      };
      action_items: {
        Row: {
          id: string;
          user_id: string;
          email_id: string | null;
          email_analysis_id: string | null;
          description: string;
          due_date: string | null;
          priority: 'high' | 'medium' | 'low';
          completed: boolean;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_id?: string | null;
          email_analysis_id?: string | null;
          description: string;
          due_date?: string | null;
          priority?: 'high' | 'medium' | 'low';
          completed?: boolean;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_id?: string | null;
          email_analysis_id?: string | null;
          description?: string;
          due_date?: string | null;
          priority?: 'high' | 'medium' | 'low';
          completed?: boolean;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 