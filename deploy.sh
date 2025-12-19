#!/bin/bash

# Deployment script for Oceanova SIH
echo "🚀 Starting deployment preparation..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if model files exist
echo "📁 Checking for model files..."
if [ -f "best (1).pt" ]; then
    echo "✅ Found best (1).pt"
else
    echo "⚠️  Warning: best (1).pt not found"
fi

if [ -f "best.pt" ]; then
    echo "✅ Found best.pt"
else
    echo "⚠️  Warning: best.pt not found"
fi

if [ -f "yolov8n.pt" ]; then
    echo "✅ Found yolov8n.pt"
else
    echo "⚠️  Warning: yolov8n.pt not found"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Check build output
if [ -d ".next" ]; then
    echo "✅ Build output found"
else
    echo "❌ Build output not found"
    exit 1
fi

echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Commit and push your changes to GitHub"
echo "2. Connect your repository to Render"
echo "3. Deploy using the render.yaml configuration"
echo ""
echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"
