import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { slackManager } from "@/lib/integrations/slack";
import { withSecurity } from "@/lib/security/rate-limiting";
import { logger } from "@/lib/monitoring/logging";

// Initiate Slack OAuth
export const GET = withSecurity(
  async () => {
    try {
      const { userId } = await auth();

      if (!userId) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 },
        );
      }

      const authUrl = await slackManager.initiateOAuth(userId);

      logger.info("Slack OAuth initiated", { userId });

      return NextResponse.json({ authUrl });
    } catch (error) {
      logger.error("Failed to initiate Slack OAuth", error as Error);
      return NextResponse.json(
        { error: "Failed to initiate OAuth" },
        { status: 500 },
      );
    }
  },
  {
    rateLimit: "auth",
    requireAuth: true,
  },
);

// Handle Slack OAuth callback
export const POST = withSecurity(
  async (req: NextRequest) => {
    try {
      const { userId } = await auth();

      if (!userId) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 },
        );
      }

      const { code, state } = await req.json();

      if (!code || !state) {
        return NextResponse.json(
          { error: "Missing OAuth parameters" },
          { status: 400 },
        );
      }

      const integration = await slackManager.handleOAuthCallback(code, state);

      logger.info("Slack OAuth completed", {
        userId,
        workspaceId: integration.workspaceId,
      });

      return NextResponse.json({
        success: true,
        integration: {
          id: integration.id,
          workspaceId: integration.workspaceId,
          workspaceName: integration.workspaceName,
        },
      });
    } catch (error) {
      logger.error("Failed to handle Slack OAuth callback", error as Error);
      return NextResponse.json(
        { error: "OAuth callback failed" },
        { status: 500 },
      );
    }
  },
  {
    rateLimit: "auth",
    requireAuth: true,
  },
);
