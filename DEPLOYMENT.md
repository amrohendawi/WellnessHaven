# Vercel Deployment Guide

This guide will walk you through the steps to deploy the Dubai Rose Beauty & Aesthetics Center website to Vercel.

## Prerequisites

1. A Vercel account (https://vercel.com/signup)
2. Access to the project repository

## Steps to Deploy

### 1. Connect to GitHub

1. Log in to your Vercel account
2. Click "Add New..." > "Project"
3. Import the GitHub repository
4. Select the "WellnessHaven" repository

### 2. Configure Environment Variables

The following environment variables need to be set in the Vercel dashboard:

- `DATABASE_URL`: Your Neon PostgreSQL database connection string
- `NODE_ENV`: Set to `production` for production builds

To add these variables:

1. Go to your project settings in Vercel
2. Click on "Environment Variables"
3. Add each variable key and value
4. Make sure to mark them as "Production" environment

### 3. Deploy Settings

Vercel should automatically detect the project as a Vite project based on the `vercel.json` configuration.

Deployment settings:

- Build Command: `npm run build`
- Output Directory: `dist/public`
- Install Command: `npm install`
- Development Command: `npm run dev`

### 4. Deploy

Click the "Deploy" button to start the deployment process. Vercel will:

1. Clone your repository
2. Install dependencies
3. Build the application
4. Deploy to the Vercel network

### 5. Custom Domain (Optional)

To use a custom domain:

1. Go to your project settings
2. Click on "Domains"
3. Add your domain and follow the instructions to verify

### 6. Monitor Deployment

After deployment, you can:

1. View build logs to debug any issues
2. Check the deployment preview
3. Monitor performance in the Vercel dashboard

## Troubleshooting

### Database Connection Issues

- Make sure your DATABASE_URL is correctly formatted
- Ensure your database allows connections from Vercel's IP addresses
- Check your database logs for connection attempts

### Build Failures

- Examine the build logs in Vercel
- Try running the build locally with `npm run build`
- Make sure all dependencies are correctly listed in package.json

### API Routes Not Working

- Check the Vercel function logs for errors
- Ensure your API routes follow Vercel's serverless function format
- Test API endpoints locally before deployment

## Maintenance

### Updating Your Site

Any changes pushed to the main branch will automatically trigger a new deployment.

### Preview Deployments

Vercel creates preview deployments for pull requests, allowing you to test changes before merging to production.
