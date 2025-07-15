import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail, EMAIL_TYPES } from "@/lib/email/automation";

// Email send request schema
const emailSendSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  html: z.string().optional(),
  text: z.string().optional(),
  from: z.string().email().optional(),
  replyTo: z.string().email().optional(),
  priority: z.enum(["high", "normal", "low"]).default("normal"),
  type: z.enum(Object.values(EMAIL_TYPES) as [string, ...string[]]).optional(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = emailSendSchema.parse(body);

    // Send email (stub function since Resend is removed)
    await sendEmail({
      to: [validatedData.to],
      subject: validatedData.subject,
      html: validatedData.html,
      text: validatedData.text,
      from: validatedData.from,
      priority: validatedData.priority as "high" | "normal" | "low",
      metadata: {
        type: validatedData.type,
        ...validatedData.metadata,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully (Resend removed)",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Email send error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send email",
        message: "Email sending is disabled - Resend removed",
      },
      { status: 500 },
    );
  }
}
