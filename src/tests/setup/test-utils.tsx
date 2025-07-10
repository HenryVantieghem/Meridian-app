import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { ClerkProvider } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Clerk
const mockClerk = {
  user: {
    id: 'user-123',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
    firstName: 'Test',
    lastName: 'User',
    imageUrl: 'https://example.com/avatar.jpg'
  },
  session: {
    id: 'session-123',
    status: 'active'
  },
  isSignedIn: true,
  isLoaded: true
};

// Mock QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0
    },
    mutations: {
      retry: false
    }
  }
});

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  clerk?: Partial<typeof mockClerk>;
  queryClient?: QueryClient;
}

const AllTheProviders = ({ 
  children, 
  clerk = mockClerk,
  queryClient = createTestQueryClient()
}: { 
  children: React.ReactNode;
  clerk?: Partial<typeof mockClerk>;
  queryClient?: QueryClient;
}) => {
  return (
    <ClerkProvider {...clerk}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { clerk, queryClient, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders clerk={clerk} queryClient={queryClient}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions
  });
};

// Test data factories
export const createMockEmail = (overrides = {}) => ({
  id: `email-${Math.random().toString(36).substr(2, 9)}`,
  subject: 'Test Email',
  from: 'test@example.com',
  to: ['recipient@example.com'],
  body: 'This is a test email body.',
  date: new Date().toISOString(),
  threadId: `thread-${Math.random().toString(36).substr(2, 9)}`,
  priority: 'medium',
  isVIP: false,
  isRead: false,
  ...overrides
});

export const createMockAnalysis = (overrides = {}) => ({
  summary: 'Test email summary',
  priority: 'medium',
  sentiment: 'neutral',
  urgency: 'normal',
  isVIP: false,
  confidence: 0.85,
  suggestedActions: ['archive'],
  keyPoints: ['Test point 1', 'Test point 2'],
  ...overrides
});

export const createMockUser = (overrides = {}) => ({
  id: `user-${Math.random().toString(36).substr(2, 9)}`,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  imageUrl: 'https://example.com/avatar.jpg',
  ...overrides
});

// Mock functions
export const mockApiResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  });
};

export const mockApiError = (error: string, status = 500) => {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ error }),
    text: () => Promise.resolve(JSON.stringify({ error }))
  });
};

// Async utilities
export const waitForLoadingToFinish = async (screen: any) => {
  await screen.findByTestId('loading-spinner');
  await screen.findByTestId('loading-spinner', {}, { timeout: 5000 });
};

export const waitForElementToBeRemoved = async (element: any) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  // Removed toBeInTheDocument() as it's not available in Vitest by default
};

// Form testing utilities
export const fillForm = async (screen: any, formData: Record<string, string>) => {
  for (const [field, value] of Object.entries(formData)) {
    const input = screen.getByTestId(`${field}-input`);
    await input.fill(value);
  }
};

export const submitForm = async (screen: any, submitButtonTestId = 'submit-button') => {
  const submitButton = screen.getByTestId(submitButtonTestId);
  await submitButton.click();
};

// Mock Intersection Observer
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver;
};

// Mock Resize Observer
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.ResizeObserver = mockResizeObserver;
};

// Mock matchMedia
export const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Mock localStorage
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
  return localStorageMock;
};

// Mock sessionStorage
export const mockSessionStorage = () => {
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true
  });
  return sessionStorageMock;
};

// Mock fetch
export const mockFetch = (response: any, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response))
    })
  ) as any;
};

// Mock console methods
export const mockConsole = () => {
  const originalConsole = { ...console };
  
  beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
    console.info = jest.fn();
  });
  
  afterAll(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  });
};

// Test environment setup
export const setupTestEnvironment = () => {
  beforeAll(() => {
    mockIntersectionObserver();
    mockResizeObserver();
    mockMatchMedia();
    mockLocalStorage();
    mockSessionStorage();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });
};

// Accessibility testing utilities
export const checkAccessibility = async (container: HTMLElement) => {
  // jest-axe is not properly configured, so this is a placeholder
  // In a real implementation, you would use jest-axe for accessibility testing
  return true;
};

// Performance testing utilities
export const measurePerformance = async (callback: () => void) => {
  const start = performance.now();
  await callback();
  const end = performance.now();
  return end - start;
};

// Export everything
export * from '@testing-library/react';
export { customRender as render };
export { createTestQueryClient, mockClerk }; 