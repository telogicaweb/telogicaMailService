# 🔧 Vercel Deployment Checklist

## Current Status: ❌ Environment Variables Not Set

Your logs show: `Missing credentials for "PLAIN"` - This means **EMAIL_USER** and **EMAIL_PASS** are not configured in Vercel.

## ✅ Step-by-Step Fix

### 1️⃣ Set Environment Variables in Vercel (CRITICAL)

Go to: **https://vercel.com/telogicawebs-projects/telogica-mail-service/settings/environment-variables**

Add these 7 variables:

| Variable | Value | Environments |
|----------|-------|--------------|
| `EMAIL_SERVICE` | `gmail` | Production ✅ Preview ✅ Development ✅ |
| `EMAIL_USER` | `telogicaweb@gmail.com` | Production ✅ Preview ✅ Development ✅ |
| `EMAIL_PASS` | `yuis lgyt qfim odti` | Production ✅ Preview ✅ Development ✅ |
| `EMAIL_FROM_NAME` | `Telogica` | Production ✅ Preview ✅ Development ✅ |
| `MONGODB_URI` | `mongodb+srv://telogicaweb_db_user:20QPL6ImQUwM6jIo@cluster0.oe3jl52.mongodb.net/?appName=Cluster0` | Production ✅ Preview ✅ Development ✅ |
| `NODE_ENV` | `production` | Production ✅ Preview ✅ Development ✅ |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5000,https://telogica-lac.vercel.app,*` | Production ✅ Preview ✅ Development ✅ |

**IMPORTANT**: Check ALL THREE boxes (Production, Preview, Development) for each variable!

### 2️⃣ Redeploy (REQUIRED!)

Environment variables only apply to NEW deployments. You MUST redeploy:

**Option A: Vercel Dashboard**
- Go to: https://vercel.com/telogicawebs-projects/telogica-mail-service
- Click "Deployments" tab
- Click the 3 dots (...) on the latest deployment
- Click "Redeploy"

**Option B: Git Push**
```bash
cd e:\telogicaMailService\EmailService
git add .
git commit -m "Fix: Add Vercel proxy trust and environment variable validation"
git push
```

**Option C: Vercel CLI**
```bash
vercel --prod
```

### 3️⃣ Verify Configuration

After redeployment, test this endpoint:
```bash
curl https://telogica-mail-service.vercel.app/api/config/check
```

**Expected Response:**
```json
{
  "emailConfigured": true,
  "details": {
    "EMAIL_USER": "telog***",
    "EMAIL_PASS": "✅ SET",
    "EMAIL_SERVICE": "gmail",
    "MONGODB_URI": "✅ SET"
  },
  "message": "✅ Email credentials are configured"
}
```

**If you see ❌ MISSING**, the environment variables are not set correctly in Vercel.

### 4️⃣ Test Email Sending

```bash
curl -X POST https://telogica-mail-service.vercel.app/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test from Vercel",
    "text": "If you receive this, the email service is working!"
  }'
```

## 🐛 Issues Fixed in Code

✅ **Added `trust proxy` setting** - Fixes the rate limiter error  
✅ **Added credential validation** - Better error messages  
✅ **Added debug endpoint** `/api/config/check` - Check if env vars are set  
✅ **Improved logging** - Shows which credentials are missing  

## ❓ Common Issues

### Still getting "Missing credentials" error?
1. ✅ Environment variables added in Vercel? 
2. ✅ Clicked "Save" for each variable?
3. ✅ Selected Production, Preview, AND Development?
4. ✅ **Redeployed after adding variables?** ← Most common mistake!

### Rate limiter error gone?
✅ Yes! Added `app.set('trust proxy', 1)` to fix this.

### How to check if variables are set?
Visit: `https://telogica-mail-service.vercel.app/api/config/check`

### Need to update a variable?
1. Go to Vercel → Settings → Environment Variables
2. Find the variable
3. Click "Edit"
4. Update value
5. **Redeploy!**

## 📝 Next Steps

1. [ ] Add environment variables in Vercel dashboard
2. [ ] Redeploy the project
3. [ ] Test `/api/config/check` endpoint
4. [ ] Test sending an email
5. [ ] Check Vercel logs for "✅ Email server is ready"

---

**Quick Link:** https://vercel.com/telogicawebs-projects/telogica-mail-service/settings/environment-variables
