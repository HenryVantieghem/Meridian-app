import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useEmails } from "../useEmails";

// Mock dependencies
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ userId: "test-user-id" }),
}));

vi.mock("@/lib/db/emails", () => ({
  getEmails: vi.fn(),
  updateEmail: vi.fn(),
  deleteEmail: vi.fn(),
}));

vi.mock("@/lib/email/sync-service", () => ({
  emailSyncService: {
    syncEmails: vi.fn(),
    getSyncStatus: vi.fn(),
  },
}));

vi.mock("@/lib/cache", () => ({
  emailCache: {
    getEmails: vi.fn(),
    setEmails: vi.fn(),
    invalidateEmails: vi.fn(),
  },
}));

describe("useEmails", () => {
  const mockEmails = [
    {
      id: "1",
      subject: "Test Email 1",
      from: "test@example.com",
      read: false,
      priority: "high" as const,
      archived: false,
    },
    {
      id: "2",
      subject: "Test Email 2",
      from: "test2@example.com",
      read: true,
      priority: "medium" as const,
      archived: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() => useEmails());

    expect(result.current.emails).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.hasMore).toBe(true);
  });

  it("fetches emails on mount", async () => {
    const { getEmails } = await import("@/lib/db/emails");
    vi.mocked(getEmails).mockResolvedValue(mockEmails);

    const { result } = renderHook(() => useEmails());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.emails).toEqual(mockEmails);
    expect(getEmails).toHaveBeenCalledWith("test-user-id");
  });

  it("filters emails by status", async () => {
    const { getEmails } = await import("@/lib/db/emails");
    vi.mocked(getEmails).mockResolvedValue(mockEmails);

    const { result } = renderHook(() => useEmails({ status: "unread" }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.emails).toHaveLength(1);
    expect(result.current.emails[0].read).toBe(false);
  });

  it("filters emails by priority", async () => {
    const { getEmails } = await import("@/lib/db/emails");
    vi.mocked(getEmails).mockResolvedValue(mockEmails);

    const { result } = renderHook(() => useEmails({ priority: "high" }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.emails).toHaveLength(1);
    expect(result.current.emails[0].priority).toBe("high");
  });

  it("handles fetch errors", async () => {
    const { getEmails } = await import("@/lib/db/emails");
    vi.mocked(getEmails).mockRejectedValue(new Error("Fetch failed"));

    const { result } = renderHook(() => useEmails());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Fetch failed");
    expect(result.current.emails).toEqual([]);
  });

  it("marks email as read", async () => {
    const { getEmails, updateEmail } = await import("@/lib/db/emails");
    const { emailCache } = await import("@/lib/cache");

    vi.mocked(getEmails).mockResolvedValue(mockEmails);
    vi.mocked(updateEmail).mockResolvedValue(undefined);
    vi.mocked(emailCache.invalidateEmails).mockResolvedValue(undefined);

    const { result } = renderHook(() => useEmails());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.markAsRead("1");
    });

    expect(updateEmail).toHaveBeenCalledWith("test-user-id", "1", {
      read: true,
    });
    expect(emailCache.invalidateEmails).toHaveBeenCalledWith("test-user-id");
    expect(result.current.emails[0].read).toBe(true);
  });

  it("marks email as unread", async () => {
    const { getEmails, updateEmail } = await import("@/lib/db/emails");
    const { emailCache } = await import("@/lib/cache");

    vi.mocked(getEmails).mockResolvedValue(mockEmails);
    vi.mocked(updateEmail).mockResolvedValue(undefined);
    vi.mocked(emailCache.invalidateEmails).mockResolvedValue(undefined);

    const { result } = renderHook(() => useEmails());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.markAsUnread("2");
    });

    expect(updateEmail).toHaveBeenCalledWith("test-user-id", "2", {
      read: false,
    });
    expect(emailCache.invalidateEmails).toHaveBeenCalledWith("test-user-id");
    expect(result.current.emails[1].read).toBe(false);
  });

  it("deletes email", async () => {
    const { getEmails, deleteEmail } = await import("@/lib/db/emails");
    const { emailCache } = await import("@/lib/cache");

    vi.mocked(getEmails).mockResolvedValue(mockEmails);
    vi.mocked(deleteEmail).mockResolvedValue(undefined);
    vi.mocked(emailCache.invalidateEmails).mockResolvedValue(undefined);

    const { result } = renderHook(() => useEmails());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteEmail("1");
    });

    expect(deleteEmail).toHaveBeenCalledWith("test-user-id", "1");
    expect(emailCache.invalidateEmails).toHaveBeenCalledWith("test-user-id");
    expect(result.current.emails).toHaveLength(1);
    expect(result.current.emails[0].id).toBe("2");
  });

  it("updates email priority", async () => {
    const { getEmails, updateEmail } = await import("@/lib/db/emails");
    const { emailCache } = await import("@/lib/cache");

    vi.mocked(getEmails).mockResolvedValue(mockEmails);
    vi.mocked(updateEmail).mockResolvedValue(undefined);
    vi.mocked(emailCache.invalidateEmails).mockResolvedValue(undefined);

    const { result } = renderHook(() => useEmails());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updatePriority("1", "low");
    });

    expect(updateEmail).toHaveBeenCalledWith("test-user-id", "1", {
      priority: "low",
    });
    expect(emailCache.invalidateEmails).toHaveBeenCalledWith("test-user-id");
    expect(result.current.emails[0].priority).toBe("low");
  });

  it("syncs emails", async () => {
    const { emailSyncService } = await import("@/lib/email/sync-service");
    const { emailCache } = await import("@/lib/cache");

    vi.mocked(emailSyncService.syncEmails).mockResolvedValue({
      success: true,
      errors: [],
    });
    vi.mocked(emailSyncService.getSyncStatus).mockResolvedValue({
      lastSync: new Date(),
      emailsCount: 10,
      isActive: true,
    });
    vi.mocked(emailCache.invalidateEmails).mockResolvedValue(undefined);

    const { result } = renderHook(() => useEmails());

    await act(async () => {
      await result.current.syncEmails();
    });

    expect(emailSyncService.syncEmails).toHaveBeenCalledWith({
      userId: "test-user-id",
      maxResults: 100,
      forceFullSync: false,
    });
    expect(emailCache.invalidateEmails).toHaveBeenCalledWith("test-user-id");
  });

  it("loads more emails", async () => {
    const { getEmails } = await import("@/lib/db/emails");
    vi.mocked(getEmails).mockResolvedValue(mockEmails);

    const { result } = renderHook(() => useEmails({ limit: 1 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.page).toBe(2);
  });

  it("refreshes emails", async () => {
    const { getEmails } = await import("@/lib/db/emails");
    vi.mocked(getEmails).mockResolvedValue(mockEmails);

    const { result } = renderHook(() => useEmails());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(getEmails).toHaveBeenCalledTimes(2);
  });

  it("handles sync errors", async () => {
    const { emailSyncService } = await import("@/lib/email/sync-service");
    vi.mocked(emailSyncService.syncEmails).mockResolvedValue({
      success: false,
      errors: ["Sync failed"],
    });

    const { result } = renderHook(() => useEmails());

    await act(async () => {
      await result.current.syncEmails();
    });

    expect(result.current.error).toBe("Sync failed: Sync failed");
  });

  it("updates sync status", async () => {
    const { emailSyncService } = await import("@/lib/email/sync-service");
    const mockStatus = {
      lastSync: new Date(),
      emailsCount: 5,
      isActive: true,
    };

    vi.mocked(emailSyncService.getSyncStatus).mockResolvedValue(mockStatus);

    const { result } = renderHook(() => useEmails());

    await waitFor(() => {
      expect(result.current.syncStatus).toEqual(mockStatus);
    });
  });

  it("uses cache when available", async () => {
    const { emailCache } = await import("@/lib/cache");
    vi.mocked(emailCache.getEmails).mockResolvedValue(mockEmails);

    const { result } = renderHook(() => useEmails());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(emailCache.getEmails).toHaveBeenCalled();
    expect(result.current.emails).toEqual(mockEmails);
  });

  it("caches results after fetch", async () => {
    const { getEmails } = await import("@/lib/db/emails");
    const { emailCache } = await import("@/lib/cache");

    vi.mocked(getEmails).mockResolvedValue(mockEmails);
    vi.mocked(emailCache.getEmails).mockResolvedValue(null);
    vi.mocked(emailCache.setEmails).mockResolvedValue(undefined);

    const { result } = renderHook(() => useEmails());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(emailCache.setEmails).toHaveBeenCalled();
  });
});
