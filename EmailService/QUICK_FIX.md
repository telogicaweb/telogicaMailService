# Quick Vercel Deployment Fix

## The Problem
Vercel doesn't load `.env` files in production. You're getting the credentials error because the environment variables aren't set in Vercel.

## Quick Fix (3 Steps)

### Step 1: Set Environment Variables in Vercel
Go to your Vercel project dashboard:
1. https://vercel.com/telogicaweb/[your-project-name]/settings/environment-variables
2. Add these variables (click "Add" for each):

| Variable Name | Value |
|--------------|-------|
| `EMAIL_SERVICE` | `gmail` |
| `EMAIL_USER` | `telogicaweb@gmail.com` |
| `EMAIL_PASS` | `yuis lgyt qfim odti` |
| `EMAIL_FROM_NAME` | `Telogica` |
| `MONGODB_URI` | `mongodb+srv://telogicaweb_db_user:20QPL6ImQUwM6jIo@cluster0.oe3jl52.mongodb.net/?appName=Cluster0` |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5000,https://telogica-lac.vercel.app,*` |

**Important**: Select **Production**, **Preview**, and **Development** for each variable.

### Step 2: Redeploy
After adding variables, you MUST redeploy:
- Click "Redeploy" button in Vercel dashboard, OR
- Push a new commit to trigger deployment

### Step 3: Verify
Test your deployment:
```bash
curl https://your-project.vercel.app/health
```

## Files Updated
- ✅ `emailService.js` - Added lazy transporter loading + validation
- ✅ `vercel.json` - Created Vercel configuration
- ✅ `.gitignore` - Added `.env` protection
- ✅ `VERCEL_DEPLOYMENT.md` - Full deployment guide

## Why This Happened
- `.env` file works locally
- Vercel serverless functions need explicit environment variable configuration
- The code now validates credentials and provides clear error messages

## Common Issues

### Still getting credential errors?
1. Double-check all variables are saved in Vercel
2. Make sure you clicked "Save" for each variable
3. **Redeploy** - this is required for changes to take effect

### Email not sending?
1. Verify Gmail app password is correct: `yuis lgyt qfim odti`
2. Check if 2FA is enabled on Gmail account
3. Check Vercel function logs for detailed errors

### Timeout errors?
- Vercel free tier: 10 second timeout
- Consider upgrading if emails take longer to send
- Current code is optimized for serverless (lazy loading)

---

**Ready to deploy?** Set those environment variables in Vercel and redeploy! 🚀
