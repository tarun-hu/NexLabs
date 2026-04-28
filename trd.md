  NexLabs — Web Platform MVP

  ---
  📊 Document Overview

  ┌──────────────────┬───────────────────────────────────────────────────┐
  │    Attribute     │                       Value                       │
  ├──────────────────┼───────────────────────────────────────────────────┤
  │ Project          │ Agency website + client portal + AI PRD generator │
  ├──────────────────┼───────────────────────────────────────────────────┤
  │ Platform         │ Web-only (responsive desktop + mobile)            │
  ├──────────────────┼───────────────────────────────────────────────────┤
  │ Builder Profile  │ Solo, 3-4 hrs/day, 10-14 day timeline             │
  ├──────────────────┼───────────────────────────────────────────────────┤
  │ Budget           │ $10-20/month (free-tier first)                    │
  ├──────────────────┼───────────────────────────────────────────────────┤
  │ AI Coding Target │ Claude, Cursor, v0.dev, Bolt-compatible           │
  └──────────────────┴───────────────────────────────────────────────────┘

  Core Features:
  1. 5-page marketing website with animations (parallax, smooth scroll, 3D)
  2. Scoping form with AI-assisted PRD generation
  3. Client accounts (email + OAuth)
  4. Client portal to track project status
  5. Email notifications (form submission + project updates)

  ---
  🏗️ System Architecture

  ┌─────────────────────────────────────────────────────────────────┐
  │                         CLIENT LAYER                            │
  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
  │  │   Next.js 14    │  │  Tailwind CSS   │  │  Framer Motion  │ │
  │  │   (App Router)  │  │  (Styling)      │  │  (Animations)   │ │
  │  └────────┬────────┘  └─────────────────┘  └────────┬────────┘ │
  │           │                                          │           │
  │           │  ┌─────────────────┐  ┌─────────────────┐│           │
  │           │  │  React Three    │  │  Lenis /        ││           │
  │           │  │  Fiber (3D)     │  │  GSAP (Scroll)  ││           │
  │           │  └─────────────────┘  └─────────────────┘│           │
  └───────────┼──────────────────────────────────────────┘           │
              │ HTTPS (REST API Routes)
              ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │                        BACKEND LAYER                            │
  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
  │  │  Next.js API    │  │  NextAuth.js    │  │  Resend API     │ │
  │  │  Routes         │  │  (Auth)         │  │  (Email)        │ │
  │  │  /api/*         │  │                 │  │                 │ │
  │  └────────┬────────┘  └─────────────────┘  └────────┬────────┘ │
  │           │                                          │           │
  │           ▼                                          ▼           │
  │  ┌─────────────────┐                        ┌─────────────────┐ │
  │  │  OpenAI API     │                        │  Supabase       │ │
  │  │  (PRD Gen)      │                        │  (PostgreSQL)   │ │
  │  │  gpt-4o-mini    │                        │                 │ │
  │  └─────────────────┘                        └─────────────────┘ │
  └─────────────────────────────────────────────────────────────────┘

  ---
  🛠️ Technology Stack

  ┌────────────┬─────────────────────────────┬─────────────────────────────────────────────────────┐
  │ Component  │         Technology          │                   Why This Choice                   │
  ├────────────┼─────────────────────────────┼─────────────────────────────────────────────────────┤
  │ Framework  │ Next.js 14 (App Router)     │ Vercel-native, AI tools know it well, SSR for SEO   │
  ├────────────┼─────────────────────────────┼─────────────────────────────────────────────────────┤
  │ Hosting    │ Vercel Free Tier            │ $0, auto-deploy on git push, global CDN             │
  ├────────────┼─────────────────────────────┼─────────────────────────────────────────────────────┤
  │ Database   │ Supabase (Free Tier)        │ PostgreSQL, auth-ready, 500MB free, generous limits │
  ├────────────┼─────────────────────────────┼─────────────────────────────────────────────────────┤
  │ Auth       │ NextAuth.js v5              │ Google OAuth + Email, session management, free      │
  ├────────────┼─────────────────────────────┼─────────────────────────────────────────────────────┤
  │ Styling    │ Tailwind CSS + shadcn/ui    │ Pre-built components, AI knows patterns well        │
  ├────────────┼─────────────────────────────┼─────────────────────────────────────────────────────┤
  │ Animations │ Framer Motion               │ Declarative, AI-friendly, smooth by default         │
  ├────────────┼─────────────────────────────┼─────────────────────────────────────────────────────┤
  │ Scroll     │ Lenis + GSAP ScrollTrigger  │ Smooth scroll + parallax, industry standard         │
  ├────────────┼─────────────────────────────┼─────────────────────────────────────────────────────┤
  │ 3D         │ React Three Fiber + Drei    │ React-friendly Three.js, pre-built 3D helpers       │
  ├────────────┼─────────────────────────────┼─────────────────────────────────────────────────────┤
  │ Email      │ Resend (Free: 3k emails/mo) │ Better deliverability than SendGrid free tier       │
  ├────────────┼─────────────────────────────┼─────────────────────────────────────────────────────┤
  │ AI         │ OpenAI API (gpt-4o-mini)    │ Cheap ($0.15/1M input tokens), fast, reliable       │
  ├────────────┼─────────────────────────────┼─────────────────────────────────────────────────────┤
  │ Forms      │ React Hook Form + Zod       │ Validation, type-safe, AI knows it well             │
  ├────────────┼─────────────────────────────┼─────────────────────────────────────────────────────┤
  │ Analytics  │ Vercel Analytics (Free)     │ No cookie banners, privacy-friendly                 │
  └────────────┴─────────────────────────────┴─────────────────────────────────────────────────────┘

  ---
  🗄️ Database Schema

  Supabase PostgreSQL — Exact Table Definitions

  Table: users

  ┌────────────┬─────────────┬──────────────────┬─────────────────────────┐
  │   Field    │    Type     │   Constraints    │       Description       │
  ├────────────┼─────────────┼──────────────────┼─────────────────────────┤
  │ id         │ UUID        │ PRIMARY KEY      │ Supabase Auth user ID   │
  ├────────────┼─────────────┼──────────────────┼─────────────────────────┤
  │ email      │ TEXT        │ UNIQUE, NOT NULL │ User email              │
  ├────────────┼─────────────┼──────────────────┼─────────────────────────┤
  │ full_name  │ TEXT        │ NULL             │ Client name             │
  ├────────────┼─────────────┼──────────────────┼─────────────────────────┤
  │ company    │ TEXT        │ NULL             │ Company name (optional) │
  ├────────────┼─────────────┼──────────────────┼─────────────────────────┤
  │ role       │ TEXT        │ DEFAULT 'client' │ 'client' or 'admin'     │
  ├────────────┼─────────────┼──────────────────┼─────────────────────────┤
  │ created_at │ TIMESTAMPTZ │ DEFAULT NOW()    │ Account creation date   │
  └────────────┴─────────────┴──────────────────┴─────────────────────────┘

  Table: projects

  ┌───────────────────────┬─────────────┬────────────────┬─────────────────────────────────────────────────────────────────────────┐
  │         Field         │    Type     │  Constraints   │                               Description                               │
  ├───────────────────────┼─────────────┼────────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ id                    │ UUID        │ PRIMARY KEY    │ Project ID                                                              │
  ├───────────────────────┼─────────────┼────────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ user_id               │ UUID        │ FK → users.id  │ Client who submitted                                                    │
  ├───────────────────────┼─────────────┼────────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ status                │ TEXT        │ DEFAULT 'lead' │ 'lead', 'discovery', 'quoted', 'active', 'completed', 'archived'        │
  ├───────────────────────┼─────────────┼────────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ title                 │ TEXT        │ NOT NULL       │ Project title (auto-generated from idea)                                │
  ├───────────────────────┼─────────────┼────────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ idea_summary          │ TEXT        │ NOT NULL       │ 200-char form input                                                     │
  ├───────────────────────┼─────────────┼────────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ vertical              │ TEXT        │ NOT NULL       │ 'AI/ML', 'Fintech', 'HealthTech', 'Productivity', 'E-commerce', 'Other' │
  ├───────────────────────┼─────────────┼────────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ timeline              │ TEXT        │ NOT NULL       │ 'ASAP', '1 month', '2-3 months', 'Flexible'                             │
  ├───────────────────────┼─────────────┼────────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ budget_range          │ TEXT        │ NOT NULL       │ '$2k-5k', '$5k-10k', '$10k-20k', '$20k-50k', '$50k+'                    │
  ├───────────────────────┼─────────────┼────────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ tech_stack_preference │ TEXT        │ NULL           │ Client's preferred stack                                                │
  ├───────────────────────┼─────────────┼────────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ ai_generated_prd      │ JSONB       │ NULL           │ Auto-generated PRD from AI                                              │
  ├───────────────────────┼─────────────┼────────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ quote_amount          │ INTEGER     │ NULL           │ Quote in USD cents                                                      │
  ├───────────────────────┼─────────────┼────────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ quote_notes           │ TEXT        │ NULL           │ Quote explanation                                                       │
  ├───────────────────────┼─────────────┼────────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ created_at            │ TIMESTAMPTZ │ DEFAULT NOW()  │ Submission date                                                         │
  ├───────────────────────┼─────────────┼────────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ updated_at            │ TIMESTAMPTZ │ DEFAULT NOW()  │ Last update                                                             │
  └───────────────────────┴─────────────┴────────────────┴─────────────────────────────────────────────────────────────────────────┘

  Table: project_messages

  ┌─────────────┬─────────────┬──────────────────┬──────────────────────────────────┐
  │    Field    │    Type     │   Constraints    │           Description            │
  ├─────────────┼─────────────┼──────────────────┼──────────────────────────────────┤
  │ id          │ UUID        │ PRIMARY KEY      │ Message ID                       │
  ├─────────────┼─────────────┼──────────────────┼──────────────────────────────────┤
  │ project_id  │ UUID        │ FK → projects.id │ Parent project                   │
  ├─────────────┼─────────────┼──────────────────┼──────────────────────────────────┤
  │ sender_id   │ UUID        │ FK → users.id    │ Who sent it                      │
  ├─────────────┼─────────────┼──────────────────┼──────────────────────────────────┤
  │ content     │ TEXT        │ NOT NULL         │ Message body                     │
  ├─────────────┼─────────────┼──────────────────┼──────────────────────────────────┤
  │ is_internal │ BOOLEAN     │ DEFAULT FALSE    │ Internal note (client can't see) │
  ├─────────────┼─────────────┼──────────────────┼──────────────────────────────────┤
  │ created_at  │ TIMESTAMPTZ │ DEFAULT NOW()    │ Sent date                        │
  └─────────────┴─────────────┴──────────────────┴──────────────────────────────────┘

  Table: scoping_submissions

  ┌─────────────────┬─────────────┬───────────────────┬──────────────────────────────────┐
  │      Field      │    Type     │    Constraints    │           Description            │
  ├─────────────────┼─────────────┼───────────────────┼──────────────────────────────────┤
  │ id              │ UUID        │ PRIMARY KEY       │ Submission ID                    │
  ├─────────────────┼─────────────┼───────────────────┼──────────────────────────────────┤
  │ email           │ TEXT        │ NOT NULL          │ Submitter email                  │
  ├─────────────────┼─────────────┼───────────────────┼──────────────────────────────────┤
  │ name            │ TEXT        │ NOT NULL          │ Submitter name                   │
  ├─────────────────┼─────────────┼───────────────────┼──────────────────────────────────┤
  │ idea            │ TEXT(500)   │ NOT NULL          │ Idea description                 │
  ├─────────────────┼─────────────┼───────────────────┼──────────────────────────────────┤
  │ vertical        │ TEXT        │ NOT NULL          │ Industry vertical                │
  ├─────────────────┼─────────────┼───────────────────┼──────────────────────────────────┤
  │ timeline        │ TEXT        │ NOT NULL          │ Expected timeline                │
  ├─────────────────┼─────────────┼───────────────────┼──────────────────────────────────┤
  │ budget_range    │ TEXT        │ NOT NULL          │ Budget selection                 │
  ├─────────────────┼─────────────┼───────────────────┼──────────────────────────────────┤
  │ referral_source │ TEXT        │ NULL              │ How they found you               │
  ├─────────────────┼─────────────┼───────────────────┼──────────────────────────────────┤
  │ ai_prd_status   │ TEXT        │ DEFAULT 'pending' │ 'pending', 'generated', 'failed' │
  ├─────────────────┼─────────────┼───────────────────┼──────────────────────────────────┤
  │ ai_prd_raw      │ JSONB       │ NULL              │ Raw AI response                  │
  ├─────────────────┼─────────────┼───────────────────┼──────────────────────────────────┤
  │ created_at      │ TIMESTAMPTZ │ DEFAULT NOW()     │ Submission timestamp             │
  └─────────────────┴─────────────┴───────────────────┴──────────────────────────────────┘

  ---
  🔌 API Design

  Next.js API Routes (/app/api/*)

  ┌────────────────────────────┬──────────┬──────────────────────────┬────────────────────────────────────────────────────┬────────────────────────────┐
  │          Endpoint          │  Method  │         Purpose          │                       Input                        │           Output           │
  ├────────────────────────────┼──────────┼──────────────────────────┼────────────────────────────────────────────────────┼────────────────────────────┤
  │ /api/auth/[...nextauth]    │ GET/POST │ OAuth + session handling │ Provider callback                                  │ Session token              │
  ├────────────────────────────┼──────────┼──────────────────────────┼────────────────────────────────────────────────────┼────────────────────────────┤
  │ /api/scoping/submit        │ POST     │ Submit scoping form      │ { email, name, idea, vertical, timeline,           │ { success: true,           │
  │                            │          │                          │ budget_range, referral_source }                    │ submissionId }             │
  ├────────────────────────────┼──────────┼──────────────────────────┼────────────────────────────────────────────────────┼────────────────────────────┤
  │ /api/scoping/generate-prd  │ POST     │ AI generates PRD from    │ { submissionId }                                   │ { prd: object, status:     │
  │                            │          │ submission               │                                                    │ 'generated' }              │
  ├────────────────────────────┼──────────┼──────────────────────────┼────────────────────────────────────────────────────┼────────────────────────────┤
  │ /api/projects              │ GET      │ List user's projects     │ Auth session                                       │ [{ id, title, status,      │
  │                            │          │ (client view)            │                                                    │ created_at }]              │
  ├────────────────────────────┼──────────┼──────────────────────────┼────────────────────────────────────────────────────┼────────────────────────────┤
  │ /api/projects/:id          │ GET      │ Get single project       │ { id }                                             │ { project, messages[] }    │
  │                            │          │ details                  │                                                    │                            │
  ├────────────────────────────┼──────────┼──────────────────────────┼────────────────────────────────────────────────────┼────────────────────────────┤
  │ /api/projects/:id/messages │ POST     │ Add message to project   │ { content, is_internal }                           │ { success: true }          │
  ├────────────────────────────┼──────────┼──────────────────────────┼────────────────────────────────────────────────────┼────────────────────────────┤
  │ /api/admin/projects        │ GET      │ List all projects (admin │ Auth session                                       │ [{ all project fields }]   │
  │                            │          │  only)                   │                                                    │                            │
  ├────────────────────────────┼──────────┼──────────────────────────┼────────────────────────────────────────────────────┼────────────────────────────┤
  │ /api/admin/update-quote    │ POST     │ Update project quote     │ { projectId, quote_amount, quote_notes }           │ { success: true }          │
  │                            │          │ (admin)                  │                                                    │                            │
  └────────────────────────────┴──────────┴──────────────────────────┴────────────────────────────────────────────────────┴────────────────────────────┘

  ---
  🔒 Security & Rate Limiting

  ┌───────────────────────────┬─────────────────────────────────────┬────────────────────────────────────────────────────────────────────┐
  │         Endpoint          │             Protection              │                             Rate Limit                             │
  ├───────────────────────────┼─────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
  │ /api/scoping/submit       │ None (public)                       │ 5 submissions/hour per IP (Upstash Ratelimit or custom middleware) │
  ├───────────────────────────┼─────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
  │ /api/scoping/generate-prd │ Admin-only (check role === 'admin') │ 10 requests/hour                                                   │
  ├───────────────────────────┼─────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
  │ /api/projects/*           │ Auth required (nextauth session)    │ 100 requests/hour                                                  │
  ├───────────────────────────┼─────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
  │ /api/admin/*              │ Admin-only (check role === 'admin') │ 100 requests/hour                                                  │
  └───────────────────────────┴─────────────────────────────────────┴────────────────────────────────────────────────────────────────────┘

  Security Rules:
  - All API responses exclude internal fields (is_internal messages never sent to client role)
  - Row Level Security (RLS) on Supabase: clients can only SELECT their own projects
  - Admin role check: user.email === 'your-email@domain.com' OR user.role === 'admin'
  - Environment variables: OPENAI_API_KEY, RESEND_API_KEY, SUPABASE_URL, SUPABASE_KEY, NEXTAUTH_SECRET

  ---
  🤖 AI Integration

  Service: OpenAI API
  Model: gpt-4o-mini (cost-optimized, fast)
  Fallback: gpt-3.5-turbo if 4o-mini unavailable

  PRD Generation Prompt Template

  System: You are a technical co-founder helping scope a software project.
  Generate a structured 1-page PRD from the client's form submission.

  User Input:
  - Idea: {{idea}}
  - Vertical: {{vertical}}
  - Timeline: {{timeline}}
  - Budget: {{budget_range}}
  - Tech Preference: {{tech_stack_preference}}

  Output JSON format:
  {
    "product_name": string,
    "problem_statement": string (1-2 sentences),
    "target_user": string,
    "core_features": [string] (3-5 features),
    "recommended_stack": string,
    "timeline_estimate": string,
    "complexity_score": number (1-10),
    "ai_features_suggested": [string],
    "risks_and_considerations": [string],
    "quote_range_low": number,
    "quote_range_high": number
  }

  Fallback Strategy:
  - If OpenAI API fails (5xx or rate limit): Return { status: 'pending', message: 'AI review in progress — we\'ll respond within 24 hours' }
  - Queue for manual review (admin dashboard shows "AI Failed" badge)

  ---
  🚀 Deployment Strategy

  Step-by-Step: Push to Production

  ┌──────┬────────────────────────┬─────────────────────────────────────────────────────────────────────┐
  │ Step │         Action         │                            Command/Tool                             │
  ├──────┼────────────────────────┼─────────────────────────────────────────────────────────────────────┤
  │ 1    │ Create GitHub repo     │ gh repo create agency-web --private                                 │
  ├──────┼────────────────────────┼─────────────────────────────────────────────────────────────────────┤
  │ 2    │ Initialize Next.js app │ npx create-next-app@latest . --typescript --tailwind --eslint --app │
  ├──────┼────────────────────────┼─────────────────────────────────────────────────────────────────────┤
  │ 3    │ Install dependencies   │ npm install (see package list below)                                │
  ├──────┼────────────────────────┼─────────────────────────────────────────────────────────────────────┤
  │ 4    │ Set up Supabase        │ Create project at supabase.com → run SQL schema                     │
  ├──────┼────────────────────────┼─────────────────────────────────────────────────────────────────────┤
  │ 5    │ Set up Resend          │ Create account → verify domain → get API key                        │
  ├──────┼────────────────────────┼─────────────────────────────────────────────────────────────────────┤
  │ 6    │ Set up OpenAI          │ Create account → billing → API key                                  │
  ├──────┼────────────────────────┼─────────────────────────────────────────────────────────────────────┤
  │ 7    │ Configure Vercel       │ vercel link → connect repo                                          │
  ├──────┼────────────────────────┼─────────────────────────────────────────────────────────────────────┤
  │ 8    │ Add env vars to Vercel │ Dashboard → Settings → Environment Variables                        │
  ├──────┼────────────────────────┼─────────────────────────────────────────────────────────────────────┤
  │ 9    │ Deploy                 │ git push origin main (Vercel auto-deploys)                          │
  ├──────┼────────────────────────┼─────────────────────────────────────────────────────────────────────┤
  │ 10   │ Custom domain          │ Vercel → Settings → Domains → add yourdomain.com                    │
  └──────┴────────────────────────┴─────────────────────────────────────────────────────────────────────┘

  Required Environment Variables:
  NEXTAUTH_URL=https://yourdomain.com
  NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
  SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_KEY=<service_role_key>
  OPENAI_API_KEY=sk-...
  RESEND_API_KEY=re_...

  ---
  📊 Performance Requirements

  ┌────────────────────────┬─────────────────────────────┬────────────────────────────────────┐
  │         Metric         │           Target            │            Measurement             │
  ├────────────────────────┼─────────────────────────────┼────────────────────────────────────┤
  │ Lighthouse Performance │ 85+ (mobile), 95+ (desktop) │ Lighthouse CI on deploy            │
  ├────────────────────────┼─────────────────────────────┼────────────────────────────────────┤
  │ First Contentful Paint │ < 1.5s on 4G                │ Vercel Analytics                   │
  ├────────────────────────┼─────────────────────────────┼────────────────────────────────────┤
  │ Time to Interactive    │ < 3.5s on 4G                │ Lighthouse                         │
  ├────────────────────────┼─────────────────────────────┼────────────────────────────────────┤
  │ Animation FPS          │ 60fps (scroll, parallax)    │ Chrome DevTools Performance        │
  ├────────────────────────┼─────────────────────────────┼────────────────────────────────────┤
  │ 3D Load Time           │ < 2s initial render         │ React Three Fiber loader           │
  ├────────────────────────┼─────────────────────────────┼────────────────────────────────────┤
  │ API Response Time      │ < 500ms (all endpoints)     │ Vercel Functions dashboard         │
  ├────────────────────────┼─────────────────────────────┼────────────────────────────────────┤
  │ Slow Connection        │ Graceful degradation on 3G  │ Lazy-load 3D, show static fallback │
  └────────────────────────┴─────────────────────────────┴────────────────────────────────────┘

  Optimization Tactics:
  - 3D objects: Use .glb format, compressed with gltf-pipeline, max 500KB
  - Lazy load: @react-three/drei components only on homepage
  - Image optimization: Next.js <Image> with WebP
  - Font subsetting: Only load Instrument Serif for headings

  ---
  💰 Cost Estimate

  ┌────────────────┬───────────────────┬─────────────────┬──────────────────┬────────────────────┐
  │    Service     │     Free Tier     │ At 100 Users/Mo │ At 1000 Users/Mo │ At 10000 Users/Mo  │
  ├────────────────┼───────────────────┼─────────────────┼──────────────────┼────────────────────┤
  │ Vercel Hosting │ Unlimited (hobby) │ $0              │ $0               │ $20 (Pro for team) │
  ├────────────────┼───────────────────┼─────────────────┼──────────────────┼────────────────────┤
  │ Supabase       │ 500MB, 50k MAU    │ $0              │ $0               │ $25 (Pro)          │
  ├────────────────┼───────────────────┼─────────────────┼──────────────────┼────────────────────┤
  │ Resend Email   │ 3k emails/mo      │ $0              │ $0               │ $30 (Pro)          │
  ├────────────────┼───────────────────┼─────────────────┼──────────────────┼────────────────────┤
  │ OpenAI API     │ Pay-as-you-go     │ ~$0.50          │ ~$5              │ ~$50               │
  ├────────────────┼───────────────────┼─────────────────┼──────────────────┼────────────────────┤
  │ NextAuth       │ Free              │ $0              │ $0               │ $0                 │
  ├────────────────┼───────────────────┼─────────────────┼──────────────────┼────────────────────┤
  │ Domain         │ N/A               │ $12/yr          │ $12/yr           │ $12/yr             │
  ├────────────────┼───────────────────┼─────────────────┼──────────────────┼────────────────────┤
  │ TOTAL          │ $0/mo             │ ~$1/mo          │ ~$5/mo           │ ~$140/mo           │
  └────────────────┴───────────────────┴─────────────────┴──────────────────┴────────────────────┘

  Notes:
  - OpenAI estimate: ~500 tokens per PRD × $0.15/1M tokens = $0.000075 per PRD
  - 100 submissions/mo = ~$0.50/month in AI costs
  - Upgrade path: Supabase Pro at 50k MAU, Resend Pro at 3k emails

  ---
  📋 Development Checklist

  Day 1-2: Foundation
  - Create GitHub repo + Vercel project
  - Initialize Next.js 14 with TypeScript + Tailwind
  - Install core deps: next-auth, @supabase/supabase-js, react-hook-form, zod
  - Set up Supabase project + run SQL schema
  - Configure NextAuth with Google OAuth provider
  - Deploy "Hello World" to Vercel (verify pipeline works)

  Day 3-5: Marketing Pages
  - Install shadcn/ui: npx shadcn@latest init
  - Install animation deps: framer-motion, @studio-freight/lenis, gsap
  - Install 3D deps: three, @react-three/fiber, @react-three/drei
  - Build Homepage (P1): Hero, 3 service cards, case study previews, CTA
  - Build Services page (P2): 5 service cards with timeline/price
  - Build About page (P4): Founder story, team, values
  - Add smooth scroll (Lenis) + parallax (GSAP ScrollTrigger) to homepage

  Day 6-7: Scoping Form + AI
  - Install Resend: npm install resend
  - Install OpenAI: npm install openai
  - Build scoping form (P5): 7 fields with Zod validation
  - Create /api/scoping/submit endpoint
  - Create /api/scoping/generate-prd endpoint with OpenAI call
  - Wire form submission → Supabase insert → email via Resend → AI PRD generation
  - Test AI prompt with 5 sample submissions

  Day 8-9: Auth + Client Portal
  - Build login page: Google OAuth button + email form
  - Create /dashboard route (protected)
  - Build project list view: table of user's submissions
  - Build project detail view: PRD output, status, messages
  - Add admin flag to user table for your account

  Day 10-11: 3D + Polish
  - Source/buy 3D model (abstract tech shape, .glb format)
  - Add React Three Fiber scene to homepage hero
  - Add loading spinner for 3D (Suspense fallback)
  - Optimize Lighthouse score (lazy load, preload fonts)
  - Add Vercel Analytics

  Day 12-14: Testing + Launch
  - Test form submission on mobile + desktop
  - Test OAuth flow end-to-end
  - Verify email delivery (Resend sandbox → production)
  - Test AI PRD generation with edge cases
  - Connect custom domain
  - Set up hello@ email (Resend or Google Workspace)
  - Create Notion templates: SOW, NDA, invoice
  - Send first 50 outreach messages (LinkedIn + cold email)

  ---
  🎯 Technical Success Criteria

  ┌───────────────────────────────┬────────────────────────────────────────────────────────────┐
  │           Criterion           │                       How to Verify                        │
  ├───────────────────────────────┼────────────────────────────────────────────────────────────┤
  │ Site loads in < 2s            │ Run Lighthouse on homepage (mobile throttling)             │
  ├───────────────────────────────┼────────────────────────────────────────────────────────────┤
  │ Form submits successfully     │ Submit test → verify Supabase row + email received         │
  ├───────────────────────────────┼────────────────────────────────────────────────────────────┤
  │ AI PRD generates in < 10s     │ Time /api/scoping/generate-prd endpoint                    │
  ├───────────────────────────────┼────────────────────────────────────────────────────────────┤
  │ OAuth login works             │ Sign in with Google → redirected to /dashboard             │
  ├───────────────────────────────┼────────────────────────────────────────────────────────────┤
  │ Client sees own projects only │ Create 2 test users → verify RLS isolation                 │
  ├───────────────────────────────┼────────────────────────────────────────────────────────────┤
  │ Admin can see all projects    │ Toggle admin flag → verify /api/admin/projects returns all │
  ├───────────────────────────────┼────────────────────────────────────────────────────────────┤
  │ 3D renders without crashing   │ Load homepage on M1 MacBook Air (no GPU fans spinning up)  │
  ├───────────────────────────────┼────────────────────────────────────────────────────────────┤
  │ Animations at 60fps           │ Chrome DevTools → Performance → record scroll              │
  ├───────────────────────────────┼────────────────────────────────────────────────────────────┤
  │ Deploy on git push            │ git push → Vercel builds + deploys in < 2 min              │
  ├───────────────────────────────┼────────────────────────────────────────────────────────────┤
  │ Total cost < $5/mo at launch  │ Check OpenAI + Resend dashboards after Week 1              │
  └───────────────────────────────┴────────────────────────────────────────────────────────────┘

  ---
  📦 Required Package List

  Copy-paste for npm install:
  # Core
  next-auth @supabase/supabase-js react-hook-form zod

  # UI
  framer-motion clsx tailwind-merge class-variance-authority

  # 3D
  three @react-three/fiber @react-three/drei

  # Scroll/Animations
  @studio-freight/lenis gsap

  # API
  openai resend

  # Dev
  @types/three @types/node typescript eslint

  ---
  ⚠️ Fallback Strategies

  ┌───────────────────────────┬────────────────────────────────────────────────────────────────────┐
  │       Failure Mode        │                              Fallback                              │
  ├───────────────────────────┼────────────────────────────────────────────────────────────────────┤
  │ OpenAI API down           │ Show "Manual review in progress — 24hr response" + queue for human │
  ├───────────────────────────┼────────────────────────────────────────────────────────────────────┤
  │ Resend emails failing     │ Log to console + show "We'll contact you soon" toast               │
  ├───────────────────────────┼────────────────────────────────────────────────────────────────────┤
  │ 3D fails to load          │ Show static SVG fallback (pre-rendered PNG)                        │
  ├───────────────────────────┼────────────────────────────────────────────────────────────────────┤
  │ Supabase connection error │ Retry 3x with exponential backoff → show "Try again" UI            │
  ├───────────────────────────┼────────────────────────────────────────────────────────────────────┤
  │ OAuth fails               │ Allow email-only sign-in (magic link via Resend)                   │
  └───────────────────────────┴────────────────────────────────────────────────────────────────────┘