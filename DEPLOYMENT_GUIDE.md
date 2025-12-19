# Deployment Guide for Render

This guide will help you deploy your MarEye Marine Security application to Render with full detection capabilities.

## Prerequisites

1. A GitHub repository with your code
2. A Render account
3. Your model files (`best (1).pt`, etc.) uploaded to your repository

## Deployment Steps

### 1. Prepare Your Repository

Make sure your repository contains:
- `render.yaml` (configuration file)
- `next.config.mjs` (updated for deployment)
- `package.json` (with proper build scripts)
- All your model files in the root directory

### 2. Deploy on Render

1. **Connect GitHub Repository**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**:
   - **Name**: `mareye-marine-security`
   - **Environment**: `Docker` (uses Dockerfile with Python support)
   - **Dockerfile Path**: `./Dockerfile`
   - **Plan**: Free (upgrade if needed for larger models/memory)

3. **Environment Variables**:
   Add these environment variables in Render dashboard:
   \`\`\`
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_random_secret
   GROQ_API_KEY=your_groq_api_key
   PYTHON_EXEC=python3
   EMAIL_DISABLE=true
   NEXT_PUBLIC_BASE_URL=https://your-app-name.onrender.com
   \`\`\`

### 3. Common Issues and Solutions

#### 502 Bad Gateway Error
This usually happens due to:
- **Build failures**: Check build logs in Render dashboard
- **Port configuration**: Ensure PORT=10000 is set
- **Memory issues**: Free tier has limited memory
- **Python dependencies**: Make sure all Python packages are in requirements.txt

#### Build Timeout
- **Solution**: Upgrade to a paid plan for longer build times
- **Alternative**: Optimize your build process

#### Memory Issues
- **Solution**: Remove unnecessary dependencies
- **Alternative**: Upgrade to a paid plan

### 4. Model Files

Make sure your model files are included in the repository:
- `best (1).pt` (40.5 MB)
- `best.pt` (40.5 MB)
- `yolov8n.pt` (6.5 MB)

**Note**: Large model files might cause deployment issues on free tier.

### 5. Python Dependencies

If you're using Python for ML processing, create a `requirements.txt` file:

\`\`\`txt
torch>=1.12.0
torchvision>=0.13.0
ultralytics>=8.0.0
opencv-python>=4.5.0
numpy>=1.21.0
Pillow>=8.3.0
\`\`\`

### 6. Troubleshooting

#### Check Build Logs
1. Go to your service in Render dashboard
2. Click on "Logs" tab
3. Look for error messages during build or runtime

#### Common Build Errors
- **Module not found**: Add missing dependencies to package.json
- **Python errors**: Check requirements.txt and Python version
- **Memory errors**: Optimize code or upgrade plan

#### Runtime Errors
- **502 errors**: Check if the app is starting correctly
- **Timeout errors**: Increase timeout settings
- **File not found**: Ensure all files are in the repository

### 7. Performance Optimization

For better performance on Render:
1. **Use static generation** where possible
2. **Optimize images** (already configured with `unoptimized: true`)
3. **Minimize bundle size** by removing unused dependencies
4. **Use CDN** for static assets if needed

### 8. Monitoring

After deployment:
1. Monitor the service health in Render dashboard
2. Check logs regularly for errors
3. Monitor memory and CPU usage
4. Set up alerts for downtime

## Support

If you encounter issues:
1. Check Render documentation
2. Review build and runtime logs
3. Test locally with production settings
4. Contact Render support if needed

## Alternative Deployment Options

If Render doesn't work well:
- **Vercel**: Optimized for Next.js
- **Netlify**: Good for static sites
- **Railway**: Similar to Render
- **Heroku**: Traditional PaaS (paid)
