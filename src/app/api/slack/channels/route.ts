import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { slackManager } from "@/lib/integrations/slack";
import { withSecurity } from "@/lib/security/rate-limiting";
import { logger } from "@/lib/monitoring/logging";

// Get channels from a Slack workspace
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

      if (!workspaceId) {
        return NextResponse.json(
          { error: "Missing workspaceId" },
          { status: 400 },
        );
      }

      const channels = await slackManager.getChannels(workspaceId);

      logger.info("Slack channels retrieved", {
        userId,
        workspaceId,
        count: channels.length,
      });

      return NextResponse.json({ channels });
    } catch (error) {
      logger.error("Failed to get Slack channels", error as Error);
      return NextResponse.json(
        { error: "Failed to retrieve channels" },
        { status: 500 },
      );
    }
  },
  {
    rateLimit: "api",
    requireAuth: true,
  },
);
