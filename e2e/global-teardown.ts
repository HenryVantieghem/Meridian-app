// @ts-check
import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  // Global teardown for E2E tests
  // This can be used for:
  // - Cleaning up test data
  // - Logging out users
  // - Database cleanup
  // - Environment cleanup
  
  console.log('Running global teardown for E2E tests...');
  
  // For now, this is a no-op
  // Future implementations can include:
  // - Cleaning up test users
  // - Resetting test environment
  // - Cleaning up mock services
}

export default globalTeardown; 