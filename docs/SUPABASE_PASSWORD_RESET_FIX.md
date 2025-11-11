# Fix Password Reset Link

## Issue
The reset password link doesn't work because Supabase needs to have the redirect URL configured in its dashboard.

## Solution

### Step 1: Configure Supabase Redirect URLs

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **eurovhkmzgqtjrkjwrpb**
3. Navigate to: **Authentication → URL Configuration**
4. Add these URLs to **Redirect URLs**:
   ```
   https://studywithpride.com/auth/callback
   http://localhost:3000/auth/callback
   ```
5. Set **Site URL** to:
   ```
   https://studywithpride.com
   ```
6. Click **Save**

### Step 2: Verify Email Template (Optional)

1. In Supabase Dashboard, go to: **Authentication → Email Templates**
2. Select **Reset Password** template
3. Verify the link uses: `{{ .ConfirmationURL }}`
4. The default template should work, but you can customize the email design if needed

### Step 3: Test the Flow

1. Go to: https://studywithpride.com/forgot-password
2. Enter your email address
3. Check your email for the reset link
4. Click the link - it should redirect to: `https://studywithpride.com/auth/callback?code=...&next=/reset-password`
5. The callback will exchange the code for a session and redirect to `/reset-password`
6. You should see the password reset form

## How It Works

```
User clicks "Forgot Password"
    ↓
Enter email → Supabase sends email with link
    ↓
Link: https://studywithpride.com/auth/callback?code=ABC123&next=/reset-password
    ↓
/auth/callback exchanges code for session
    ↓
Redirects to /reset-password with valid session
    ↓
User can set new password
```

## If Still Not Working

Check the browser console for errors:
- Press F12
- Go to Console tab
- Look for any errors when clicking the reset link

Common issues:
- ❌ "Redirect URL not allowed" → Add URL to Supabase dashboard
- ❌ "Invalid code" → Link may have expired (1 hour limit)
- ❌ "Session not found" → Clear cookies and try again
