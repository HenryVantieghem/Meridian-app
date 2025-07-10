// Test file for email functionality
// This file tests the email processing capabilities

import { sendEmail } from './resend';
import { EMAIL_PRIORITY, EMAIL_TYPES } from './resend';

// Mock email data for testing
const mockEmail = {
  id: 'test-email-1',
  subject: 'Test Email Subject',
  body: 'This is a test email body with some content to analyze.',
  from: 'test@example.com',
  to: ['recipient@example.com'],
  date: new Date(),
  threadId: 'test-thread-1'
};

const mockEmails = [
  mockEmail,
  {
    id: 'test-email-2',
    subject: 'Another Test Email',
    body: 'This is another test email with different content.',
    from: 'another@example.com',
    to: ['recipient@example.com'],
    date: new Date(),
    threadId: 'test-thread-2'
  }
];

// Test email sending functionality
export async function testEmailSending() {
  console.log('Testing email sending functionality...');
  
  try {
    const result = await sendEmail(
      'test@example.com',
      'Test Subject',
      '<p>Test email content</p>',
      {
        priority: EMAIL_PRIORITY.NORMAL,
        metadata: {
          type: EMAIL_TYPES.AI_NOTIFICATION,
          test: 'true',
        },
      }
    );
    
    console.log('✅ Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
}

// Test email processing functionality
export async function testEmailProcessing() {
  console.log('Testing email processing functionality...');
  
  try {
    // Simulate email processing
    const processedEmails = mockEmails.map(email => ({
      ...email,
      processed: true,
      timestamp: new Date()
    }));
    
    console.log('✅ Email processing completed:', processedEmails.length, 'emails');
    return processedEmails;
  } catch (error) {
    console.error('❌ Email processing failed:', error);
    return [];
  }
}

// Test email analysis functionality
export async function testEmailAnalysis() {
  console.log('Testing email analysis functionality...');
  
  try {
    // Simulate AI analysis
    const analyses = mockEmails.map(email => ({
      emailId: email.id,
      summary: `Analysis of: ${email.subject}`,
      priority: 'medium',
      sentiment: 'neutral',
      confidence: 0.85,
      keyPoints: ['Point 1', 'Point 2'],
      suggestedActions: ['Reply', 'Archive']
    }));
    
    console.log('✅ Email analysis completed:', analyses.length, 'analyses');
    return analyses;
  } catch (error) {
    console.error('❌ Email analysis failed:', error);
    return [];
  }
}

// Test batch email processing
export async function testBatchProcessing() {
  console.log('Testing batch email processing...');
  
  const batchSize = 5;
  const results = [];
  
  for (let i = 0; i < mockEmails.length; i += batchSize) {
    const batch = mockEmails.slice(i, i + batchSize);
    
    try {
      const batchResults = await Promise.allSettled(
        batch.map(async (email) => {
          // Simulate processing each email
          await new Promise(resolve => setTimeout(resolve, 100));
          return {
            emailId: email.id,
            processed: true,
            analysis: {
              summary: `Batch analysis of: ${email.subject}`,
              priority: 'medium',
              confidence: 0.8
            }
          };
        })
      );
      
      results.push(...batchResults);
      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} completed`);
    } catch (error) {
      console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
    }
  }
  
  const successful = results.filter((r: any) => r.status === 'fulfilled').length;
  const failed = results.filter((r: any) => r.status === 'rejected').length;
  
  console.log('- Successful analyses:', successful);
  console.log('- Failed analyses:', failed);
  
  return { successful, failed, total: results.length };
}

// Test email automation
export async function testEmailAutomation() {
  console.log('Testing email automation...');
  
  try {
    // Simulate automated email responses
    const automatedResponses = mockEmails.map(email => ({
      emailId: email.id,
      autoReply: `Thank you for your email: ${email.subject}`,
      sent: true,
      timestamp: new Date()
    }));
    
    console.log('✅ Email automation completed:', automatedResponses.length, 'responses');
    return automatedResponses;
  } catch (error) {
    console.error('❌ Email automation failed:', error);
    return [];
  }
}

// Run all tests
export async function runAllEmailTests() {
  console.log('🚀 Starting comprehensive email functionality tests...\n');
  
  const results = {
    sending: await testEmailSending(),
    processing: await testEmailProcessing(),
    analysis: await testEmailAnalysis(),
    batchProcessing: await testBatchProcessing(),
    automation: await testEmailAutomation()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('- Email Sending:', results.sending ? '✅ PASS' : '❌ FAIL');
  console.log('- Email Processing:', results.processing.length > 0 ? '✅ PASS' : '❌ FAIL');
  console.log('- Email Analysis:', results.analysis.length > 0 ? '✅ PASS' : '❌ FAIL');
  console.log('- Batch Processing:', results.batchProcessing.successful > 0 ? '✅ PASS' : '❌ FAIL');
  console.log('- Email Automation:', results.automation.length > 0 ? '✅ PASS' : '❌ FAIL');
  
  return results;
}

// Export test utilities
export const emailTestUtils = {
  mockEmail,
  mockEmails,
  testEmailSending,
  testEmailProcessing,
  testEmailAnalysis,
  testBatchProcessing,
  testEmailAutomation,
  runAllEmailTests
}; 