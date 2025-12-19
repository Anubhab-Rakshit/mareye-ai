import { NextRequest, NextResponse } from "next/server";
import { generateOTP, storeOTP } from "@/lib/otp-service";
import { sendOTPEmail } from "@/lib/email-service";
import { getUserCollection } from "@/dbCollections";

function dbConfigError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  return msg.toLowerCase().includes("mongodb_uri is not set")
}

export async function POST(req: NextRequest) {
  try {
    const { email, type = 'registration', userData } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Check if user already exists for registration
    if (type === 'registration') {
      const users = await getUserCollection();
      const existingUser = await users.findOne({ email });
      
      if (existingUser) {
        return NextResponse.json({ 
          message: "User already exists with this email" 
        }, { status: 400 });
      }
    }

    // Check if user exists for login
    if (type === 'login') {
      const users = await getUserCollection();
      const existingUser = await users.findOne({ email });
      
      if (!existingUser) {
        return NextResponse.json({ 
          message: "No account found with this email" 
        }, { status: 404 });
      }
    }

    // Generate and store OTP
    const otp = generateOTP();
    await storeOTP(email, otp, type, userData);

    // In development, log OTP to server console to help testing without SMTP
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] OTP for ${email}: ${otp}`)
    }

    // Send OTP email
    const emailResult = await sendOTPEmail(
      email, 
      otp, 
      userData?.firstName || userData?.username
    );

    if (!emailResult.success) {
      return NextResponse.json({ 
        message: "Failed to send OTP email" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "OTP sent successfully",
      success: true,
      ...(process.env.NODE_ENV !== "production" ? { devOtp: otp } : {}),
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    if (dbConfigError(error)) {
      return NextResponse.json(
        { message: "Database not configured. Set MONGODB_URI in .env.local (see ENVIRONMENT_SETUP.md)." },
        { status: 500 }
      )
    }
    return NextResponse.json({ 
      message: "Internal server error" 
    }, { status: 500 });
  }
}
