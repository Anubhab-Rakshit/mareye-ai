# 🌊 MarEye - AI-Powered Marine Security Platform

<div align="center">

![MarEye Logo](https://img.shields.io/badge/MarEye-Marine%20Security-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Python](https://img.shields.io/badge/Python-3.11-green?style=for-the-badge&logo=python)
![MongoDB](https://img.shields.io/badge/MongoDB-6.19-green?style=for-the-badge&logo=mongodb)

**Advanced AI-powered platform for underwater image enhancement, real-time threat detection, and comprehensive marine security operations.**

[Features](#-key-features) • [Installation](#-installation--setup) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API Reference](#-api-reference)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation & Setup](#-installation--setup)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**MarEye** is a comprehensive, production-ready marine security platform that combines cutting-edge AI technologies to provide:

- **🔍 Real-time Underwater Image Enhancement** - Deep learning CNN models for restoring clarity and color in underwater imagery
- **🎯 AI-Powered Threat Detection** - YOLO v8-based object detection for submarines, mines, and marine threats
- **📊 Comprehensive Analytics** - Detailed metrics, visualizations, and quality assessments
- **🤖 AI Threat Intelligence** - Groq-powered analysis, predictions, and strategic recommendations
- **📡 Real-time Command Center** - Live threat monitoring, system health tracking, and interactive visualizations
- **🔐 Secure Authentication** - JWT-based auth with OTP verification and Google OAuth support
- **☁️ Cloud-Ready Deployment** - Optimized for edge devices (AUVs, ROVs, Jetson) and cloud platforms

Built for **maritime defense operations**, **marine research**, and **underwater surveillance** applications.

---

## ✨ Key Features

### 🖼️ **CNN Image & Video Enhancement**
- **Real-time Processing** - Instant underwater image enhancement using truncated U-Net architecture
- **Video Pipeline** - Complete video processing with frame-by-frame enhancement
- **Quality Metrics** - PSNR, SSIM, and UIQM evaluation for research-grade analysis
- **Edge Deployment** - ONNX and TensorRT optimization for AUVs, ROVs, and Jetson devices
- **Comprehensive Analytics** - Detailed reports with visualizations and quality dashboards

### 🎯 **AI Threat Detection**
- **YOLO v8 Integration** - State-of-the-art object detection for marine threats
- **Multi-Class Detection** - Submarines, mines, vessels, and underwater objects
- **Real-time Processing** - Live detection with instant results
- **Annotated Outputs** - Visual annotations with confidence scores
- **Detection History** - Persistent storage and retrieval of detection data

### 🤖 **AI Threat Intelligence**
- **Groq AI Integration** - Advanced natural language processing for threat analysis
- **Intelligent Analysis** - Automated threat pattern recognition and assessment
- **Predictive Intelligence** - Future threat predictions based on historical data
- **Strategic Recommendations** - AI-generated actionable insights
- **Interactive Q&A** - Natural language queries about threat data

### 📡 **Threat Command Center**
- **Live Monitoring** - Real-time threat alerts and system status
- **Interactive Threat Map** - Geographic visualization of detected threats
- **Activity Timeline** - Chronological threat detection history
- **Threat Heatmap** - Density visualization of threat patterns
- **System Health** - Real-time monitoring of CPU, memory, and network status
- **Animated Statistics** - Live counters and dynamic data visualization

### 🔐 **Authentication & Security**
- **JWT Authentication** - Secure token-based authentication (30-day sessions)
- **OTP Verification** - Email-based one-time password system
- **Google OAuth** - Social login integration
- **Protected Routes** - Middleware-based route protection
- **Session Management** - Secure HTTP-only cookies

### 📊 **Analytics & Reporting**
- **Image Quality Analysis** - Comprehensive metrics and visualizations
- **Detection Statistics** - Threat detection rates, trends, and patterns
- **Performance Metrics** - System performance and processing times
- **Export Capabilities** - PDF and JSON report generation
- **Historical Data** - Persistent storage and retrieval

### 🎨 **Modern UI/UX**
- **Responsive Design** - Mobile-first, fully responsive interface
- **Dark Theme** - Marine-themed dark UI with tactical aesthetics
- **Interactive Animations** - Smooth transitions and hover effects
- **Real-time Updates** - Live data updates without page refresh
- **Accessibility** - WCAG-compliant design patterns

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **Leaflet** - Interactive maps

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **Node.js** - Runtime environment
- **Python 3.11** - ML model execution
- **Flask** - Python API server (optional)

### **AI & Machine Learning**
- **PyTorch** - Deep learning framework
- **YOLO v8** - Object detection models
- **U-Net Architecture** - Image enhancement CNN
- **ONNX Runtime** - Model optimization
- **TensorRT** - Edge device acceleration
- **Groq AI** - Natural language processing

### **Database & Storage**
- **MongoDB** - User data and session storage
- **LocalStorage** - Client-side detection data
- **File System** - Image and video storage

### **Authentication**
- **JWT** - JSON Web Tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Google OAuth** - Social authentication

### **Deployment**
- **Docker** - Containerization
- **Render** - Cloud hosting
- **Vercel** - Edge deployment
- **AWS Lambda** - Serverless functions

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Next.js    │  │   React      │  │  Components  │      │
│  │   Frontend   │  │   Hooks      │  │   & UI       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js API Routes                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth API   │  │  Detection   │  │   CNN API    │      │
│  │   Routes     │  │   Routes     │  │   Routes     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Analytics   │  │  AI Threat   │  │  Command     │      │
│  │   Routes     │  │ Intelligence │  │  Center     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   MongoDB     │   │  Python ML   │   │   Groq AI    │
│   Database    │   │   Services   │   │   Service    │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │
        │                   ▼
        │          ┌──────────────┐
        │          │   PyTorch    │
        │          │   Models     │
        │          │  (YOLO/CNN)  │
        │          └──────────────┘
        │
        ▼
┌──────────────┐
│  File System │
│  (Images/    │
│   Videos)    │
└──────────────┘
```

---

## 🚀 Installation & Setup

### **Prerequisites**

- **Node.js** 18+ and npm
- **Python** 3.11+
- **MongoDB** (local or cloud instance)
- **Git**

### **Step 1: Clone Repository**

```bash
git clone https://github.com/Anubhab-Rakshit/mareye-ai.git
cd mareye-ai
```

### **Step 2: Install Dependencies**

```bash
# Install Node.js dependencies
npm install --legacy-peer-deps

# Install Python dependencies
pip install -r requirements.txt
pip install -r Deep_Sea-NN-main/requirements.txt
```

### **Step 3: Environment Configuration**

Create `.env.local` in the project root:

```env
# Database
MONGODB_URI=mongodb://127.0.0.1:27017/mareye

# Authentication
JWT_SECRET=your_long_random_secret_key_here_min_32_chars
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Email (Optional - for OTP)
EMAIL_DISABLE=true
# Or configure SMTP:
# EMAIL_DISABLE=false
# HOST_EMAIL=your_email@gmail.com
# HOST_EMAIL_PASSWORD=your_app_password

# AI Services
GROQ_API_KEY=your_groq_api_key_here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### **Step 4: Start MongoDB**

**Local MongoDB:**
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

**Or use MongoDB Atlas** (cloud) - update `MONGODB_URI` accordingly.

### **Step 5: Run Development Server**

```bash
# Start Next.js dev server
npm run dev

# In another terminal, start Python Flask server (optional)
npm run flask
```

### **Step 6: Access Application**

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎮 Quick Start

### **1. Authentication**

- **Register**: Navigate to `/auth/register`
- **Login**: Navigate to `/auth/login`
- **Profile**: Access `/profile` after login

### **2. Image Enhancement**

1. Navigate to `/cnn`
2. Upload an underwater image
3. Click "Enhance Image"
4. View enhanced result with quality metrics

### **3. Threat Detection**

1. Navigate to `/detection`
2. Upload an image or video
3. View detected objects with bounding boxes
4. Check detection history and statistics

### **4. Command Center**

1. Navigate to `/command-center`
2. View real-time threat monitoring
3. Explore interactive threat map
4. Monitor system health and statistics

### **5. AI Threat Intelligence**

1. Navigate to `/command-center`
2. Scroll to "AI Threat Intelligence" section
3. Get AI-powered analysis and recommendations
4. Ask questions about threat data

---

## 📚 Documentation

### **Core Modules**

#### **CNN Enhancement**
- **Location**: `Deep_Sea-NN-main/`
- **Documentation**: See `Deep_Sea-NN-main/README.md`
- **Key Files**:
  - `enhanced_inference.py` - Image enhancement
  - `run_video_enhancement.py` - Video processing
  - `run_analytics.py` - Quality analysis

#### **Threat Detection**
- **Location**: `detection/`
- **Model**: YOLO v8 (`best.pt`, `yolov8n.pt`)
- **Key Files**:
  - `threat_detector.py` - Detection engine
  - `app/api/detection/process/route.ts` - API endpoint

#### **AI Threat Intelligence**
- **Location**: `components/ai-threat-intelligence.tsx`
- **API**: `app/api/ai/threat-intelligence/route.ts`
- **Features**: Analysis, recommendations, predictions, Q&A

#### **Command Center**
- **Location**: `components/threat-command-center.tsx`
- **Features**: Live monitoring, threat map, activity timeline, heatmap

### **Additional Documentation**

- **Environment Setup**: See `ENVIRONMENT_SETUP.md`
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`
- **Setup Guide**: See `SETUP_GUIDE.md`
- **Detection Results**: See `DETECTION_TEST_RESULTS.md`

---

## 🔌 API Reference

### **Authentication Endpoints**

#### `POST /api/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```

#### `POST /api/login`
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### `POST /api/verify-otp`
Verify OTP for registration/login.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "type": "register"
}
```

#### `GET /api/profile`
Get user profile (requires authentication).

#### `POST /api/logout`
Logout user and clear session.

### **Detection Endpoints**

#### `POST /api/detection/process`
Process image/video for threat detection.

**Request Body:**
```json
{
  "image": "base64_encoded_image",
  "type": "image"
}
```

**Response:**
```json
{
  "detections": [...],
  "annotatedImage": "base64_encoded_image",
  "statistics": {...}
}
```

### **CNN Enhancement Endpoints**

#### `POST /api/cnn/process`
Enhance underwater image using CNN.

**Request Body:**
```json
{
  "image": "base64_encoded_image"
}
```

**Response:**
```json
{
  "enhancedImage": "base64_encoded_image",
  "metrics": {
    "psnr": 25.5,
    "ssim": 0.85,
    "uiqm": 3.2
  }
}
```

### **AI Threat Intelligence Endpoints**

#### `POST /api/ai/threat-intelligence`
Get AI-powered threat analysis.

**Request Body:**
```json
{
  "type": "analysis",
  "query": "What are the main threats detected?"
}
```

**Types**: `analysis`, `recommendations`, `prediction`, `query`

**Response:**
```json
{
  "response": "AI-generated analysis text",
  "type": "analysis"
}
```

### **Analytics Endpoints**

#### `GET /api/analytics`
Get all analytics reports.

#### `GET /api/analytics/[analysisName]`
Get specific analytics report.

### **Command Center Endpoints**

#### `GET /api/history`
Get detection history.

#### `GET /api/health`
Health check endpoint.

---

## 📁 Project Structure

```
mareye-ai/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── ai/                   # AI endpoints
│   │   ├── auth/                 # Authentication
│   │   ├── cnn/                  # CNN enhancement
│   │   ├── detection/            # Threat detection
│   │   └── analytics/            # Analytics
│   ├── auth/                     # Auth pages
│   ├── cnn/                      # CNN page
│   ├── detection/                # Detection page
│   ├── command-center/           # Command center
│   ├── profile/                  # User profile
│   └── page.tsx                  # Home page
│
├── components/                   # React components
│   ├── ai-threat-intelligence.tsx
│   ├── threat-command-center.tsx
│   ├── cnn-enhancement-view.tsx
│   ├── detection-view.tsx
│   ├── home-page-enhanced.tsx
│   └── ui/                       # UI components
│
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Auth utilities
│   ├── groq-client.ts            # Groq AI client
│   ├── mongodb.ts                # Database connection
│   └── detection-storage.ts      # Detection storage
│
├── hooks/                        # React hooks
│   └── use-auth.ts               # Auth hook
│
├── Deep_Sea-NN-main/             # CNN enhancement module
│   ├── model.py                  # U-Net architecture
│   ├── enhanced_inference.py     # Image enhancement
│   ├── run_video_enhancement.py  # Video processing
│   ├── run_analytics.py          # Analytics
│   ├── onnx_models/              # ONNX models
│   └── snapshots/                # Training snapshots
│
├── detection/                    # Threat detection
│   ├── threat_detector.py       # Detection engine
│   └── best.pt                   # YOLO model
│
├── public/                       # Static assets
│   └── deep-sea-images/         # Sample images
│
├── styles/                       # Global styles
│   └── globals.css
│
├── .env.local                    # Environment variables (create this)
├── package.json                  # Node.js dependencies
├── requirements.txt              # Python dependencies
└── README.md                     # This file
```

---

## 🚢 Deployment

### **Render Deployment**

1. Connect GitHub repository to Render
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add environment variables in Render dashboard
5. Deploy!

See `RENDER_DEPLOYMENT_CHECKLIST.md` for detailed steps.

### **Vercel Deployment**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### **Docker Deployment**

```bash
# Build image
docker build -t mareye .

# Run container
docker run -p 3000:3000 mareye
```

### **Edge Device Deployment**

See `Deep_Sea-NN-main/README.md` for:
- ONNX export
- TensorRT optimization
- Jetson deployment
- AUV/ROV integration

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Development Guidelines**

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **EUVP Dataset** - University of Minnesota for underwater image dataset
- **YOLO v8** - Ultralytics for object detection models
- **Groq AI** - For natural language processing capabilities
- **Next.js Team** - For the amazing framework
- **Open Source Community** - For incredible tools and libraries

---

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/Anubhab-Rakshit/mareye-ai/issues)
- **Documentation**: See individual module READMEs
- **Email**: Contact through GitHub profile

---

## 🎯 Roadmap

- [ ] Real-time video streaming support
- [ ] Multi-user collaboration features
- [ ] Advanced threat classification
- [ ] Mobile app (React Native)
- [ ] Edge device SDK
- [ ] Cloud-native deployment templates
- [ ] Enhanced AI models
- [ ] Internationalization (i18n)

---

<div align="center">

**Built with ❤️ for Marine Security**

[⭐ Star this repo](https://github.com/Anubhab-Rakshit/mareye-ai) • [🐛 Report Bug](https://github.com/Anubhab-Rakshit/mareye-ai/issues) • [💡 Request Feature](https://github.com/Anubhab-Rakshit/mareye-ai/issues)

</div>
