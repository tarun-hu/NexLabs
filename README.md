# NexLabs - AI-Powered Software Development Agency

A modern web platform for a software development agency with AI-assisted project scoping, client portal, and automated PRD generation.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion, GSAP, React Three Fiber
- **Auth**: NextAuth.js (Google OAuth + Email)
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend
- **AI**: OpenAI GPT-4o-mini

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account (free tier)
- Resend account (free tier)
- OpenAI API key

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your keys:
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `RESEND_API_KEY`: Your Resend API key
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

3. **Set up Supabase**

   - Create a project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the schema from `supabase/schema.sql`
   - Enable Google OAuth in Authentication → Providers

4. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   │   ├── auth/      # NextAuth endpoints
│   │   └── scoping/   # Scoping form + PRD generation
│   ├── dashboard/     # Client portal (protected)
│   ├── login/         # Auth page
│   ├── success/       # Submission confirmation
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Homepage
├── lib/
│   ├── auth.ts        # NextAuth config
│   ├── openai.ts      # OpenAI client
│   ├── resend.ts      # Resend client
│   ├── supabase.ts    # Supabase client
│   └── utils.ts       # Utility functions
└── types/
    └── next-auth.d.ts # Type extensions
```

## Features

### Homepage
- Animated hero section with particle effects
- Services showcase with hover animations
- Scoping form with real-time validation

### AI PRD Generation
- Automatic project requirements document generation
- Cost and timeline estimation
- Tech stack recommendations

### Client Portal
- View project status and PRDs
- Message thread with team
- Quote acceptance workflow

### Admin Features
- View all submissions
- Update project quotes
- Internal notes (hidden from clients)

## Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create
   git push -u origin main
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel link
   vercel --prod
   ```

3. **Add environment variables** in Vercel dashboard

4. **Connect custom domain** in Vercel → Settings → Domains

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | Auth handling |
| `/api/scoping/submit` | POST | Submit scoping form |
| `/api/scoping/generate-prd` | POST | Generate AI PRD |
| `/api/projects` | GET | List user's projects |
| `/api/projects/:id` | GET | Get project details |
| `/api/admin/projects` | GET | List all (admin only) |

## Cost Estimate

| Service | Free Tier | At Launch |
|---------|-----------|-----------|
| Vercel | Unlimited | $0 |
| Supabase | 500MB, 50k MAU | $0 |
| Resend | 3k emails/mo | $0 |
| OpenAI | Pay-as-you-go | ~$0.50/mo |
| **Total** | | **~$1/mo** |

## License

ISC
