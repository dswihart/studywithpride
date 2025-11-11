# Supabase Configuration Guide - Study With Pride Authentication

## Prerequisites
- You have a Supabase account
- Your project is created: `eurovhkmzgqtjrkjwrpb`
- You have the credentials already configured in `.env.local`

---

## Step 1: Run Database Schema (5 minutes)

### 1.1 Access Supabase Dashboard
1. Open your browser and go to **https://supabase.com**
2. Click **Sign In** (top right)
3. Log in with your credentials
4. You should see your project dashboard

### 1.2 Navigate to SQL Editor
1. In the left sidebar, look for the **SQL Editor** icon (looks like a terminal/code symbol)
2. Click on **SQL Editor**
3. You'll see a page with a code editor

### 1.3 Create New Query
1. Click the **"+ New query"** button (top left of the editor area)
2. A blank SQL editor will appear
3. You can optionally name your query "Setup Authentication Schema" by clicking on "Untitled Query" at the top

### 1.4 Copy and Paste the Schema
Copy this ENTIRE SQL script and paste it into the SQL editor:

```sql
-- ============================================
-- Study With Pride - Authentication Schema
-- ============================================

-- Create user_profiles table for student data
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  country_of_origin TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Create policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Verification Queries
-- ============================================

-- Show created table
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'user_profiles';

-- Show RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profiles';
```

### 1.5 Run the Query
1. Click the **"RUN"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
2. You should see a success message at the bottom: "Success. No rows returned"
3. Scroll down to see the verification results:
   - First query shows: `user_profiles` table exists
   - Second query shows: 3 RLS policies are active

### 1.6 Verify Table Creation (Optional but Recommended)
1. In the left sidebar, click **"Table Editor"**
2. You should now see **"user_profiles"** in the list of tables
3. Click on it to see the table structure:
   - Columns: `id`, `email`, `full_name`, `country_of_origin`, `preferred_language`, `created_at`, `updated_at`

**✅ Database schema is now complete!**

---

## Step 2: Configure Redirect URLs (2 minutes)

### 2.1 Navigate to Authentication Settings
1. In the left sidebar, click on **"Authentication"** (icon looks like a key/lock)
2. Click on **"URL Configuration"** in the sub-menu

### 2.2 Add Redirect URLs
You'll see a section called **"Redirect URLs"**

1. In the text input field, add this URL:
   ```
   http://65.109.175.233:3000/auth/callback
   ```
2. Click the **"Add URL"** button or press Enter

3. Add a second URL for local development:
   ```
   http://localhost:3000/auth/callback
   ```
4. Click **"Add URL"** again

5. You should now see both URLs listed in the "Redirect URLs" section

### 2.3 Configure Site URL (Important!)
1. Scroll to the **"Site URL"** field
2. Enter your production URL:
   ```
   http://65.109.175.233:3000
   ```
3. This is the URL users will be redirected to after email confirmation

### 2.4 Save Changes
1. Scroll to the bottom of the page
2. Click the **"Save"** button (bright green button)
3. You should see a success toast notification: "Successfully updated settings"

**✅ Redirect URLs are now configured!**

---

## Step 3: Verify Email Provider (1 minute)

### 3.1 Navigate to Authentication Providers
1. In the left sidebar, under **"Authentication"**
2. Click on **"Providers"**

### 3.2 Check Email Provider Status
1. You'll see a list of authentication providers
2. Look for **"Email"** in the list
3. Ensure it shows **"Enabled"** (green toggle/checkmark)
4. If it's disabled (gray), click on it and toggle it to **"Enabled"**

### 3.3 Configure Email Templates (Optional but Recommended)
1. Click on **"Email Templates"** in the Authentication sub-menu
2. You'll see templates for:
   - **Confirm signup** - Email sent when users register
   - **Magic Link** - For passwordless login
   - **Change Email Address** - When users update their email
   - **Reset Password** - Password reset emails

**For a better user experience, customize the "Confirm signup" email:**

1. Click on **"Confirm signup"**
2. Edit the email template to match your branding:

**Subject:**
```
Welcome to Study With Pride - Confirm Your Email
```

**Body (you can customize further):**
```html
<h2>Welcome to Study With Pride!</h2>
<p>Thank you for creating an account. Click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
<p>This link will expire in 24 hours.</p>
<p>If you didn't create this account, you can safely ignore this email.</p>
<p>Best regards,<br>The Study With Pride Team</p>
```

3. Click **"Save"** at the bottom

**✅ Email provider is configured!**

---

## Step 4: Test the Authentication Flow (10 minutes)

### 4.1 Open the Website
1. Open a new browser tab (use incognito/private mode for clean testing)
2. Go to: **http://65.109.175.233:3000**
3. You should see the Study With Pride homepage

