# Study With Pride - System Architecture

## Overview
Study With Pride is a secure platform for LGBTQ+ Latin American students seeking education in Barcelona.

## Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS
- **Auth**: Supabase Authentication
- **Database**: PostgreSQL via Supabase with Row Level Security
- **CMS**: Strapi headless CMS

## Authentication Architecture (Epic 4.1)

### Identity Provider
**Supabase** handles all authentication with email/password and potential OAuth providers.

### Components
- **AuthContext** (`components/AuthContext.tsx`): Client-side auth state
- **Server Client** (`lib/supabase/server.ts`): Server-side auth
- **Callback Route** (`app/auth/callback/route.ts`): OAuth redirect handler

### Security
- JWT tokens in HTTP-only cookies
- Row Level Security (RLS) for database access
- Service role key never exposed client-side
- HTTPS enforced

## Database Architecture

### Transactional Database: PostgreSQL (Supabase)

#### Tables
- **user_profiles**: Student account information
- **applications** (future): Visa application tracking

### Row Level Security Policies
All tables have RLS enabled. Users can only access their own data via auth.uid() checks.

## Performance Requirements (NFR2)
- Target: Sub-3 second page load time
- Static page generation where possible
- Code splitting and lazy loading
- Lighthouse CI monitoring

## Deployment
- Production: studywithpride.com (65.109.175.233)
- Platform: Ubuntu 24.04 LTS
- Process: Next.js on port 3000

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Public, safe for client
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public with RLS protection
- `SUPABASE_SERVICE_ROLE_KEY`: Server-only, never exposed

---
**Version**: 1.0
**Last Updated**: 2025-11-04
**Epic**: 4.1 - Authentication Stack
