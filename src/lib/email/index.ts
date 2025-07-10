// Email System Core
export * from './resend';
export * from './automation';
export * from './management';

// Email Templates
export * from '@/components/email';

// Email System Types
export type {
  EmailListType,
  UnsubscribeReasonType,
  BounceType,
} from './management';

// Email System Constants
export {
  EMAIL_TYPES,
  EMAIL_PRIORITY,
  EMAIL_CONFIG,
} from './resend';

export {
  EMAIL_LISTS,
  UNSUBSCRIBE_REASONS,
  BOUNCE_TYPES,
} from './management';

// Email System Services
export {
  emailAutomationService,
} from './automation';

// Email System Utilities
export {
  sendEmail,
  renderEmailTemplate,
  stripHtml,
  validateEmail,
  sanitizeEmail,
  trackEmailEvent,
  handleEmailError,
  EmailError,
} from './resend'; 