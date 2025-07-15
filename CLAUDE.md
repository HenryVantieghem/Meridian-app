# Napoleon AI – Full Context for Claude Code

## Product Vision
**Napoleon AI** is “the AI Strategic Commander for Perfect Focus.”  
- **Target
 users**: C-suite executives, founders, high-performing professionals  
- **Pain**: Knowledge workers spend up to two full days per week on email and meetings (napco4courtleaders.org)  
- **Promise**: A unified, lightning-fast dashboard that distills critical insights across Gmail & Slack, surfaces VIP communications, and drafts high-stakes replies with minimal clicks.

## Key UX Principles
1. **Immediate Clarity & Focus**  
   - Single-screen “Daily Brief” with top priorities, no extraneous detail (vizzendata.com)  
2. **Effortless Efficiency**  
   - Blazing speed, powerful keyboard shortcuts, one-click “AI Reply” / “Done” / “Snooze” (superhuman.com, zapier.com)  
3. **Personalization & VIP Treatment**  
   - Onboarding-driven VIP setup + AI detection of critical contacts (thisisglance.com)  
4. **Trust, Security & Privacy**  
   - Biometric login, smooth MFA, transparent encryption messaging (nngroup.com)  
5. **Luxury Aesthetics & Delight**  
   - Cartier-inspired palette (white/black/cream/burgundy), elegant typography, subtle animations (thisisglance.com)

## Core Touchpoints

### Landing Page
- **Minimalist Luxury Design**: White space, high-contrast black text, sparse burgundy accents.  
- **Clear Value Proposition**: Headline “Transform Your Communication Chaos into Strategic Clarity.”  
- **Social Proof & Exclusivity**: Logos/testimonials + “Request Access” or “Join the Waitlist.”  
- **Effortless Conversion**: One-click SSO (Google/Microsoft), scannable three-step overview.  
- **Mobile & Retina-Ready**: High-res assets, responsive layout.  
- **No Distracting Pop-ups**: Inline forms only, no interruptive banners (nngroup.com).

### Onboarding (3 Minutes or Less)
1. **Executive Profile & Preferences (30s)**  
   - Role selection + top pain points → personalize experience.  
2. **Integration Magic (60s)**  
   - OAuth for Gmail & Slack → immediate “Analyzing your inbox…🤖” preview.  
3. **VIP Setup & Customization (90s, optional)**  
   - Designate VIP contacts + choose notifications → skippable “Skip for now.”  
4. **Guided Tour & First-Use Delight**  
   - 3–4 tooltips highlighting Daily Digest, AI Draft, etc.  
5. **White-Glove Option**  
   - Chat with onboarding concierge or schedule a 15-minute call (zapier.com).

### Dashboard & Command Center
- **Three-Panel Layout**:
  1. **Left Navigation** (~280px): Auto-collapsing menu with luxury terminology.  
  2. **Main Content**: “Strategic Daily Digest” cards, unified across email & Slack.  
     - Actionable items: “AI Reply,” “Done,” “Snooze,” keyboard shortcuts.  
     - Drill-down view with AI-highlighted summaries (zapier.com).  
  3. **Right Context** (~320px): Profile & relationship insights, AI-extracted action items, “Ask Napoleon…” command bar.  
- **Visual Hierarchy & Calm**: F-pattern layout, sparing burgundy alerts, no flashing pop-ups (vizzendata.com).  
- **Performance & Responsiveness**: Optimistic UI, real-time sync, skeleton screens, sub-second load times.

## Innovative AI Features
- **Unified Cross-Platform Summaries**: GPT-4 digest across email & Slack, priority scoring.  
- **AI Draft & Brainstorming**: Context-aware reply drafts, strategic memos, tone customization.  
- **Adaptive Priority Inbox**: Behavior-driven surfacing, optimal timing nudges.  
- **VIP & Relationship Health**: Sentiment analysis, reply nudges, relationship index.  
- **Contextual Summon**: Inline “@Napoleon fetch X” for in-moment data retrieval.  
- **Proactive Insights & Integrations**: Calendar intelligence, voice briefing (Siri Shortcut), continuous learning & on-device AI.

## Tech Stack & Architecture
- **Frontend**: Next.js (React) with SSR/ISR  
- **Backend**: Supabase real-time, Edge Functions on Vercel  
- **Auth**: Clerk (OAuth for Google, Slack)  
- **AI**: OpenAI GPT-4 via `@mcp/mcp-openai`  
- **Search**: Redisearch for vector indexing  
- **Notifications**: Resend for email, Supabase push  
- **Monitoring**: Sentry, Vercel Analytics  
- **CI/CD**: GitHub → Vercel Previews & Prod, MCP servers for local dev pods

## Deployment & Dev Workflow
1. **`.mcp.json`** with all `mcp-*` server definitions (GitHub, text editor, shell, Python, OpenAI, Supabase, Stripe, Vercel).  
2. **Environment Management**:  
   - Local `.env.local`; Vercel Dashboard env vars; `vercel env pull`.  
3. **Build & Deploy**:  
   - `npm install` → `vercel build` → `vercel deploy --prebuilt` (preview) → `vercel deploy --prod`.  
4. **Claude Code Audit Prompt**:  
   > Analyze the Napoleon AI repo end-to-end: missing features, config gaps, architecture improvements, security/privacy omissions, and actionable next steps to reach full Vercel-ready functionality.

## Measuring Success
- **Time to “Aha” & Inbox Zero**: Target <15 min/day.  
- **Retention & Engagement**: >95% annual retention, DAU/WAU metrics.  
- **NPS & CSAT**: Aim for 60–70+ NPS.  
- **Productivity Impact**: Quantify hours saved & crises averted per week.

---

*This `claude.md` provides Claude Code with the complete product brief, UX principles, tech context, and deployment workflow required to audit, generate, and refine the Napoleon AI codebase for a luxury, executive-grade experience.*  