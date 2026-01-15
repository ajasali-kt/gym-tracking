# Deployment Guide - Render.com

This guide will help you deploy the Gym Tracking Application to Render.com.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start Deployment](#quick-start-deployment)
- [Manual Configuration](#manual-configuration)
- [Post-Deployment Setup](#post-deployment-setup)
- [Database Management](#database-management)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

1. **Git Repository**: Your code pushed to GitHub or GitLab
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin master
   ```

2. **Render Account**: Sign up at [render.com](https://render.com) (free)

3. **Environment Ready**: Ensure your local setup works before deploying

---

## Quick Start Deployment

### Option 1: Blueprint Deployment (Recommended)

This method uses the included `render.yaml` file to deploy everything automatically.

**Step 1: Push render.yaml to GitHub**
```bash
git add render.yaml
git commit -m "Add Render blueprint configuration"
git push origin master
```

**Step 2: Deploy on Render**
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub/GitLab account (if not already connected)
4. Select your **gym-tracking** repository
5. Render will detect `render.yaml` automatically
6. Click **"Apply"**
7. Wait 5-10 minutes for all services to deploy

**Step 3: Configure Environment Variables**

After deployment completes, you need to set cross-service URLs:

**Backend Service (gym-tracker-api):**
1. Go to backend service → **Environment**
2. Add/Update:
   - `FRONTEND_URL`: `https://gym-tracker-frontend.onrender.com` (copy your actual frontend URL)
3. Click **"Save Changes"**
4. Service will auto-redeploy

**Frontend Service (gym-tracker-frontend):**
1. Go to frontend service → **Environment**
2. Add/Update:
   - `VITE_API_URL`: `https://gym-tracker-api.onrender.com` (copy your actual backend URL)
3. Click **"Save Changes"**
4. Service will auto-redeploy

**Step 4: Seed the Database (Optional)**
1. Go to backend service → **Shell** tab
2. Run:
   ```bash
   npm run deploy:seed
   ```
3. This populates the database with initial muscle groups and exercises

**Step 5: Test Your Deployment**
- Backend Health: `https://gym-tracker-api.onrender.com/health`
- Frontend: `https://gym-tracker-frontend.onrender.com`

---

## Manual Configuration

If you prefer manual setup or need more control:

### Step 1: Create PostgreSQL Database

1. Dashboard → **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `gym-tracker-db`
   - **Database**: `gym_tracker_production`
   - **User**: `gym_tracker_user`
   - **Region**: Oregon (free tier)
   - **Plan**: Free
3. Click **"Create Database"**
4. **Copy the Internal Database URL** (starts with `postgresql://`)

### Step 2: Deploy Backend API

1. Dashboard → **"New +"** → **"Web Service"**
2. Connect your repository
3. Configure:
   - **Name**: `gym-tracker-api`
   - **Region**: Oregon
   - **Branch**: master (or main)
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**:
     ```bash
     npm ci && npx prisma generate && npx prisma migrate deploy
     ```
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5001
   DATABASE_URL=<paste internal database URL from Step 1>
   FRONTEND_URL=<will add after frontend deployment>
   ```

5. Click **"Create Web Service"**
6. Wait for build to complete (~3-5 minutes)

### Step 3: Deploy Frontend

1. Dashboard → **"New +"** → **"Static Site"**
2. Connect same repository
3. Configure:
   - **Name**: `gym-tracker-frontend`
   - **Region**: Oregon
   - **Branch**: master (or main)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

4. **Add Environment Variables**:
   ```
   VITE_API_URL=<paste backend URL from Step 2>
   ```

5. Click **"Create Static Site"**

### Step 4: Update Backend CORS

1. Go to backend service settings
2. Update `FRONTEND_URL` environment variable with your frontend URL
3. **Save Changes** (auto-redeploys)

---

## Post-Deployment Setup

### Seed Database with Initial Data

Option A: Using Render Shell
```bash
# Go to backend service → Shell tab
npm run deploy:seed
```

Option B: Using API (Postman/curl)
```bash
# Use the provided seed endpoints if available
curl -X POST https://gym-tracker-api.onrender.com/api/seed
```

### Set Up Auto-Deploy

Render automatically deploys on git push by default. To configure:

1. Go to service → **Settings**
2. Scroll to **Auto-Deploy**
3. Enable/Disable as needed

### Configure Custom Domain (Optional)

1. Go to service → **Settings** → **Custom Domain**
2. Add your domain (e.g., `gym.yourdomain.com`)
3. Follow DNS configuration instructions
4. Free SSL certificate included

---

## Database Management

### Free Tier Limitations

- **Storage**: 256 MB
- **Retention**: 90 days of inactivity (database deleted after 90 days without connections)
- **Backups**: None (manual backups recommended)

### Prevent Database Deletion

Your database stays active as long as:
- Your app receives traffic
- Backend connects to database regularly

**Set up a keep-alive ping** (recommended):

1. Use [cron-job.org](https://cron-job.org) (free)
2. Create a job that hits: `https://gym-tracker-api.onrender.com/health`
3. Schedule: Once per week
4. This prevents the 90-day deletion

### Manual Database Backup

**Export Database:**
```bash
# Get external database URL from Render dashboard
pg_dump <EXTERNAL_DATABASE_URL> > backup-$(date +%Y%m%d).sql
```

**Restore Database:**
```bash
psql <EXTERNAL_DATABASE_URL> < backup-20260117.sql
```

**Recommended**: Set up monthly backup reminders

### Upgrade to Paid Tier ($7/month)

Benefits:
- Permanent storage (no 90-day deletion)
- Automated daily backups
- 1GB storage (vs 256MB)

To upgrade:
1. Go to database → **Settings**
2. Click **"Change Plan"**
3. Select **Starter** plan

---

## Monitoring & Maintenance

### View Logs

1. Go to service → **Logs** tab
2. Real-time logs appear here
3. Filter by severity: Info, Warning, Error

### Monitor Service Health

1. Dashboard shows service status
2. Green = Running, Yellow = Building, Red = Failed
3. Click service for detailed metrics

### Set Up Alerts

1. Go to service → **Settings** → **Notifications**
2. Add email for deploy failures
3. Add Slack/Discord webhooks (optional)

### Cold Starts (Free Tier)

Free tier services spin down after 15 minutes of inactivity:
- First request after spin down: 30-60 second delay
- Active hours: 750 hours/month shared across services

**Solution**: Upgrade to Starter plan ($7/month) for always-on service

---

## Troubleshooting

### Build Fails

**Error**: "npm install failed"
```bash
# Solution: Ensure package-lock.json is committed
git add backend/package-lock.json frontend/package-lock.json
git commit -m "Add package-lock files"
git push
```

**Error**: "Prisma migration failed"
```bash
# Check DATABASE_URL is set correctly
# Use Internal Database URL, not External
```

### Database Connection Error

**Error**: "Can't reach database server"
- Verify `DATABASE_URL` uses **Internal Database URL**
- Check database is running (green status)
- Ensure database and backend are in same region

### CORS Errors

**Error**: "Access-Control-Allow-Origin"
- Check `FRONTEND_URL` in backend matches frontend URL exactly
- No trailing slash in URL
- Include `https://` protocol

### Frontend Can't Reach Backend

**Error**: "Network Error" or 404
- Verify `VITE_API_URL` is set in frontend environment
- Include full URL with `https://`
- Check backend service is running

### App is Slow/Not Loading

**Free Tier Cold Start**:
- Services spin down after 15 minutes
- First request takes 30-60 seconds
- Subsequent requests are fast

**Solutions**:
1. Use a keep-alive ping service
2. Upgrade to Starter plan ($7/month)

### Database Deleted

**Error**: "Database not found"
- Free tier databases deleted after 90 days inactivity
- **Prevention**: Set up weekly keep-alive ping
- **Recovery**: Restore from manual backup

---

## Environment Variables Reference

### Backend (gym-tracker-api)

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `5001` | Server port (auto-set by Render) |
| `DATABASE_URL` | Auto-generated | PostgreSQL connection string |
| `FRONTEND_URL` | `https://gym-tracker-frontend.onrender.com` | Frontend URL for CORS |

### Frontend (gym-tracker-frontend)

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://gym-tracker-api.onrender.com` | Backend API URL |

---

## Cost Breakdown

### Free Tier (Development/Personal Use)
- **Database**: Free (256MB, 90-day retention)
- **Backend**: Free (750 hours/month, cold starts)
- **Frontend**: Free (unlimited, no cold starts)
- **Total**: **$0/month**

### Recommended Production Setup
- **Database Starter**: $7/month (1GB, permanent, backups)
- **Backend Starter**: $7/month (always-on, no cold starts)
- **Frontend**: Free (unlimited)
- **Total**: **$14/month**

---

## Next Steps

After successful deployment:

1. ✅ Test all features thoroughly
2. ✅ Set up database backups (if using free tier)
3. ✅ Configure custom domain (optional)
4. ✅ Set up monitoring/alerts
5. ✅ Document your production URLs for team

---

## Support & Resources

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Render Status**: [status.render.com](https://status.render.com)
- **Community**: [community.render.com](https://community.render.com)
- **Project Issues**: [GitHub Issues](https://github.com/yourusername/gym-tracking/issues)

---

## Quick Reference URLs

After deployment, save these URLs:

```
Frontend:  https://gym-tracker-frontend.onrender.com
Backend:   https://gym-tracker-api.onrender.com
Database:  (Internal URL from Render dashboard)
Health:    https://gym-tracker-api.onrender.com/health
```

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Notes**: _____________
