# Vercel Deployment - Environment Variables Setup

## Issue Fixed
The error `Missing credentials for "PLAIN"` occurs because Vercel doesn't automatically load `.env` files in production. Environment variables must be configured in the Vercel project settings.

## Required Environment Variables

Configure these in your AWS Lambda function:

### Email Configuration
- `EMAIL_SERVICE` = `gmail`
- `EMAIL_USER` = `telogicaweb@gmail.com`
- `EMAIL_PASS` = `yuis lgyt qfim odti` (your Gmail app password)
- `EMAIL_FROM_NAME` = `Telogica`

### Database Configuration
- `MONGODB_URI` = `mongodb+srv://telogicaweb_db_user:20QPL6ImQUwM6jIo@cluster0.oe3jl52.mongodb.net/?appName=Cluster0`

### Application Configuration
- `NODE_ENV` = `production`
- `ALLOWED_ORIGINS` = `http://localhost:3000,http://localhost:5000,https://telogica-lac.vercel.app,*`

## How to Set Environment Variables in Vercel

### Option 1: Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click on "Settings" tab
4. Click on "Environment Variables" in the sidebar
5. Add each variable:
   - **Variable Name**: `EMAIL_SERVICE`
   - **Value**: `gmail`
   - **Environment**: Select "Production", "Preview", and "Development"
   - Click "Save"
6. Repeat for all variables below
7. **Redeploy your project** for changes to take effect

### Option 2: Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Set environment variables
vercel env add EMAIL_SERVICE
# Enter: gmail
# Select: Production, Preview, Development

vercel env add EMAIL_USER
# Enter: telogicaweb@gmail.com

vercel env add EMAIL_PASS
# Enter: yuis lgyt qfim odti

vercel env add EMAIL_FROM_NAME
# Enter: Telogica

vercel env add MONGODB_URI
# Enter: mongodb+srv://telogicaweb_db_user:20QPL6ImQUwM6jIo@cluster0.oe3jl52.mongodb.net/?appName=Cluster0

vercel env add NODE_ENV
# Enter: production

vercel env add ALLOWED_ORIGINS
# Enter: http://localhost:3000,http://localhost:5000,https://telogica-lac.vercel.app,*

# Redeploy
vercel --prod
```

### Option 3: Bulk Import via Vercel CLI
Create a file named `.env.production` (already have `.env`), then:
```bash
# Pull existing environment variables
vercel env pull

# Push all variables from .env to Vercel
vercel env add < .env
```

## Security Best Practice

**IMPORTANT**: 
1. Never commit `.env` files to Git (already in `.gitignore`)
2. Use Vercel's environment variable encryption (automatic)
3. Mark sensitive variables as "Sensitive" in Vercel dashboard to hide values
4. For team projects, use Vercel's built-in secrets management

### Vercel Environment Variable Types
- **Production**: Used in production deployments
- **Preview**: Used in preview deployments (git branches)
- **Development**: Used when running `vercel dev` locally

## Code Changes Made

The email service code has been updated to:
1. **Lazy load the transporter** - Creates the transporter only when needed (better for Lambda cold starts)
2. **Validate credentials** - Throws clear error if EMAIL_USER or EMAIL_PASS are missing
3. **Better error handling** - Provides actionable error messages

## Testing After Deployment

After setting environment variables in Vercel:

1. **Redeploy your project** (critical step):
   ```bash
   vercel --prod
   ```
   Or trigger a redeploy from Vercel Dashboard → Deployments → Redeploy

2. **Test the health endpoint**:
   ```bash
   curl https://your-project.vercel.app/health
   ```

3. **Test sending an email**:
   ```bash
   curl -X POST https://your-project.vercel.app/api/email/send \
     -H "Content-Type: application/json" \
     -d '{
       "to": "test@example.com",
       "subject": "Test Email",
       "text": "Testing email service"
     }'
   ```

4. **Check Vercel logs**:
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on latest deployment → Functions → View logs
   - Look for "✅ Email server is ready to send emails"

## Important Notes for Vercel

- **Serverless Functions**: Vercel runs your app as serverless functions
- **Cold Starts**: First request may be slower (lazy transporter helps with this)
- **Timeouts**: Free tier has 10s timeout, Pro has 60s (email sending is usually fast)
- **MongoDB Connection**: Use connection pooling for better performance
