import { render, screen, waitFor } from "@testing-library/react";
import { ROIDashboard } from "../ROIDashboard";

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe("ROIDashboard", () => {
  beforeEach(() => {
    // Mock fetch for the component's API calls
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders loading state initially", () => {
    render(<ROIDashboard />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/loading roi metrics/i)).toBeInTheDocument();
  });

  it("displays executive metrics when loaded", async () => {
    render(<ROIDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Time Saved This Week")).toBeInTheDocument();
      expect(screen.getByText("Monthly Savings")).toBeInTheDocument();
      expect(screen.getByText("NPS Score")).toBeInTheDocument();
      expect(screen.getByText("Active Users")).toBeInTheDocument();
    });
  });

  it("shows time saved breakdown", async () => {
    render(<ROIDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Time Saved Breakdown")).toBeInTheDocument();
      expect(screen.getByText("Email Processing")).toBeInTheDocument();
      expect(screen.getByText("Meeting Prep")).toBeInTheDocument();
      expect(screen.getByText("Prioritization")).toBeInTheDocument();
      expect(screen.getByText("Drafting")).toBeInTheDocument();
    });
  });

  it("displays productivity metrics", async () => {
    render(<ROIDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Productivity Metrics")).toBeInTheDocument();
      expect(screen.getByText("Email Response Time")).toBeInTheDocument();
      expect(screen.getByText("Processing Speed")).toBeInTheDocument();
      expect(screen.getByText("Tasks Completed")).toBeInTheDocument();
    });
  });

  it("shows NPS breakdown with promoters, passives, and detractors", async () => {
    render(<ROIDashboard />);

    await waitFor(() => {
      expect(screen.getByText("NPS Breakdown")).toBeInTheDocument();
      expect(screen.getByText("Promoters")).toBeInTheDocument();
      expect(screen.getByText("Passives")).toBeInTheDocument();
      expect(screen.getByText("Detractors")).toBeInTheDocument();
    });
  });

  it("displays annual impact projection", async () => {
    render(<ROIDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Annual Impact Projection")).toBeInTheDocument();
      expect(screen.getByText("Time Saved Annually")).toBeInTheDocument();
      expect(screen.getByText("Annual Cost Savings")).toBeInTheDocument();
      expect(screen.getByText("Return on Investment")).toBeInTheDocument();
    });
  });

  it("formats currency values correctly", async () => {
    render(<ROIDashboard />);

    await waitFor(() => {
      // Check for formatted currency (should have $ symbol)
      expect(screen.getByText(/\$7,500/)).toBeInTheDocument();
      expect(screen.getByText(/\$90,000/)).toBeInTheDocument();
    });
  });

  it("shows progress bars for time saved metrics", async () => {
    render(<ROIDashboard />);

    await waitFor(() => {
      const progressBars = screen.getAllByRole("progressbar");
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  it("displays last updated timestamp", async () => {
    render(<ROIDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
    });
  });

  it("handles error state gracefully", async () => {
    // Mock fetch to reject
    global.fetch = jest.fn().mockRejectedValue(new Error("API Error"));

    render(<ROIDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error:/i)).toBeInTheDocument();
    });
  });

  it("uses proper color scheme for ROI indicators", async () => {
    render(<ROIDashboard />);

    await waitFor(() => {
      // Check for brand colors in the DOM
      const elements = document.querySelectorAll(
        '[class*="brand-burgundy"], [class*="brand-gold"]',
      );
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});
