# Fix Supabase Schema Cache Issue

## Problem
The profile update is failing with error: "Could not find the 'phone_number' column of 'user_profiles' in the schema cache"

## Solution

You need to add the `phone_number` column to your Supabase database:

### Step 1: Go to Supabase SQL Editor

1. Visit: https://supabase.com/dashboard
2. Select your project: **eurovhkmzgqtjrkjwrpb**
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run This SQL

```sql
-- Add phone_number column if it doesn't exist
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Refresh schema cache (optional but recommended)
NOTIFY pgrst, 'reload schema';
```

### Step 3: Verify

Run this query to check:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND table_schema = 'public';
```

You should see:
- id
- email
- full_name
- country_of_origin
- preferred_language
- **phone_number** ← This should now appear
- created_at
- updated_at

### Alternative Quick Fix

If you want profile updates to work immediately without waiting for the database update, I can temporarily remove the phone_number field from the profile form. The essential field (country_of_origin) will still work.

Would you like me to:
A) Wait for you to add the column in Supabase (recommended)
B) Remove phone_number from the form temporarily
