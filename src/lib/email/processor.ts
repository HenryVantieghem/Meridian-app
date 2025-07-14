import { EmailFetcher, EmailMessage, EmailProvider, FetchOptions } from './fetcher';
import { EmailAnalyzer, AnalysisRequest, EmailAnalysis } from '../ai/email-analyzer';
import { createClient } from '@supabase/supabase-js';

export interface ProcessingJob {
  id: string;
  userId: string;
  providers: EmailProvider[];
  options: FetchOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalEmails: number;
  processedEmails: number;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
  results: ProcessingResult[];
}

export interface ProcessingResult {
  emailId: string;
  email: EmailMessage;
  analysis: EmailAnalysis;
  success: boolean;
  error?: string;
  processingTime: number;
}

export interface ProcessingOptions {
  batchSize?: number;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  enableRealTime?: boolean;
  priorityThreshold?: number;
}

export class ProcessingError extends Error {
  constructor(
    message: string,
    public errorCode: string,
    public retryable: boolean = false,
    public jobId?: string
  ) {
    super(message);
    this.name = 'ProcessingError';
  }
}

export class EmailProcessor {
  private fetcher: EmailFetcher;
  private analyzer: EmailAnalyzer;
  private supabase: ReturnType<typeof createClient>;
  private activeJobs: Map<string, ProcessingJob> = new Map();
  private processingQueue: ProcessingJob[] = [];
  private isProcessing = false;

  constructor() {
    this.fetcher = new EmailFetcher();
    this.analyzer = new EmailAnalyzer();
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Start processing emails for a user
   */
  async startProcessing(
    userId: string,
    providers: EmailProvider[],
    options: FetchOptions = {},
    _processingOptions: ProcessingOptions = {}
  ): Promise<ProcessingJob> {
    const job: ProcessingJob = {
      id: this.generateJobId(),
      userId,
      providers,
      options,
      status: 'pending',
      progress: 0,
      totalEmails: 0,
      processedEmails: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      results: []
    };

    // Store job in database
    await this.storeJob(job);

    // Add to processing queue
    this.processingQueue.push(job);
    this.activeJobs.set(job.id, job);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }

    return job;
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<ProcessingJob | null> {
    // Check active jobs first
    const activeJob = this.activeJobs.get(jobId);
    if (activeJob) {
      return activeJob;
    }

    // Check database
    const { data, error } = await this.supabase
      .from('email_processing_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as ProcessingJob;
  }

  /**
   * Cancel a processing job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.activeJobs.get(jobId);
    if (job && job.status === 'processing') {
      job.status = 'failed';
      job.error = 'Job cancelled by user';
      job.updatedAt = new Date();
      
      await this.updateJob(job);
      this.activeJobs.delete(jobId);
      return true;
    }
    return false;
  }

  /**
   * Process the job queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      const job = this.processingQueue.shift()!;
      
      try {
        await this.processJob(job);
      } catch (error: unknown) {
        console.error(`Error processing job ${job.id}:`, error);
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : 'Unknown error';
        job.updatedAt = new Date();
        await this.updateJob(job);
      } finally {
        this.activeJobs.delete(job.id);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Process a single job
   */
  private async processJob(job: ProcessingJob): Promise<void> {
    job.status = 'processing';
    job.updatedAt = new Date();
    await this.updateJob(job);

    try {
      // Step 1: Fetch emails from all providers
      const emails = await this.fetchEmailsFromProviders(job);
      job.totalEmails = emails.length;
      job.progress = 10;
      await this.updateJob(job);

      // Step 2: Process emails in batches
      const results = await this.processEmailsInBatches(job, emails);
      job.results = results;
      job.processedEmails = results.length;
      job.progress = 90;
      await this.updateJob(job);

      // Step 3: Store results and update job status
      await this.storeResults(job);
      job.status = 'completed';
      job.progress = 100;
      job.updatedAt = new Date();
      await this.updateJob(job);

    } catch (error: unknown) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.updatedAt = new Date();
      await this.updateJob(job);
      throw error;
    }
  }

  /**
   * Fetch emails from all providers
   */
  private async fetchEmailsFromProviders(job: ProcessingJob): Promise<EmailMessage[]> {
    const allEmails: EmailMessage[] = [];

    for (const provider of job.providers) {
      try {
        let emails: EmailMessage[];
        
        if (provider.name === 'gmail') {
          emails = await this.fetcher.fetchGmailEmails(provider.accessToken, job.options);
        } else if (provider.name === 'outlook') {
          emails = await this.fetcher.fetchOutlookEmails(provider.accessToken, job.options);
        } else {
          throw new Error(`Unsupported provider: ${provider.name}`);
        }

        allEmails.push(...emails);
      } catch (error: unknown) {
        console.error(`Error fetching emails from ${provider.name}:`, error);
        // Continue with other providers
      }
    }

    // Sort by received date (newest first)
    return allEmails.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());
  }

  /**
   * Process emails in batches for efficiency
   */
  private async processEmailsInBatches(
    job: ProcessingJob,
    emails: EmailMessage[]
  ): Promise<ProcessingResult[]> {
    const batchSize = 10;
    const results: ProcessingResult[] = [];
    const userContext = await this.getUserContext(job.userId);

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      // Update progress
      job.progress = 10 + Math.floor((i / emails.length) * 80);
      await this.updateJob(job);

      // Process batch
      const batchResults = await this.processBatch(batch, userContext);
      results.push(...batchResults);

      // Add delay between batches to respect rate limits
      if (i + batchSize < emails.length) {
        await this.delay(1000);
      }
    }

