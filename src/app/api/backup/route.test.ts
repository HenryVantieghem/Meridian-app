import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the backup functions
vi.mock('@/lib/backup', () => ({
  createBackup: vi.fn(),
  restoreBackup: vi.fn(),
  listBackups: vi.fn(),
}));

describe('Backup API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle GET request to list backups', async () => {
    const { listBackups } = await import('@/lib/backup');
    const mockBackups = [
      { id: 'backup1', createdAt: new Date(), size: 1024 },
      { id: 'backup2', createdAt: new Date(), size: 2048 },
    ];

    (listBackups as jest.MockedFunction<typeof listBackups>).mockResolvedValue(mockBackups);

    const request = new NextRequest('http://localhost:3000/api/backup', {
      method: 'GET',
    });

    const response = await import('./route').then(m => m.GET(request));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ backups: mockBackups });
    expect(listBackups).toHaveBeenCalled();
  });

  it('should handle POST request to create backup', async () => {
    const { createBackup } = await import('@/lib/backup');
    const mockBackup = { id: 'backup1', createdAt: new Date(), size: 1024 };

    (createBackup as jest.MockedFunction<typeof createBackup>).mockResolvedValue(mockBackup);

    const request = new NextRequest('http://localhost:3000/api/backup', {
      method: 'POST',
      body: JSON.stringify({ type: 'full' }),
    });

    const response = await import('./route').then(m => m.POST(request));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ backup: mockBackup });
    expect(createBackup).toHaveBeenCalledWith({ type: 'full' });
  });

  it('should handle PUT request to restore backup', async () => {
    const { restoreBackup } = await import('@/lib/backup');
    const mockRestore = { success: true, restoredAt: new Date() };

    (restoreBackup as jest.MockedFunction<typeof restoreBackup>).mockResolvedValue(mockRestore);

    const request = new NextRequest('http://localhost:3000/api/backup', {
      method: 'PUT',
      body: JSON.stringify({ backupId: 'backup1' }),
    });

    const response = await import('./route').then(m => m.PUT(request));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ restore: mockRestore });
    expect(restoreBackup).toHaveBeenCalledWith({ backupId: 'backup1' });
  });

  it('should handle backup creation errors', async () => {
    const { createBackup } = await import('@/lib/backup');

    (createBackup as jest.MockedFunction<typeof createBackup>).mockRejectedValue(new Error('Backup failed'));

    const request = new NextRequest('http://localhost:3000/api/backup', {
      method: 'POST',
      body: JSON.stringify({ type: 'full' }),
    });

    const response = await import('./route').then(m => m.POST(request));

    expect(response.status).toBe(500);
  });

  it('should handle restore errors', async () => {
    const { restoreBackup } = await import('@/lib/backup');

    (restoreBackup as jest.MockedFunction<typeof restoreBackup>).mockRejectedValue(new Error('Restore failed'));

    const request = new NextRequest('http://localhost:3000/api/backup', {
      method: 'PUT',
      body: JSON.stringify({ backupId: 'backup1' }),
    });

    const response = await import('./route').then(m => m.PUT(request));

    expect(response.status).toBe(500);
  });

  it('should return 405 for unsupported methods', async () => {
    const request = new NextRequest('http://localhost:3000/api/backup', {
      method: 'DELETE',
    });

    const response = await import('./route').then(m => m.DELETE(request));

    expect(response.status).toBe(405);
  });
}); 