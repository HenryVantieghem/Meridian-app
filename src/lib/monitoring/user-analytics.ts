import { NextRequest } from 'next/server';

// User event types
export enum UserEventType {
  PAGE_VIEW = 'page_view',
  BUTTON_CLICK = 'button_click',
  FORM_SUBMIT = 'form_submit',
  EMAIL_OPEN = 'email_open',
  EMAIL_REPLY = 'email_reply',
  EMAIL_DELEGATE = 'email_delegate',
  AI_GENERATE = 'ai_generate',
  AI_EDIT = 'ai_edit',
  PAYMENT_START = 'payment_start',
  PAYMENT_COMPLETE = 'payment_complete',
  ONBOARDING_STEP = 'onboarding_step',
  FEATURE_USE = 'feature_use',
  ERROR_OCCURRED = 'error_occurred',
  SESSION_START = 'session_start',
  SESSION_END = 'session_end'
}

// User properties interface
export interface UserProperties {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  plan?: string;
  signupDate: Date;
  lastActive: Date;
  timezone?: string;
  language?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

// Event interface
export interface UserEvent {
  id: string;
  userId: string;
  sessionId: string;
  type: UserEventType;
  timestamp: Date;
  url: string;
  properties: Record<string, any>;
  context: {
    userAgent: string;
    ip: string;
    referrer?: string;
    utmParams?: Record<string, string>;
  };
}

// User analytics service
export class UserAnalyticsService {
  private events: UserEvent[] = [];
  private users: Map<string, UserProperties> = new Map();
  private sessions: Map<string, { startTime: Date; endTime?: Date }> = new Map();

