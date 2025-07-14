-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE email_priority AS ENUM ('critical', 'high', 'medium', 'low', 'none');
CREATE TYPE action_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE sentiment AS ENUM ('positive', 'negative', 'neutral');
CREATE TYPE urgency AS ENUM ('high', 'medium', 'low');
CREATE TYPE theme AS ENUM ('light', 'dark', 'system');
CREATE TYPE communication_style AS ENUM ('formal', 'casual', 'professional');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  theme theme DEFAULT 'system',
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  role TEXT,
  industry TEXT,
  communication_style communication_style DEFAULT 'professional',
  priorities TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  status subscription_status DEFAULT 'active',
  plan subscription_plan DEFAULT 'free',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Emails table
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  from_address JSONB NOT NULL, -- {name: string, email: string}
  to_addresses JSONB NOT NULL, -- [{name: string, email: string}]
  cc_addresses JSONB, -- [{name: string, email: string}]
  bcc_addresses JSONB, -- [{name: string, email: string}]
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  body_html TEXT,
  attachments JSONB DEFAULT '[]', -- [{id: string, filename: string, contentType: string, size: number, url?: string}]
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  read BOOLEAN DEFAULT false,
  starred BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  labels TEXT[] DEFAULT '{}',
  thread_id TEXT NOT NULL,
  priority email_priority DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, external_id)
);

-- Email analyses table
CREATE TABLE email_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_points TEXT[] NOT NULL,
  sentiment sentiment NOT NULL,
  urgency urgency NOT NULL,
  category TEXT NOT NULL,
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  ai_model TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email_id)
);

-- Action items table
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
  email_analysis_id UUID REFERENCES email_analyses(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  priority action_priority DEFAULT 'medium',
  completed BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email processing jobs table
CREATE TABLE IF NOT EXISTS email_processing_jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    providers JSONB NOT NULL,
    options JSONB,
    status TEXT NOT NULL DEFAULT 'pending',
    progress INTEGER NOT NULL DEFAULT 0,
    total_emails INTEGER NOT NULL DEFAULT 0,
    processed_emails INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error TEXT,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    CONSTRAINT valid_progress CHECK (progress >= 0 AND progress <= 100)
);

-- Email analyses table
CREATE TABLE IF NOT EXISTS email_analyses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    email_data JSONB NOT NULL,
    analysis_data JSONB NOT NULL,
    success BOOLEAN NOT NULL DEFAULT true,
    error TEXT,
    processing_time INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (for context)
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id TEXT PRIMARY KEY,
    role TEXT DEFAULT 'Professional',
    industry TEXT DEFAULT 'General',
    preferences JSONB DEFAULT '[]',
    vip_contacts JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_emails_user_id ON emails(user_id);
CREATE INDEX idx_emails_external_id ON emails(external_id);
CREATE INDEX idx_emails_thread_id ON emails(thread_id);
CREATE INDEX idx_emails_received_at ON emails(received_at);
CREATE INDEX idx_emails_priority ON emails(priority);
CREATE INDEX idx_email_analyses_email_id ON email_analyses(email_id);
CREATE INDEX idx_action_items_user_id ON action_items(user_id);
CREATE INDEX idx_action_items_email_id ON action_items(email_id);
CREATE INDEX idx_action_items_completed ON action_items(completed);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_processing_jobs_user_id ON email_processing_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_processing_jobs_status ON email_processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_email_processing_jobs_created_at ON email_processing_jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_email_analyses_user_id ON email_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_email_analyses_success ON email_analyses(success);
CREATE INDEX IF NOT EXISTS idx_email_analyses_created_at ON email_analyses(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Row Level Security (RLS) policies
ALTER TABLE email_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = clerk_id);

-- RLS Policies for user_preferences table
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

-- RLS Policies for subscriptions table
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

-- RLS Policies for emails table
CREATE POLICY "Users can view own emails" ON emails
  FOR SELECT USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

CREATE POLICY "Users can insert own emails" ON emails
  FOR INSERT WITH CHECK (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own emails" ON emails
  FOR UPDATE USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete own emails" ON emails
  FOR DELETE USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

-- RLS Policies for email_analyses table
CREATE POLICY "Users can view own email analyses" ON email_analyses
  FOR SELECT USING (
    auth.uid()::text = (
      SELECT clerk_id FROM users WHERE id = (
        SELECT user_id FROM emails WHERE id = email_id
      )
    )
  );

CREATE POLICY "Users can insert own email analyses" ON email_analyses
  FOR INSERT WITH CHECK (
    auth.uid()::text = (
      SELECT clerk_id FROM users WHERE id = (
        SELECT user_id FROM emails WHERE id = email_id
      )
    )
  );

CREATE POLICY "Users can update own email analyses" ON email_analyses
  FOR UPDATE USING (
    auth.uid()::text = (
      SELECT clerk_id FROM users WHERE id = (
        SELECT user_id FROM emails WHERE id = email_id
      )
    )
  );

-- RLS Policies for action_items table
CREATE POLICY "Users can view own action items" ON action_items
  FOR SELECT USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

CREATE POLICY "Users can insert own action items" ON action_items
  FOR INSERT WITH CHECK (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own action items" ON action_items
  FOR UPDATE USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete own action items" ON action_items
  FOR DELETE USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

-- RLS policies for email_processing_jobs
CREATE POLICY "Users can view their own processing jobs" ON email_processing_jobs
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own processing jobs" ON email_processing_jobs
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own processing jobs" ON email_processing_jobs
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own processing jobs" ON email_processing_jobs
    FOR DELETE USING (auth.uid()::text = user_id);

-- RLS policies for email_analyses
CREATE POLICY "Users can view their own email analyses" ON email_analyses
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own email analyses" ON email_analyses
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own email analyses" ON email_analyses
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own email analyses" ON email_analyses
    FOR DELETE USING (auth.uid()::text = user_id);

-- RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own profile" ON user_profiles
    FOR DELETE USING (auth.uid()::text = user_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_items_updated_at BEFORE UPDATE ON action_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_processing_jobs_updated_at 
    BEFORE UPDATE ON email_processing_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default user preferences
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id);
  
  -- Insert default subscription (free plan)
  INSERT INTO subscriptions (user_id, plan)
  VALUES (NEW.id, 'free');
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic user setup
CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 

-- Function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_email_data(days_to_keep INTEGER DEFAULT 30)
RETURNS VOID AS $$
BEGIN
    DELETE FROM email_processing_jobs 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    DELETE FROM email_analyses 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
END;
$$ LANGUAGE plpgsql;

-- Function to get processing statistics
CREATE OR REPLACE FUNCTION get_processing_stats(target_user_id TEXT)
RETURNS TABLE(
    total_jobs BIGINT,
    completed_jobs BIGINT,
    failed_jobs BIGINT,
    total_emails_processed BIGINT,
    average_processing_time NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_jobs,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_jobs,
        COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_jobs,
        COALESCE(SUM(processed_emails) FILTER (WHERE status = 'completed'), 0)::BIGINT as total_emails_processed,
        COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) FILTER (WHERE status = 'completed'), 0)::NUMERIC as average_processing_time
    FROM email_processing_jobs
    WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql; 