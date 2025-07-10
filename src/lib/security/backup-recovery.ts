import { createClient } from '@supabase/supabase-js';
import { encryptionService } from './encryption';
import { NextRequest, NextResponse } from 'next/server';

// Backup types
export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential'
}

export enum BackupStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RESTORED = 'restored'
}

// Backup interface
export interface Backup {
  id: string;
  type: BackupType;
  status: BackupStatus;
  createdAt: Date;
  completedAt?: Date;
  size: number;
  checksum: string;
  location: string;
  encrypted: boolean;
  tables: string[];
  metadata: Record<string, any>;
}

// Recovery interface
export interface Recovery {
  id: string;
  backupId: string;
  status: BackupStatus;
  startedAt: Date;
  completedAt?: Date;
  targetDatabase: string;
  tables: string[];
  metadata: Record<string, any>;
}

// Backup and recovery service
export class BackupRecoveryService {
  private supabase: any;
  private backupLocation: string;
  private encryptionKey: Buffer;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.backupLocation = process.env.BACKUP_LOCATION || './backups';
    this.encryptionKey = Buffer.from(process.env.BACKUP_ENCRYPTION_KEY || '', 'hex');
  }

  /**
   * Create a full backup
   */
  async createFullBackup(): Promise<Backup> {
    const backupId = this.generateBackupId();
    const backup: Backup = {
      id: backupId,
      type: BackupType.FULL,
      status: BackupStatus.PENDING,
      createdAt: new Date(),
      size: 0,
      checksum: '',
      location: '',
      encrypted: true,
      tables: [],
      metadata: {}
    };

    try {
      // Update status to in progress
      backup.status = BackupStatus.IN_PROGRESS;
      await this.saveBackupMetadata(backup);

      // Get all tables
      const tables = await this.getAllTables();
      backup.tables = tables;

      // Create backup for each table
      const backupData: Record<string, any> = {};
      
      for (const table of tables) {
        const data = await this.supabase
          .from(table)
          .select('*');
        
        if (data.data) {
          backupData[table] = data.data;
        }
      }

      // Encrypt backup data
      const encryptedData = await encryptionService.encrypt(JSON.stringify(backupData));
      
      // Save backup file
      const backupPath = `${this.backupLocation}/${backupId}.backup`;
      await this.saveBackupFile(backupPath, encryptedData);
      
      // Calculate checksum
      const checksum = this.calculateChecksum(encryptedData);
      
      // Update backup metadata
      backup.status = BackupStatus.COMPLETED;
      backup.completedAt = new Date();
      backup.size = encryptedData.length;
      backup.checksum = checksum;
      backup.location = backupPath;
      
      await this.saveBackupMetadata(backup);

      return backup;
    } catch (error) {
      backup.status = BackupStatus.FAILED;
      backup.metadata.error = error instanceof Error ? error.message : 'Unknown error';
      await this.saveBackupMetadata(backup);
      throw error;
    }
  }

  /**
   * Create incremental backup
   */
  async createIncrementalBackup(lastBackupId: string): Promise<Backup> {
    const backupId = this.generateBackupId();
    const backup: Backup = {
      id: backupId,
      type: BackupType.INCREMENTAL,
      status: BackupStatus.PENDING,
      createdAt: new Date(),
      size: 0,
      checksum: '',
      location: '',
      encrypted: true,
      tables: [],
      metadata: { lastBackupId }
    };

    try {
      // Get last backup
      const lastBackup = await this.getBackup(lastBackupId);
      if (!lastBackup) {
        throw new Error('Last backup not found');
      }

      backup.status = BackupStatus.IN_PROGRESS;
      await this.saveBackupMetadata(backup);

      // Get changes since last backup
      const changes: Record<string, any> = {};
      
      for (const table of lastBackup.tables) {
        const lastBackupTime = lastBackup.createdAt;
        
        const newData = await this.supabase
          .from(table)
          .select('*')
          .gte('updated_at', lastBackupTime.toISOString());
        
        if (newData.data && newData.data.length > 0) {
          changes[table] = newData.data;
        }
      }

      // Encrypt changes
      const encryptedData = await encryptionService.encrypt(JSON.stringify(changes));
      
      // Save backup file
      const backupPath = `${this.backupLocation}/${backupId}.backup`;
      await this.saveBackupFile(backupPath, encryptedData);
      
      // Update backup metadata
      backup.status = BackupStatus.COMPLETED;
      backup.completedAt = new Date();
      backup.size = encryptedData.length;
      backup.checksum = this.calculateChecksum(encryptedData);
      backup.location = backupPath;
      backup.tables = Object.keys(changes);
      
      await this.saveBackupMetadata(backup);

      return backup;
    } catch (error) {
      backup.status = BackupStatus.FAILED;
      backup.metadata.error = error instanceof Error ? error.message : 'Unknown error';
      await this.saveBackupMetadata(backup);
      throw error;
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId: string, targetDatabase?: string): Promise<Recovery> {
    const recovery: Recovery = {
      id: this.generateRecoveryId(),
      backupId,
      status: BackupStatus.IN_PROGRESS,
      startedAt: new Date(),
      targetDatabase: targetDatabase || 'default',
      tables: [],
      metadata: {}
    };

    try {
      // Get backup
      const backup = await this.getBackup(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      // Load backup data
      const encryptedData = await this.loadBackupFile(backup.location);
      
      // Verify checksum
      const checksum = this.calculateChecksum(encryptedData);
      if (checksum !== backup.checksum) {
        throw new Error('Backup checksum verification failed');
      }

      // Decrypt backup data
      const decryptedData = await encryptionService.decrypt(encryptedData);
      const backupData = JSON.parse(decryptedData);

      // Restore tables
      for (const [tableName, tableData] of Object.entries(backupData)) {
        if (Array.isArray(tableData) && tableData.length > 0) {
          // Clear existing data
          await this.supabase
            .from(tableName)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Keep system records

          // Insert backup data
          const { error } = await this.supabase
            .from(tableName)
            .insert(tableData);

          if (error) {
            throw new Error(`Failed to restore table ${tableName}: ${error.message}`);
          }

          recovery.tables.push(tableName);
        }
      }

      recovery.status = BackupStatus.RESTORED;
      recovery.completedAt = new Date();
      
      await this.saveRecoveryMetadata(recovery);

      return recovery;
    } catch (error) {
      recovery.status = BackupStatus.FAILED;
      recovery.metadata.error = error instanceof Error ? error.message : 'Unknown error';
      await this.saveRecoveryMetadata(recovery);
      throw error;
    }
  }

  /**
   * List all backups
   */
  async listBackups(): Promise<Backup[]> {
    try {
      const { data, error } = await this.supabase
        .from('backups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to list backups:', error);
      return [];
    }
  }

  /**
   * Get backup by ID
   */
  async getBackup(backupId: string): Promise<Backup | null> {
    try {
      const { data, error } = await this.supabase
        .from('backups')
        .select('*')
        .eq('id', backupId)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get backup:', error);
      return null;
    }
  }

  /**
   * Delete backup
   */
  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const backup = await this.getBackup(backupId);
      if (!backup) {
        return false;
      }

      // Delete backup file
      await this.deleteBackupFile(backup.location);

      // Delete backup metadata
      const { error } = await this.supabase
        .from('backups')
        .delete()
        .eq('id', backupId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      return false;
    }
  }

  /**
   * Verify backup integrity
   */
  async verifyBackup(backupId: string): Promise<boolean> {
    try {
      const backup = await this.getBackup(backupId);
      if (!backup) {
        return false;
      }

      // Load backup file
      const encryptedData = await this.loadBackupFile(backup.location);
      
      // Verify checksum
      const checksum = this.calculateChecksum(encryptedData);
      if (checksum !== backup.checksum) {
        return false;
      }

      // Try to decrypt
      const decryptedData = await encryptionService.decrypt(encryptedData);
      const backupData = JSON.parse(decryptedData);

      // Verify data structure
      if (typeof backupData !== 'object') {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Backup verification failed:', error);
      return false;
    }
  }

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    lastBackupDate?: Date;
    averageBackupSize: number;
    backupSuccessRate: number;
  }> {
    const backups = await this.listBackups();
    
    const totalBackups = backups.length;
    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    const lastBackupDate = backups.length > 0 ? backups[0].createdAt : undefined;
    const averageBackupSize = totalBackups > 0 ? totalSize / totalBackups : 0;
    const successfulBackups = backups.filter(b => b.status === BackupStatus.COMPLETED).length;
    const backupSuccessRate = totalBackups > 0 ? (successfulBackups / totalBackups) * 100 : 0;

    return {
      totalBackups,
      totalSize,
      lastBackupDate,
      averageBackupSize,
      backupSuccessRate
    };
  }

  /**
   * Generate backup ID
   */
  private generateBackupId(): string {
    return `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate recovery ID
   */
  private generateRecoveryId(): string {
    return `recovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all tables
   */
  private async getAllTables(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (error) {
        throw error;
      }

      return data?.map((row: { table_name: string }) => row.table_name) || [];
    } catch (error) {
      console.error('Failed to get tables:', error);
      return [];
    }
  }

  /**
   * Save backup metadata
   */
  private async saveBackupMetadata(backup: Backup): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('backups')
        .upsert({
          id: backup.id,
          type: backup.type,
          status: backup.status,
          created_at: backup.createdAt.toISOString(),
          completed_at: backup.completedAt?.toISOString(),
          size: backup.size,
          checksum: backup.checksum,
          location: backup.location,
          encrypted: backup.encrypted,
          tables: backup.tables,
          metadata: backup.metadata
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to save backup metadata:', error);
      throw error;
    }
  }

  /**
   * Save recovery metadata
   */
  private async saveRecoveryMetadata(recovery: Recovery): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('recoveries')
        .upsert({
          id: recovery.id,
          backup_id: recovery.backupId,
          status: recovery.status,
          started_at: recovery.startedAt.toISOString(),
          completed_at: recovery.completedAt?.toISOString(),
          target_database: recovery.targetDatabase,
          tables: recovery.tables,
          metadata: recovery.metadata
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to save recovery metadata:', error);
      throw error;
    }
  }

  /**
   * Save backup file
   */
  private async saveBackupFile(path: string, data: string): Promise<void> {
    // In a real implementation, you would save to cloud storage (S3, GCS, etc.)
    // For now, we'll simulate file saving
    console.log(`Saving backup to ${path}`);
  }

  /**
   * Load backup file
   */
  private async loadBackupFile(path: string): Promise<string> {
    // In a real implementation, you would load from cloud storage
    // For now, we'll simulate file loading
    console.log(`Loading backup from ${path}`);
    return 'encrypted-backup-data';
  }

  /**
   * Delete backup file
   */
  private async deleteBackupFile(path: string): Promise<void> {
    // In a real implementation, you would delete from cloud storage
    console.log(`Deleting backup file ${path}`);
  }

  /**
   * Calculate checksum
   */
  private calculateChecksum(data: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

// Backup API routes
export async function createBackupHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const backupService = new BackupRecoveryService();
    const { type = BackupType.FULL, lastBackupId } = await req.json();

    let backup: Backup;
    
    if (type === BackupType.INCREMENTAL && lastBackupId) {
      backup = await backupService.createIncrementalBackup(lastBackupId);
    } else {
      backup = await backupService.createFullBackup();
    }

    return NextResponse.json({
      success: true,
      data: backup
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Backup creation failed'
    }, { status: 500 });
  }
}

export async function restoreBackupHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const { backupId, targetDatabase } = await req.json();
    const backupService = new BackupRecoveryService();
    
    const recovery = await backupService.restoreFromBackup(backupId, targetDatabase);

    return NextResponse.json({
      success: true,
      data: recovery
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Backup restoration failed'
    }, { status: 500 });
  }
}

export async function listBackupsHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const backupService = new BackupRecoveryService();
    const backups = await backupService.listBackups();

    return NextResponse.json({
      success: true,
      data: backups
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list backups'
    }, { status: 500 });
  }
}

// Export singleton
export const backupRecoveryService = new BackupRecoveryService(); 