### 4.2 Test Registration
1. Click the **"Sign Up"** button in the header
2. Fill out the registration form:
   - **Full Name**: Your Test Name
   - **Email**: Use a real email you can access
   - **Password**: At least 8 characters
   - **Confirm Password**: Same password
   - Check the **"I agree to Terms of Service"** checkbox
3. Click **"Create Account"**

### 4.3 Expected Behavior
**On Success:**
- You'll see a green success message: "Account Created!"
- Message says: "Please check your email to confirm your account"
- After 2 seconds, you'll be redirected to `/login`

**On Error:**
- If you see an error, check the browser console (F12) for details
- Common errors:
  - "User already registered" - Email is already in use
  - Network error - Check Supabase credentials in `.env.local`

### 4.4 Confirm Email
1. Check your email inbox (and spam folder!)
2. You should receive an email from Supabase
3. Click the **"Confirm your email"** link
4. You'll be redirected to: `http://65.109.175.233:3000/student-portal`
5. You should see the Student Portal dashboard with your email displayed

### 4.5 Test Login
1. Click **"Sign Out"** in the user menu
2. You'll be redirected to the homepage
3. Click **"Login"** in the header
4. Enter your email and password
5. Click **"Sign In"**
6. You should be redirected to `/student-portal` and see your dashboard

### 4.6 Test Session Persistence
1. While logged in, refresh the page (F5)
2. You should remain logged in (not redirected to login)
3. Navigate to different pages (Visa Guide, Cost Calculator)
4. You should still be logged in with your email showing in the header

### 4.7 Test Protected Route
1. Sign out completely
2. Manually try to access: `http://65.109.175.233:3000/student-portal`
3. You should be automatically redirected to `/login`
4. This confirms the authentication guard is working

---

## Troubleshooting

### Issue: "Invalid redirect URL" error
**Solution:**
- Go back to Authentication → URL Configuration
- Verify both redirect URLs are added exactly as shown
- Make sure there are no trailing slashes
- Click Save again

### Issue: Email not received
**Solutions:**
1. Check spam/junk folder
2. In Supabase, go to Authentication → Rate Limits
3. Verify your email isn't rate-limited
4. Go to Authentication → Logs to see if the email was sent

### Issue: "Failed to fetch" or network errors
**Solutions:**
1. Verify Supabase credentials in `.env.local` on the server:
   ```bash
   ssh -p 2222 root@65.109.175.233
   cd /var/www/studywithpride/frontend
   grep SUPABASE .env.local
   ```
2. Verify the URL matches: `https://eurovhkmzgqtjrkjwrpb.supabase.co`
3. Restart the server:
   ```bash
   fuser -k 3000/tcp && sleep 3 && npm start
   ```

### Issue: Database error when creating user
**Solution:**
- Re-run the SQL schema from Step 1
- Check that the trigger was created successfully
- In Supabase, go to Database → Functions
- Verify `handle_new_user` function exists

### Issue: Cannot access user_profiles table
**Solution:**
- Row Level Security is active (this is good!)
- Users can only see their own profile
- To test as admin, use the Supabase Table Editor
- Or temporarily disable RLS for testing (not recommended for production)

---

## Verification Checklist

After completing all steps, verify:

- ✅ `user_profiles` table exists in Supabase
- ✅ RLS policies are active (3 policies)
- ✅ `handle_new_user` trigger function exists
- ✅ Redirect URLs are configured (2 URLs)
- ✅ Site URL is set to production URL
- ✅ Email provider is enabled
- ✅ Can register new user successfully
- ✅ Email confirmation is received
- ✅ Can log in with confirmed account
- ✅ User menu shows email in header
- ✅ Can access `/student-portal` when logged in
- ✅ Redirected to `/login` when not authenticated
- ✅ Session persists across page refreshes
- ✅ Sign out works correctly

---

## Next Steps (After Testing Works)

Once authentication is working perfectly:

1. **Update Architecture Documentation**
   - Document the authentication flow
   - Add Supabase as the transactional database
   - Include RLS security model explanation

2. **Performance Testing**
   - Run Lighthouse audit on `/login` page
   - Verify sub-3 second load time (NFR2)
   - Test on mobile devices

3. **Security Review**
   - Rotate Supabase service role key (keep it secret!)
   - Never commit keys to Git
   - Review RLS policies for data access

4. **Production Considerations**
   - Set up custom SMTP for email (optional)
   - Configure custom domain for Supabase (optional)
   - Set up monitoring and alerts
   - Plan for database backups

---

## Support Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Authentication Guide**: https://supabase.com/docs/guides/auth
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security
- **Email Templates**: https://supabase.com/docs/guides/auth/auth-email-templates

---

**Created**: 2025-11-04
**Story**: 4.1 - Authentication Stack Provisioning
**Status**: Configuration Guide for 90% Complete Implementation
