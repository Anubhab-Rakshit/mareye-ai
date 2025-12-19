# MarEye

Next.js + Python ML toolkit for marine security (CNN enhancement + object detection) with built-in authentication.

## Quick start (auth working)

- Install deps:
  - `npm install --legacy-peer-deps`
- Create `.env.local`:
  - Follow `ENVIRONMENT_SETUP.md` (MongoDB is required for login/signup)
- Start:
  - `npm run dev`
- Open:
  - `http://localhost:3000`

## Auth routes

- Login: `/auth/login`
- Register (OTP): `/auth/register`
- Profile (after login): `/profile`