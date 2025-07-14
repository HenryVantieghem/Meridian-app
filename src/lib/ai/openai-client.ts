import OpenAI from "openai";

// Validate required environment variables
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiOrgId = process.env.OPENAI_ORGANIZATION_ID;

if (!openaiApiKey) {
  throw new Error('Missing required environment variable: OPENAI_API_KEY');
}

// Initialize OpenAI client with proper configuration
export const openai = new OpenAI({
  apiKey: openaiApiKey,
  organization: openaiOrgId,
  maxRetries: 3,
  timeout: 30000, // 30 seconds
});

// Export a function to check if OpenAI is properly configured
export function isOpenAIConfigured(): boolean {
  return !!openaiApiKey;
}

// Export a function to get the current model configuration
export function getOpenAIConfig() {
  return {
    apiKey: openaiApiKey ? '***' : undefined, // Don't expose the actual key
    organization: openaiOrgId,
    maxRetries: 3,
    timeout: 30000,
  };
} 