import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if service role key is available (server-only)
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
        { status: 500 },
      );
    }

    // Dynamically import to avoid build-time initialization
    const { backupRecoveryService } = await import(
      "@/lib/security/backup-recovery"
    );

    // Start full backup
    const backup = await backupRecoveryService.createFullBackup();

    return NextResponse.json({
      success: true,
      backup: {
        id: backup.id,
        type: backup.type,
        status: backup.status,
        createdAt: backup.createdAt,
        completedAt: backup.completedAt,
        size: backup.size,
        checksum: backup.checksum,
        location: backup.location,
        encrypted: backup.encrypted,
        tables: backup.tables,
      },
    });
  } catch (error) {
    console.error("Backup failed:", error);

    return NextResponse.json(
      {
        error: "Backup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    // Check if service role key is available (server-only)
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
        { status: 500 },
      );
    }

    // Dynamically import to avoid build-time initialization
    const { backupRecoveryService } = await import(
      "@/lib/security/backup-recovery"
    );

    // Get backup statistics
    const stats = await backupRecoveryService.getBackupStats();

    return NextResponse.json({
      success: true,
      stats: {
        totalBackups: stats.totalBackups,
        totalSize: stats.totalSize,
        lastBackupDate: stats.lastBackupDate,
        averageBackupSize: stats.averageBackupSize,
        backupSuccessRate: stats.backupSuccessRate,
      },
    });
  } catch (error) {
    console.error("Failed to get backup stats:", error);

    return NextResponse.json(
      {
        error: "Failed to get backup statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
export async function PUT(request: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { backupId } = body;

    if (!backupId) {
      return NextResponse.json(
        { error: "Backup ID is required" },
        { status: 400 },
      );
    }

    // Dynamically import to avoid build-time initialization
    const { backupRecoveryService } = await import(
      "@/lib/security/backup-recovery"
    );

    const recovery = await backupRecoveryService.restoreFromBackup(backupId);

    return NextResponse.json({
      success: true,
      recovery,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Restore failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get("id");

    if (!backupId) {
      return NextResponse.json(
        { error: "Backup ID is required" },
        { status: 400 },
      );
    }

    // Dynamically import to avoid build-time initialization
    const { backupRecoveryService } = await import(
      "@/lib/security/backup-recovery"
    );

    await backupRecoveryService.deleteBackup(backupId);

    return NextResponse.json({
      success: true,
      message: "Backup deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Delete backup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
