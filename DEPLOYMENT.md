# Deploy to Render - Step by Step Guide

## Prerequisites
- A Render account (free tier available)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Repository

1. Make sure all your code is committed and pushed to your Git repository
2. Ensure your `.env` file is in `.gitignore` (it should be already)
3. The following files have been created for deployment:
   - `render.yaml` - Render configuration
   - `Dockerfile` - Container configuration
   - `.dockerignore` - Files to exclude from build

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. Go to [render.com](https://render.com) and sign in
2. Click "New +" and select "Blueprint"
3. Connect your Git repository
4. Render will automatically detect the `render.yaml` file
5. Click "Apply" to create both the database and web service

### Option B: Manual Setup

#### Create PostgreSQL Database
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" and select "PostgreSQL"
3. Choose "Free" plan
4. Name it `backend-postgres`
5. Click "Create Database"
6. Note down the connection details (you'll need them later)

#### Create Web Service
1. Click "New +" and select "Web Service"
2. Connect your Git repository
3. Configure the service:
   - **Name**: `backend-nodejs`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

#### Set Environment Variables
In your web service settings, add these environment variables:

```
NODE_ENV=production
PORT=10000
DB_NAME=backend_db
DB_USER=backend_user
DB_PASS=[from your database]
DB_HOST=[from your database]
DB_PORT=[from your database]
CORS_ORIGIN=*
```

## Step 3: Configure Environment Variables

### For Production
Update the `CORS_ORIGIN` in your Render dashboard to match your frontend URL:
- If your frontend is also on Render: `https://your-frontend-app.onrender.com`
- If using a custom domain: `https://yourdomain.com`
- For development: `http://localhost:3000`

### JWT Secret (if needed)
If your app uses JWT authentication, add a `JWT_SECRET` environment variable in Render.

## Step 4: Deploy and Test

1. Click "Deploy" in your Render dashboard
2. Wait for the build to complete (usually 2-5 minutes)
3. Your API will be available at: `https://your-app-name.onrender.com`

## Step 5: Run Database Migrations

After deployment, you may need to run your database migrations:

1. Go to your web service in Render
2. Click on "Shell"
3. Run: `node run-migration.js`

## Troubleshooting

### Common Issues

1. **Build Fails**: Check the build logs in Render dashboard
2. **Database Connection**: Verify all database environment variables are set correctly
3. **Port Issues**: Make sure your app listens on `process.env.PORT`
4. **CORS Errors**: Update `CORS_ORIGIN` to match your frontend URL

### Logs
- View logs in the Render dashboard under your service
- Check both build logs and runtime logs

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `10000` |
| `DB_NAME` | Database name | `backend_db` |
| `DB_USER` | Database user | `backend_user` |
| `DB_PASS` | Database password | `[auto-generated]` |
| `DB_HOST` | Database host | `[auto-generated]` |
| `DB_PORT` | Database port | `5432` |
| `CORS_ORIGIN` | Allowed origins | `https://your-frontend.com` |

## Free Tier Limitations

- **Web Services**: Sleep after 15 minutes of inactivity
- **Databases**: 90-day expiration (renewable)
- **Build Time**: 500 minutes per month
- **Bandwidth**: 100 GB per month

## Next Steps

1. Set up automatic deployments from your main branch
2. Configure custom domains if needed
3. Set up monitoring and alerts
4. Consider upgrading to paid plans for production use 