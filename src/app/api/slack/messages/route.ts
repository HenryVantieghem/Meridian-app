import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { slackManager } from "@/lib/integrations/slack";
import { withSecurity } from "@/lib/security/rate-limiting";
import { logger } from "@/lib/monitoring/logging";

// Get messages from a Slack channel
export const GET = withSecurity(
  async (req: NextRequest) => {
    try {
      const { userId } = await auth();

      if (!userId) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 },
        );
      }

      const { searchParams } = new URL(req.url);
      const workspaceId = searchParams.get("workspaceId");
      const channelId = searchParams.get("channelId");
      const limit = parseInt(searchParams.get("limit") || "50");

      if (!workspaceId || !channelId) {
        return NextResponse.json(
          { error: "Missing workspaceId or channelId" },
          { status: 400 },
        );
      }

      const messages = await slackManager.getMessages(
        workspaceId,
        channelId,
        limit,
      );

      logger.info("Slack messages retrieved", {
        userId,
        workspaceId,
        channelId,
        count: messages.length,
      });

      return NextResponse.json({ messages });
    } catch (error) {
      logger.error("Failed to get Slack messages", error as Error);
      return NextResponse.json(
        { error: "Failed to retrieve messages" },
        { status: 500 },
      );
    }
  },
  {
    rateLimit: "api",
    requireAuth: true,
  },
);

// Send a message to a Slack channel
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

      const { workspaceId, channelId, text, threadTs } = await req.json();

      if (!workspaceId || !channelId || !text) {
        return NextResponse.json(
          { error: "Missing required parameters" },
          { status: 400 },
        );
      }

      const messageId = await slackManager.sendMessage(
        workspaceId,
        channelId,
        text,
        threadTs,
      );

      logger.info("Slack message sent", {
        userId,
        workspaceId,
        channelId,
        messageId,
      });

      return NextResponse.json({
        success: true,
        messageId,
      });
    } catch (error) {
      logger.error("Failed to send Slack message", error as Error);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 },
      );
    }
  },
  {
    rateLimit: "api",
    requireAuth: true,
  },
);
