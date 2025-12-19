# Environment Setup (Auth / DB / Email)

This project uses **MongoDB** for login/signup and stores the session as an **HTTP-only `auth_token` cookie**.

## 1) Create `.env.local`

In the project root, create a file named `.env.local` with:

```
MONGODB_URI=mongodb://127.0.0.1:27017/mareye
JWT_SECRET=replace_with_a_long_random_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
EMAIL_DISABLE=true

# AI Chatbot (Groq)
GROQ_API_KEY=your_groq_api_key_here
# Optional model override (default is a fast/cheap model with fallbacks)
# GROQ_MODEL=llama-3.1-8b-instant
```

## 2) Optional: enable OTP emails (Gmail SMTP)

If you want OTP emails to be actually delivered (instead of only logged to the server console), set:

```
EMAIL_DISABLE=false
HOST_EMAIL=your_gmail@gmail.com
HOST_EMAIL_PASSWORD=your_gmail_app_password
```

Notes:
- For Gmail, you usually need an **App Password** (not your normal password).
- In dev, if SMTP isn’t configured, OTP sending will **still succeed** and the OTP will be logged.


