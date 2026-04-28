# NexLabs API & Environment Variables Guide

## 🔐 Environment Variables
To start the project locally, create a `.env.local` file in the root of your project and configure the following environment variables:

```env
# Authentication (NextAuth)
NEXTAUTH_URL=http://localhost:3000 # Update to your production URL when deploying
NEXTAUTH_SECRET= # Generate securely using: openssl rand -base64 32

# Database (Supabase)
SUPABASE_URL= # Your Supabase project URL (e.g., https://xxx.supabase.co)
SUPABASE_KEY= # Your Supabase Service Role Key

# AI Integration (OpenAI)
OPENAI_API_KEY= # Your OpenAI API Key (sk-...)

# Email Service (Resend)
RESEND_API_KEY= # Your Resend API Key (re_...)
```

## 🔌 APIs to Implement

### 1. External Third-Party APIs
You will need active accounts and API keys for the following services:
- **Supabase**: For PostgreSQL database and data storage.
- **OpenAI**: Specifically the `gpt-4o-mini` model for generating PRDs.
- **Resend**: For sending transactional emails.
- **Google OAuth (via Google Cloud Console)**: For client login/authentication.

### 2. Internal Next.js API Routes (`/app/api/*`)
These are the core endpoints you will need to build in your Next.js project to power the frontend:

| Endpoint | Method | Purpose | Expected Input |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | Handle Google OAuth & user sessions | Provider callback data |
| `/api/scoping/submit` | POST | Process the initial client scoping form | `{ email, name, idea, vertical, timeline, budget_range, referral_source }` |
| `/api/scoping/generate-prd` | POST | Trigger AI to generate a PRD from a submission | `{ submissionId }` |
| `/api/projects` | GET | List all projects belonging to the logged-in user | Auth session token |
| `/api/projects/:id` | GET | Retrieve details and messages for a specific project | URL param: `{ id }` |
| `/api/projects/:id/messages` | POST | Add a new chat message to a project | `{ content, is_internal }` |
| `/api/admin/projects` | GET | List all projects across all users (Admin only) | Auth session token (Admin) |
| `/api/admin/update-quote` | POST | Update the financial quote for a project (Admin) | `{ projectId, quote_amount, quote_notes }` |
