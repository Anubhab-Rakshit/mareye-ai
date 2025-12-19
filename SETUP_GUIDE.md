# 🚀 MarEye Setup Guide

## Quick Setup Instructions

### 1. Install Node.js Dependencies
\`\`\`bash
npm install --legacy-peer-deps
\`\`\`

### 2. Configure Environment Variables (Required for Auth)
Create a `.env.local` file. See `ENVIRONMENT_SETUP.md` for the exact values.

### 3. Start the Development Server
\`\`\`bash
npm run dev
\`\`\`

### 4. Open in Browser
Go to: http://localhost:3000

---

## 🔧 For ML Model Integration (Optional)

### Python Environment Setup
\`\`\`bash
# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Mac/Linux)
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
\`\`\`

### Environment Variables
Create `.env.local` file:
\`\`\`env
MONGODB_URI=mongodb://127.0.0.1:27017/mareye
JWT_SECRET=replace_with_a_long_random_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
EMAIL_DISABLE=true

# Optional AI keys
# GROK_API_KEY=your_api_key_here
\`\`\`

---

## 📱 Features Available

✅ **Working Features:**
- Beautiful marine-themed UI
- User authentication (login/register)
- Contact form
- User profile management
- Responsive design
- CNN and Detection page layouts

🔄 **Ready for Integration:**
- CNN image processing
- YOLO object detection
- Real-time analysis
- ML model endpoints

---

## 🆘 Troubleshooting

**Port already in use?**
\`\`\`bash
# Kill process on port 3000
npx kill-port 3000
# Then run again
npm run dev
\`\`\`

**Node modules issues?**
\`\`\`bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

**Python issues?**
\`\`\`bash
# Update pip
python -m pip install --upgrade pip
# Reinstall requirements
pip install -r requirements.txt --force-reinstall
\`\`\`

---

## 📞 Support

- Email: aochuba52@gmail.com
- Phone: 8900007125

**Happy coding! 🌊**
