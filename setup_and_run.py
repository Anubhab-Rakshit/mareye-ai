#!/usr/bin/env python3
"""
Setup and Run Script for Threat Detection System
This script helps set up and run the complete threat detection system.
"""

import subprocess
import sys
import os
import time
import webbrowser
from pathlib import Path

def run_command(command, cwd=None, background=False):
    """Run a command and return the result"""
    try:
        if background:
            if os.name == 'nt':  # Windows
                subprocess.Popen(command, shell=True, cwd=cwd)
            else:  # Unix/Linux/Mac
                subprocess.Popen(command, shell=True, cwd=cwd, preexec_fn=os.setsid)
            return True
        else:
            result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
            return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_python_dependencies():
    """Check if Python dependencies are installed"""
    print("🔍 Checking Python dependencies...")
    try:
        import ultralytics
        import cv2
        import flask
        import torch
        print("✅ Python dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing Python dependency: {e}")
        print("📦 Installing Python dependencies...")
        success, stdout, stderr = run_command("pip install -r requirements.txt")
        if success:
            print("✅ Python dependencies installed successfully")
            return True
        else:
            print(f"❌ Failed to install Python dependencies: {stderr}")
            return False

def check_node_dependencies():
    """Check if Node.js dependencies are installed"""
    print("🔍 Checking Node.js dependencies...")
    if not os.path.exists("node_modules"):
        print("📦 Installing Node.js dependencies...")
        success, stdout, stderr = run_command("npm install")
        if success:
            print("✅ Node.js dependencies installed successfully")
            return True
        else:
            print(f"❌ Failed to install Node.js dependencies: {stderr}")
            return False
    else:
        print("✅ Node.js dependencies are installed")
        return True

def check_model_files():
    """Check if model files exist"""
    print("🔍 Checking model files...")
    model_files = ["best.pt", "best_backup.pt", "best_root.pt", "yolov8n.pt"]
    missing_files = []
    
    for model_file in model_files:
        if not os.path.exists(model_file):
            missing_files.append(model_file)
    
    if missing_files:
        print(f"⚠️  Missing model files: {missing_files}")
        print("📝 Note: The system will work with available model files")
    else:
        print("✅ All model files found")
    
    return True

def start_flask_server():
    """Start the Flask web API server"""
    print("🚀 Starting Flask web API server...")
    success = run_command("python web_integration_example.py", background=True)
    if success:
        print("✅ Flask server started on http://localhost:5000")
        time.sleep(2)  # Give server time to start
        return True
    else:
        print("❌ Failed to start Flask server")
        return False

def start_nextjs_server():
    """Start the Next.js development server"""
    print("🚀 Starting Next.js development server...")
    success = run_command("npm run dev", background=True)
    if success:
        print("✅ Next.js server started on http://localhost:3000")
        time.sleep(3)  # Give server time to start
        return True
    else:
        print("❌ Failed to start Next.js server")
        return False

def test_system():
    """Test the threat detection system"""
    print("🧪 Testing threat detection system...")
    
    # Test Python detector
    success, stdout, stderr = run_command("python -c \"from threat_detector import ThreatDetector; detector = ThreatDetector(); print('✅ Python detector working')\"")
    if success:
        print("✅ Python threat detector is working")
    else:
        print(f"❌ Python threat detector failed: {stderr}")
        return False
    
    # Test Flask API
    try:
        import requests
        response = requests.get("http://localhost:5000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Flask API is responding")
        else:
            print("❌ Flask API not responding")
            return False
    except Exception as e:
        print(f"❌ Flask API test failed: {e}")
        return False
    
    return True

def main():
    """Main setup and run function"""
    print("=" * 60)
    print("🚨 THREAT DETECTION SYSTEM SETUP")
    print("=" * 60)
    
    # Check dependencies
    if not check_python_dependencies():
        print("❌ Setup failed: Python dependencies not available")
        return False
    
    if not check_node_dependencies():
        print("❌ Setup failed: Node.js dependencies not available")
        return False
    
    check_model_files()
    
    print("\n" + "=" * 60)
    print("🚀 STARTING SERVERS")
    print("=" * 60)
    
    # Start servers
    flask_started = start_flask_server()
    nextjs_started = start_nextjs_server()
    
    if not flask_started or not nextjs_started:
        print("❌ Failed to start one or more servers")
        return False
    
    print("\n" + "=" * 60)
    print("🧪 TESTING SYSTEM")
    print("=" * 60)
    
    # Test system
    if test_system():
        print("\n" + "=" * 60)
        print("✅ SYSTEM READY!")
        print("=" * 60)
        print("🌐 Web Interface: http://localhost:3000")
        print("🔗 Flask API: http://localhost:5000")
        print("❤️  Health Check: http://localhost:5000/health")
        print("\n📝 Usage:")
        print("   • Upload images/videos through the web interface")
        print("   • Use the Flask API for programmatic access")
        print("   • Check the README.md for detailed documentation")
        
        # Try to open browser
        try:
            webbrowser.open("http://localhost:3000")
            print("\n🌐 Opening web interface in browser...")
        except:
            print("\n💡 Manually open http://localhost:3000 in your browser")
        
        return True
    else:
        print("❌ System test failed")
        return False

if __name__ == "__main__":
    try:
        success = main()
        if success:
            print("\n🎉 Setup completed successfully!")
            print("Press Ctrl+C to stop the servers")
            
            # Keep the script running to maintain servers
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n👋 Shutting down servers...")
                sys.exit(0)
        else:
            print("\n❌ Setup failed. Please check the errors above.")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 Setup interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
