# Installing FFmpeg for Video Conversion

The application can automatically convert videos to H.264 codec for better browser compatibility if FFmpeg is installed.

## Windows Installation

### Option 1: Using Chocolatey (Recommended)
\`\`\`powershell
choco install ffmpeg
\`\`\`

### Option 2: Manual Installation
1. Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/
2. Download the "ffmpeg-release-essentials.zip"
3. Extract to `C:\ffmpeg`
4. Add `C:\ffmpeg\bin` to your System PATH:
   - Open System Properties → Environment Variables
   - Edit "Path" variable
   - Add new entry: `C:\ffmpeg\bin`
   - Click OK and restart your terminal

### Option 3: Using Winget
\`\`\`powershell
winget install ffmpeg
\`\`\`

## Verify Installation

After installation, verify by running:
\`\`\`powershell
ffmpeg -version
\`\`\`

You should see FFmpeg version information.

## Without FFmpeg

If FFmpeg is not installed, the application will still work but:
- Videos will use MPEG-4 (mp4v) codec
- Some browsers may not play videos inline
- Download functionality will still work
- You can manually convert videos using online tools

## Browser Compatibility

- **With H.264**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- **With MPEG-4 (mp4v)**: Limited browser support, download recommended
