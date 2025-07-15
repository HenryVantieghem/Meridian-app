import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      recipient,
      subject,
      tone,
      context,
      priority,
      original_message,
      additional_context,
    } = await request.json();

    if (!recipient || !tone || !context) {
      return NextResponse.json(
        {
          error: "Recipient, tone, and context are required",
        },
        { status: 400 },
      );
    }

    // Build system prompt based on tone and context
    const systemPrompt = buildSystemPrompt(tone, context, priority);

    // Build user prompt
    const userPrompt = buildUserPrompt({
      recipient,
      subject,
      context,
      original_message,
      additional_context,
    });

    // Generate main draft
    const mainCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const mainDraft = mainCompletion.choices[0]?.message?.content || "";

    // Generate variations
    const variations = await generateVariations(
      systemPrompt,
      userPrompt,
      mainDraft,
    );

    // Generate subject if not provided
    const generatedSubject =
      subject || (await generateSubject(context, mainDraft));

    return NextResponse.json({
      success: true,
      content: mainDraft,
      subject: generatedSubject,
      variations: [mainDraft, ...variations],
      confidence: calculateConfidence(tone, context, mainDraft),
      metadata: {
        tone,
        context,
        priority,
        tokens_used: mainCompletion.usage?.total_tokens || 0,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("AI Draft Error:", error);
    return NextResponse.json(
      { error: "Failed to generate draft" },
      { status: 500 },
    );
  }
}

function buildSystemPrompt(
  tone: string,
  context: string,
  priority: string,
): string {
  const basePrompt = `You are an executive communication assistant for Napoleon AI. Generate professional, strategic communications that reflect C-suite level thinking.`;

  const toneInstructions = {
    executive:
      "Write in a decisive, strategic tone. Be authoritative but not arrogant. Focus on outcomes and decisions.",
    diplomatic:
      "Use tactful language that builds relationships. Be respectful and collaborative while maintaining professionalism.",
    direct:
      "Be clear, concise, and to the point. No unnecessary words. Focus on actionable information.",
    warm: "Use a friendly, approachable tone while maintaining professionalism. Show genuine interest in the recipient.",
    formal:
      "Use traditional business language. Be ceremonial and structured in your approach.",
    urgent:
      "Convey appropriate urgency without being panicked. Focus on time-sensitive actions and clear next steps.",
  };

  const contextInstructions = {
    reply:
      "You are responding to a received message. Acknowledge their communication and provide a thoughtful response.",
    "follow-up":
      "You are following up on previous communication. Reference prior discussions and move the conversation forward.",
    new: "You are initiating a new conversation. Provide clear context and purpose for your communication.",
    announcement:
      "You are making an announcement. Be clear, comprehensive, and anticipate questions.",
    meeting:
      "You are communicating about a meeting. Include relevant details and clear action items.",
    decision:
      "You are communicating a decision. Be clear about the decision, rationale, and next steps.",
  };

  const priorityInstructions = {
    high: "This is high priority. Reflect appropriate urgency and importance in your tone.",
    medium:
      "This is standard business priority. Maintain professional urgency.",
    low: "This is informational. Be thorough but not urgent.",
  };

  return `${basePrompt}

TONE: ${toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.executive}

CONTEXT: ${contextInstructions[context as keyof typeof contextInstructions] || contextInstructions.reply}

PRIORITY: ${priorityInstructions[priority as keyof typeof priorityInstructions] || priorityInstructions.medium}

GUIDELINES:
- Keep responses concise but comprehensive
- Use bullet points for multiple items
- Include clear next steps when appropriate
- Maintain executive-level professionalism
- Be specific and actionable
- Use appropriate business language
- End with a professional closing`;
}

function buildUserPrompt(params: any): string {
  const { recipient, subject, context, original_message, additional_context } =
    params;

  let prompt = `Generate a professional business communication with the following details:

RECIPIENT: ${recipient}
${subject ? `SUBJECT: ${subject}` : ""}
CONTEXT: ${context}`;

  if (original_message) {
    prompt += `\n\nORIGINAL MESSAGE TO RESPOND TO:
${original_message}`;
  }

  if (additional_context) {
    prompt += `\n\nADDITIONAL CONTEXT:
${additional_context}`;
  }

  prompt += `\n\nGenerate a complete, professional message that addresses the context appropriately. Include a proper greeting, body, and closing.`;

  return prompt;
}

async function generateVariations(
  systemPrompt: string,
  userPrompt: string,
  mainDraft: string,
): Promise<string[]> {
  try {
    const variations = [];

    // Generate 2 variations with different approaches
    const variationPrompts = [
      `${userPrompt}\n\nGenerate an alternative version that is more concise and action-oriented.`,
      `${userPrompt}\n\nGenerate an alternative version that is more detailed and explanatory.`,
    ];

    for (const prompt of variationPrompts) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: 600,
        temperature: 0.8,
      });

      const variation = completion.choices[0]?.message?.content;
      if (variation && variation !== mainDraft) {
        variations.push(variation);
      }
    }

    return variations;
  } catch (error) {
    console.error("Failed to generate variations:", error);
    return [];
  }
}

async function generateSubject(
  context: string,
  content: string,
): Promise<string> {
  try {
    const subjectPrompt = `Generate a professional email subject line for this business communication:

CONTEXT: ${context}
CONTENT: ${content.substring(0, 200)}...

Generate a clear, professional subject line that accurately reflects the content and purpose.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a professional email subject line generator. Create clear, concise subject lines.",
        },
        { role: "user", content: subjectPrompt },
      ],
      max_tokens: 50,
      temperature: 0.5,
    });

    return completion.choices[0]?.message?.content || "Strategic Communication";
  } catch (error) {
    console.error("Failed to generate subject:", error);
    return "Strategic Communication";
  }
}

function calculateConfidence(
  tone: string,
  context: string,
  content: string,
): number {
  let confidence = 80; // Base confidence

  // Adjust based on content length and structure
  if (content.length > 100) confidence += 5;
  if (content.includes("•") || content.includes("-")) confidence += 5; // Structured content
  if (content.includes("Thank you") || content.includes("Best regards"))
    confidence += 5; // Professional closing

  // Adjust based on tone complexity
  if (tone === "diplomatic") confidence += 5; // More nuanced tone
  if (tone === "direct") confidence += 3; // Straightforward tone

  return Math.min(confidence, 95); // Cap at 95%
}
