# Database Provisioning Steps - Story 4.2

## Overview
This document describes how to apply the database schema for user tracking and application states.

## Database: Supabase PostgreSQL (Already Provisioned)
From Story 4.1, we already have:
- Supabase project: eurovhkmzgqtjrkjwrpb
- PostgreSQL database
- Row Level Security enabled
- Connection credentials in .env.local

## Apply Schema (Required Action)

### Step 1: Access Supabase SQL Editor
1. Go to: https://supabase.com
2. Select project: eurovhkmzgqtjrkjwrpb  
3. Navigate to: **SQL Editor**

### Step 2: Run Schema Script
1. Click "New Query"
2. Copy the entire contents of: `src/data/schemas/user-profile.sql`
3. Paste into the SQL Editor
4. Click "Run" or press Ctrl+Enter

### Step 3: Verify Tables Created
Navigate to **Table Editor** and verify:
- ✅ user_profiles (already exists from 4.1)
- ✅ application_states (new)
- ✅ saved_content (new)

### Step 4: Verify RLS Policies
Navigate to **Authentication** → **Policies**:
- Each table should have 4 policies (SELECT, INSERT, UPDATE, DELETE)
- All policies should check: auth.uid() = user_id

## What Was Created

### Tables
1. **user_profiles** - Student account information
2. **application_states** - Visa application tracking
3. **saved_content** - Saved courses/resources

### Security
- Row Level Security (RLS) on all tables
- Users can only access their own data
- Automatic updated_at timestamps

### Performance
- Indexes on user_id, status fields
- Target: <50ms write operations

## API Endpoints Created

### User Profile
- `GET /api/user/profile` - Get current user
- `PATCH /api/user/profile` - Update profile

### Applications
- `GET /api/applications` - List user applications
- `POST /api/applications` - Create application

### Saved Content
- `GET /api/saved` - List saved items
- `POST /api/saved` - Save content
- `DELETE /api/saved?id=X` - Remove saved item

## Testing

After applying schema:
```bash
cd /var/www/studywithpride/frontend
npm test __tests__/database
```

## Next Steps
Once schema is applied:
- Story 4.3: Visa Tracking UI
- Story 4.4: Saved Courses Feature

**Version**: 1.0
**Date**: 2025-11-04
**Story**: 4.2 - User Tracking Database
