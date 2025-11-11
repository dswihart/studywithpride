# Supabase Redirect URL Fix - Action Required

## Problem
When users sign up, they are being redirected to:
```
http://65.109.175.233:3000/?code=...
```

This is happening because Supabase needs to be configured with the correct redirect URLs.

## Solution

### Step 1: Access Supabase Dashboard

1. Go to https://supabase.com
2. Sign in to your account
3. Select your project: **eurovhkmzgqtjrkjwrpb**

### Step 2: Update Site URL

1. Navigate to **Authentication** → **URL Configuration**
2. Update the **Site URL** field to one of these (depending on your setup):
   - If using HTTPS: `https://studywithpride.com`
   - If using HTTP for now: `http://65.109.175.233:3000`
   - For development: `http://localhost:3000`

### Step 3: Add Redirect URLs

In the **Redirect URLs** section, add the following URLs (one per line):

```
http://65.109.175.233:3000/auth/callback
https://studywithpride.com/auth/callback
http://localhost:3000/auth/callback
```

### Step 4: Save Changes

1. Click **Save** at the bottom of the page
2. Wait a few seconds for the changes to propagate

### Step 5: Test Signup Flow

1. Go to your site
2. Try signing up with a new email
3. Check your email for the confirmation link
4. Click the confirmation link
5. You should now be redirected to `/auth/callback` and then to `/student-portal`

## Code Changes Already Applied

The following code changes have been made to support proper redirects:

### 1. AuthContext Updated
**File**: `components/AuthContext.tsx`

- Added `emailRedirectTo` parameter to signUp function
- Uses dynamic protocol detection (HTTP/HTTPS)
- Redirects to `/auth/callback` route

### 2. Auth Callback Route Enhanced
**File**: `app/auth/callback/route.ts`

- Now handles both OAuth and email confirmation codes
- Automatically detects HTTP vs HTTPS
- Redirects to `/student-portal` after successful authentication

## HTTPS Setup (Recommended for Production)

Currently, your site is running on HTTP (port 3000). For production, you should:

### Option 1: Use a Reverse Proxy (Recommended)

Set up nginx with SSL:

```bash
# Install nginx and certbot
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d studywithpride.com

# Configure nginx as reverse proxy
sudo nano /etc/nginx/sites-available/studywithpride
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name studywithpride.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name studywithpride.com;

    ssl_certificate /etc/letsencrypt/live/studywithpride.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/studywithpride.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then:

```bash
sudo ln -s /etc/nginx/sites-available/studywithpride /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Use Vercel/Netlify (Easy HTTPS)

Deploy to a platform with automatic HTTPS:
- Vercel: https://vercel.com
- Netlify: https://netlify.com

Both provide free HTTPS certificates automatically.

## Quick Fix for Now

If you want the site to work immediately without HTTPS:

1. Update Supabase Site URL to: `http://65.109.175.233:3000`
2. Add redirect URL: `http://65.109.175.233:3000/auth/callback`
3. Test signup flow

The code will automatically detect HTTP and use the correct protocol.

## Verification

After updating Supabase settings, test:

1. Sign up with a new email
2. Check that redirect goes to `/auth/callback` (not homepage)
3. Verify you are redirected to `/student-portal` after confirmation

## Need Help?

If you encounter issues:

1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Ensure `.env.local` has the correct Supabase URL and keys

---

**Status**: ✅ Code fixes applied, awaiting Supabase dashboard update
**Date**: 2025-11-04
