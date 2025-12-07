# StudyWithPride Frontend - Development Notes

## Server Information
- **Server**: studywithpride.com
- **SSH Access**: `ssh -p 2222 root@studywithpride.com`
- **Frontend Path**: `/var/www/studywithpride/frontend`
- **Framework**: Next.js 16 with Turbopack

## Deployment Commands

### IMPORTANT: Production Build Required
This project uses `next start` (production mode), NOT `next dev`.
**All code changes require a rebuild before they take effect.**

### Deploy Changes
```bash
# 1. Connect to server
ssh -p 2222 root@studywithpride.com

# 2. Source NVM (required for node/npm)
source ~/.nvm/nvm.sh

# 3. Navigate to frontend
cd /var/www/studywithpride/frontend

# 4. Build the app (REQUIRED after code changes)
npm run build

# 5. Restart PM2 process
pm2 restart frontend
```

### Quick One-liner
```bash
ssh -p 2222 root@studywithpride.com "source ~/.nvm/nvm.sh && cd /var/www/studywithpride/frontend && npm run build && pm2 restart frontend"
```

### View Logs
```bash
ssh -p 2222 root@studywithpride.com "source ~/.nvm/nvm.sh && pm2 logs frontend --lines 50"
```

## PM2 Process
- **Process Name**: `frontend`
- **Command**: `npm start` (which runs `next start`)

## Database
- **Provider**: Supabase (PostgreSQL)
- **Key Tables**: 
  - `leads` - Recruitment leads
  - `contact_history` - Contact logs with readiness checklist
  - `tasks` - Follow-up tasks

## Key Components

### Recruiter Dashboard
- **Path**: `/admin/recruitment/dashboard`
- **QuickContactLogger**: Contact logging with follow-up scheduling
- **FunnelStatusTracker**: 5-stage funnel (Interested, Education, Funds, Passport, English)
- **TaskList**: Task management
- **UpcomingTasksWidget**: Overdue/today tasks widget

### Lead Readiness Checklist Order
1. Education (has_education_docs)
2. Funds (has_funds)  
3. Passport (has_valid_passport)
4. English (ready_to_proceed - used as proxy)

### Follow-up Options
- Today (with optional hour selector)
- Tomorrow
- In X days (customizable number)
