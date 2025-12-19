# Render Deployment Checklist for MarEye

## ✅ Pre-Deployment Checklist

### 1. Model Files (REQUIRED)
- [x] `best.pt` (38.6 MB) - Main YOLO model
- [x] `yolov8n.pt` (6.2 MB) - Fallback model
- [x] `data.yaml` - Model configuration

### 2. Environment Variables (Set in Render Dashboard)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
GROQ_API_KEY=your_groq_api_key
PYTHON_EXEC=python3
EMAIL_DISABLE=true
NEXT_PUBLIC_BASE_URL=https://your-app-name.onrender.com
```

### 3. GitHub Repository
- [x] All code pushed to GitHub
- [x] `render.yaml` configured
- [x] `Dockerfile` updated with Python support
- [x] Model files committed (or use Git LFS for large files)

### 4. Detection System
- [x] `threat_detector.py` in root directory
- [x] `requirements.txt` optimized for deployment
- [x] Detection API endpoint: `/api/detection/process`
- [x] Confidence threshold: 0.25 (optimized for production)

## 🚀 Deployment Steps

1. **Connect Repository to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `Anubhab-Rakshit/mareye`
   - Select branch: `main` (or your deployment branch)

2. **Configure Service**
   - **Name**: `mareye-marine-security`
   - **Environment**: `Docker` (uses Dockerfile)
   - **Plan**: Free (upgrade if needed for larger models)
   - **Auto-Deploy**: Yes

3. **Set Environment Variables**
   - Copy all variables from section 2 above
   - **IMPORTANT**: Update `NEXT_PUBLIC_BASE_URL` after first deployment with your actual Render URL
   - **IMPORTANT**: Set `MONGODB_URI` to your MongoDB Atlas connection string (or local MongoDB)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (may take 10-15 minutes due to Python dependencies)
   - Monitor build logs for any errors

## 🔍 Post-Deployment Testing

### Test Detection Endpoint
```bash
curl -X POST https://your-app.onrender.com/api/detection/process \
  -F "file=@test_image.jpg" \
  -F "type=image"
```

### Test Health Check
```bash
curl https://your-app.onrender.com/api/health
```

### Test Authentication
- Visit: `https://your-app.onrender.com/auth/login`
- Test registration and login flows

## ⚠️ Common Issues & Solutions

### Build Fails: "Out of memory"
- **Solution**: Upgrade to paid plan or optimize Dockerfile to use multi-stage builds more efficiently

### Detection Fails: "Model not found"
- **Solution**: Ensure `best.pt` is in repository root and committed to Git

### Detection Fails: "Python not found"
- **Solution**: Check `PYTHON_EXEC` env var is set to `python3`

### Detection Slow/Timeout
- **Solution**: 
  - Increase API route timeout in `next.config.mjs`
  - Consider using Render's background workers for heavy processing
  - Optimize model size or use ONNX runtime

### MongoDB Connection Fails
- **Solution**: 
  - Use MongoDB Atlas (cloud) instead of local MongoDB
  - Update `MONGODB_URI` with correct connection string
  - Whitelist Render IPs in MongoDB Atlas

## 📊 Monitoring

After deployment, monitor:
- Build logs for errors
- Runtime logs for detection errors
- Memory usage (free tier has 512MB limit)
- Response times for detection endpoint

## 🔄 Updates

To update after code changes:
- Push to GitHub
- Render will auto-deploy if `autoDeploy: true` is set
- Or manually trigger deployment from Render dashboard