  /**
   * Track user event
   */
  trackEvent(
    userId: string,
    sessionId: string,
    type: UserEventType,
    properties: Record<string, any> = {},
    req?: NextRequest
  ): void {
    const event: UserEvent = {
      id: this.generateEventId(),
      userId,
      sessionId,
      type,
      timestamp: new Date(),
      url: req?.url || (typeof window !== 'undefined' ? window.location.href : ''),
      properties,
      context: {
        userAgent: req?.headers.get('user-agent') || (typeof window !== 'undefined' ? navigator.userAgent : ''),
        ip: req?.headers.get('x-forwarded-for') || 'unknown',
        referrer: req?.headers.get('referer') || (typeof window !== 'undefined' ? document.referrer : ''),
        utmParams: this.extractUTMParams(req?.url || (typeof window !== 'undefined' ? window.location.href : ''))
      }
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  /**
   * Track page view
   */
  trackPageView(
    userId: string,
    sessionId: string,
    page: string,
    title?: string,
    req?: NextRequest
  ): void {
    this.trackEvent(userId, sessionId, UserEventType.PAGE_VIEW, {
      page,
      title,
      referrer: req?.headers.get('referer') || (typeof window !== 'undefined' ? document.referrer : '')
    }, req);
  }

  /**
   * Track button click
   */
  trackButtonClick(
    userId: string,
    sessionId: string,
    buttonId: string,
    buttonText?: string,
    page?: string
  ): void {
    this.trackEvent(userId, sessionId, UserEventType.BUTTON_CLICK, {
      buttonId,
      buttonText,
      page: page || (typeof window !== 'undefined' ? window.location.pathname : '')
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmit(
    userId: string,
    sessionId: string,
    formId: string,
    formData?: Record<string, any>,
    success?: boolean
  ): void {
    this.trackEvent(userId, sessionId, UserEventType.FORM_SUBMIT, {
      formId,
      success,
      fieldCount: formData ? Object.keys(formData).length : 0
    });
  }

  /**
   * Track email interaction
   */
  trackEmailInteraction(
    userId: string,
    sessionId: string,
    emailId: string,
    action: 'open' | 'reply' | 'delegate' | 'archive',
    emailSubject?: string,
    senderEmail?: string
  ): void {
    const eventType = action === 'open' ? UserEventType.EMAIL_OPEN :
                     action === 'reply' ? UserEventType.EMAIL_REPLY :
                     UserEventType.EMAIL_DELEGATE;

    this.trackEvent(userId, sessionId, eventType, {
      emailId,
      emailSubject,
      senderEmail,
      action
    });
  }

  /**
   * Track AI interaction
   */
  trackAIInteraction(
    userId: string,
    sessionId: string,
    action: 'generate' | 'edit',
    context: string,
    tokensUsed?: number,
    confidence?: number
  ): void {
    const eventType = action === 'generate' ? UserEventType.AI_GENERATE : UserEventType.AI_EDIT;

    this.trackEvent(userId, sessionId, eventType, {
      context,
      tokensUsed,
      confidence,
      action
    });
  }

  /**
   * Track payment event
   */
  trackPaymentEvent(
    userId: string,
    sessionId: string,
    action: 'start' | 'complete' | 'cancel' | 'error',
    amount?: number,
    currency?: string,
    plan?: string
  ): void {
    const eventType = action === 'start' ? UserEventType.PAYMENT_START : UserEventType.PAYMENT_COMPLETE;

    this.trackEvent(userId, sessionId, eventType, {
      action,
      amount,
      currency,
      plan
    });
  }

  /**
   * Track onboarding progress
   */
  trackOnboardingStep(
    userId: string,
    sessionId: string,
    step: number,
    stepName: string,
    completed: boolean,
    timeSpent?: number
  ): void {
    this.trackEvent(userId, sessionId, UserEventType.ONBOARDING_STEP, {
      step,
      stepName,
      completed,
      timeSpent
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUse(
    userId: string,
    sessionId: string,
    feature: string,
    usageCount: number = 1
  ): void {
    this.trackEvent(userId, sessionId, UserEventType.FEATURE_USE, {
      feature,
      usageCount
    });
  }

  /**
   * Track session start
   */
  trackSessionStart(
    userId: string,
    sessionId: string,
    req?: NextRequest
  ): void {
    this.sessions.set(sessionId, { startTime: new Date() });
    
    this.trackEvent(userId, sessionId, UserEventType.SESSION_START, {
      sessionDuration: 0
    }, req);
  }

  /**
   * Track session end
   */
  trackSessionEnd(
    userId: string,
    sessionId: string,
    duration?: number
  ): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.endTime = new Date();
      const sessionDuration = duration || (session.endTime.getTime() - session.startTime.getTime());
      
      this.trackEvent(userId, sessionId, UserEventType.SESSION_END, {
        sessionDuration
      });
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(userId: string, properties: Partial<UserProperties>): void {
    const existing = this.users.get(userId) || {
      userId,
      email: '',
      signupDate: new Date(),
      lastActive: new Date()
    };

    this.users.set(userId, { ...existing, ...properties, lastActive: new Date() });
  }

  /**
   * Get user properties
   */
  getUserProperties(userId: string): UserProperties | undefined {
    return this.users.get(userId);
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Extract UTM parameters from URL
   */
  private extractUTMParams(url: string): Record<string, string> {
    const urlObj = new URL(url);
    const utmParams: Record<string, string> = {};
    
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
      const value = urlObj.searchParams.get(param);
      if (value) {
        utmParams[param] = value;
      }
    });
    
    return utmParams;
  }

  /**
   * Send event to analytics service
   */
  private async sendEvent(event: UserEvent): Promise<void> {
    try {
      // Send to external analytics service (e.g., Mixpanel, Amplitude, etc.)
      if (process.env.ANALYTICS_ENDPOINT) {
        await fetch(process.env.ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`
          },
          body: JSON.stringify(event)
        });
      }

      // Log locally in development
      if (process.env.NODE_ENV === 'development') {
        console.log('User event:', event);
      }
    } catch (error) {
      console.error('Failed to send user event:', error);
    }
  }

  /**
   * Get user engagement metrics
   */
  getUserEngagement(userId: string, days: number = 30): {
    totalEvents: number;
    uniqueDays: number;
    averageEventsPerDay: number;
    mostUsedFeatures: Array<{ feature: string; count: number }>;
    sessionCount: number;
    averageSessionDuration: number;
  } {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const userEvents = this.events.filter(e => 
      e.userId === userId && e.timestamp > cutoff
    );

    const totalEvents = userEvents.length;
    const uniqueDays = new Set(userEvents.map(e => 
      e.timestamp.toDateString()
    )).size;
    const averageEventsPerDay = totalEvents / days;

    // Most used features
    const featureCounts = userEvents
      .filter(e => e.type === UserEventType.FEATURE_USE)
      .reduce((acc, event) => {
        const feature = event.properties.feature;
        acc[feature] = (acc[feature] || 0) + (event.properties.usageCount || 1);
        return acc;
      }, {} as Record<string, number>);

    const mostUsedFeatures = Object.entries(featureCounts)
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Session metrics
    const userSessions = Array.from(this.sessions.entries())
      .filter(([sessionId]) => 
        userEvents.some(e => e.sessionId === sessionId)
      );

    const sessionCount = userSessions.length;
    const sessionDurations = userSessions
      .map(([_, session]) => {
        if (session.endTime) {
          return session.endTime.getTime() - session.startTime.getTime();
        }
        return 0;
      })
      .filter(duration => duration > 0);

    const averageSessionDuration = sessionDurations.length > 0 
      ? sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length
      : 0;

    return {
      totalEvents,
      uniqueDays,
      averageEventsPerDay,
      mostUsedFeatures,
      sessionCount,
      averageSessionDuration
    };
  }

  /**
   * Get conversion funnel
   */
  getConversionFunnel(funnelSteps: string[], days: number = 30): {
    step: string;
    count: number;
    conversionRate: number;
  }[] {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const events = this.events.filter(e => e.timestamp > cutoff);

    const funnel = funnelSteps.map((step, index) => {
      const stepEvents = events.filter(e => 
        e.type === UserEventType.PAGE_VIEW && 
        e.properties.page === step
      );
      
      const count = stepEvents.length;
      const previousCount = index > 0 ? 
        events.filter(e => 
          e.type === UserEventType.PAGE_VIEW && 
          e.properties.page === funnelSteps[index - 1]
        ).length : count;
      
      const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 0;

      return {
        step,
        count,
        conversionRate
      };
    });

    return funnel;
  }

  /**
   * Get user retention
   */
  getUserRetention(days: number = 30): {
    cohort: string;
    totalUsers: number;
    retainedUsers: number;
    retentionRate: number;
  }[] {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const signupEvents = this.events.filter(e => 
      e.type === UserEventType.SESSION_START && 
      e.timestamp > cutoff
    );

    const cohorts = signupEvents.reduce((acc, event) => {
      const week = this.getWeekOfYear(event.timestamp);
      if (!acc[week]) {
        acc[week] = new Set();
      }
      acc[week].add(event.userId);
      return acc;
    }, {} as Record<string, Set<string>>);

    return Object.entries(cohorts).map(([cohort, users]) => {
      const totalUsers = users.size;
      const retainedUsers = Array.from(users).filter(userId => {
        const userEvents = this.events.filter(e => 
          e.userId === userId && 
          e.timestamp > cutoff
        );
        return userEvents.length > 1; // More than just signup
      }).length;

      return {
        cohort,
        totalUsers,
        retainedUsers,
        retentionRate: (retainedUsers / totalUsers) * 100
      };
    });
  }

  /**
   * Get week of year
   */
  private getWeekOfYear(date: Date): string {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  }

  /**
   * Clear old events
   */
  clearOldEvents(maxAge: number = 90 * 24 * 60 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - maxAge);
    this.events = this.events.filter(event => event.timestamp > cutoff);
  }
}

// Analytics middleware for API routes
export function analyticsMiddleware(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<Response>
): Promise<Response> {
  const analytics = new UserAnalyticsService();
  const userId = req.headers.get('x-user-id');
  const sessionId = req.headers.get('x-session-id');

  if (userId && sessionId) {
    analytics.trackPageView(userId, sessionId, req.nextUrl.pathname, undefined, req);
  }

  return handler(req);
}

// Export singleton
export const userAnalytics = new UserAnalyticsService(); 