    return results;
  }

  /**
   * Process a batch of emails
   */
  private async processBatch(
    emails: EmailMessage[],
    userContext: unknown
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];

    // Prepare analysis requests
    const requests: AnalysisRequest[] = emails.map(email => ({
      email,
      userContext,
      batchId: this.generateBatchId()
    }));

    // Analyze emails in parallel
    const analysisResponses = await this.analyzer.analyzeBatch(requests);

    // Combine results
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const analysisResponse = analysisResponses[i];
      
      const result: ProcessingResult = {
        emailId: email.id,
        email,
        analysis: analysisResponse.analysis,
        success: analysisResponse.success,
        error: analysisResponse.error,
        processingTime: analysisResponse.analysis.processingTime
      };

      results.push(result);
    }

    return results;
  }

  /**
   * Store processing results
   */
  private async storeResults(job: ProcessingJob): Promise<void> {
    const { error } = await this.supabase
      .from('email_analyses')
      .upsert(
        job.results.map(result => ({
          id: result.emailId,
          user_id: job.userId,
          email_data: result.email,
          analysis_data: result.analysis,
          success: result.success,
          error: result.error,
          processing_time: result.processingTime,
          created_at: new Date().toISOString()
        }))
      );

    if (error) {
      console.error('Error storing results:', error);
      throw new ProcessingError(
        'Failed to store analysis results',
        'STORAGE_ERROR',
        true,
        job.id
      );
    }
  }

  /**
   * Get user context for analysis
   */
  private async getUserContext(userId: string): Promise<unknown> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('role, industry, preferences, vip_contacts')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return {
          role: 'Professional',
          industry: 'General',
          preferences: [],
          vipContacts: []
        };
      }

      return {
        role: data.role || 'Professional',
        industry: data.industry || 'General',
        preferences: data.preferences || [],
        vipContacts: data.vip_contacts || []
      };
    } catch (error) {
      console.error('Error fetching user context:', error);
      return {
        role: 'Professional',
        industry: 'General',
        preferences: [],
        vipContacts: []
      };
    }
  }

  /**
   * Store job in database
   */
  private async storeJob(job: ProcessingJob): Promise<void> {
    const { error } = await this.supabase
      .from('email_processing_jobs')
      .insert({
        id: job.id,
        user_id: job.userId,
        providers: job.providers,
        options: job.options,
        status: job.status,
        progress: job.progress,
        total_emails: job.totalEmails,
        processed_emails: job.processedEmails,
        created_at: job.createdAt.toISOString(),
        updated_at: job.updatedAt.toISOString(),
        error: job.error
      });

    if (error) {
      console.error('Error storing job:', error);
      throw new ProcessingError(
        'Failed to store processing job',
        'STORAGE_ERROR',
        true,
        job.id
      );
    }
  }

  /**
   * Update job in database
   */
  private async updateJob(job: ProcessingJob): Promise<void> {
    const { error } = await this.supabase
      .from('email_processing_jobs')
      .update({
        status: job.status,
        progress: job.progress,
        total_emails: job.totalEmails,
        processed_emails: job.processedEmails,
        updated_at: job.updatedAt.toISOString(),
        error: job.error
      })
      .eq('id', job.id);

    if (error) {
      console.error('Error updating job:', error);
    }
  }

  /**
   * Real-time email monitoring
   */
  async setupRealTimeMonitoring(
    userId: string,
    providers: EmailProvider[],
    callback: (email: EmailMessage, analysis: EmailAnalysis) => void
  ): Promise<void> {
    for (const provider of providers) {
      try {
        await this.fetcher.setupRealtimeMonitoring(provider, async (email) => {
          // Analyze the new email
          const userContext = await this.getUserContext(userId);
          const request: AnalysisRequest = {
            email,
            userContext
          };

          const response = await this.analyzer.analyzeEmail(request);
          
          if (response.success) {
            callback(email, response.analysis);
          }
        });
      } catch (error) {
        console.error(`Error setting up real-time monitoring for ${provider.name}:`, error);
      }
    }
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(userId: string): Promise<{
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    totalEmailsProcessed: number;
    averageProcessingTime: number;
  }> {
    const { data, error } = await this.supabase
      .from('email_processing_jobs')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) {
      return {
        totalJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
        totalEmailsProcessed: 0,
        averageProcessingTime: 0
      };
    }

    const jobs = data as ProcessingJob[];
    const completedJobs = jobs.filter(job => job.status === 'completed');
    const failedJobs = jobs.filter(job => job.status === 'failed');
    const totalEmailsProcessed = completedJobs.reduce((sum, job) => sum + job.processedEmails, 0);

    // Calculate average processing time
    const processingTimes = completedJobs.map(job => 
      job.updatedAt.getTime() - job.createdAt.getTime()
    );
    const averageProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;

    return {
      totalJobs: jobs.length,
      completedJobs: completedJobs.length,
      failedJobs: failedJobs.length,
      totalEmailsProcessed,
      averageProcessingTime
    };
  }

  /**
   * Clean up old jobs and results
   */
  async cleanupOldData(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Clean up old jobs
    const { error: jobError } = await this.supabase
      .from('email_processing_jobs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (jobError) {
      console.error('Error cleaning up old jobs:', jobError);
    }

    // Clean up old analyses
    const { error: analysisError } = await this.supabase
      .from('email_analyses')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (analysisError) {
      console.error('Error cleaning up old analyses:', analysisError);
    }
  }

  /**
   * Utility methods
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 