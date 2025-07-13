# Napoleon AI – Architecture Diagram

```mermaid
graph TD
  subgraph Frontend
    A[Next.js App (React, Tailwind, Clerk)]
  end
  subgraph API
    B[Next.js API Routes]
    C[Edge Functions]
  end
  subgraph Integrations
    D[Gmail API]
    E[Outlook Graph API]
    F[Slack API]
    G[Stripe API]
    H[Resend API]
    I[OpenAI API]
    J[Supabase]
  end
  subgraph Monitoring
    K[Sentry]
    L[Vercel Cron]
  end
  A -->|SSR/CSR| B
  B -->|DB| J
  B -->|AI| I
  B -->|Email| D
  B -->|Email| E
  B -->|Messaging| F
  B -->|Payments| G
  B -->|Transactional Email| H
  B -->|Monitoring| K
  L -->|Nightly Backup| B
``` 