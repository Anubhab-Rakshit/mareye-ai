import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp-service";
import { getUserCollection } from "@/dbCollections";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
function dbConfigError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  return msg.toLowerCase().includes("mongodb_uri is not set")
}

export async function POST(req: NextRequest) {
  try {
    const { email, otp, type = 'registration' } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ 
        message: "Email and OTP are required" 
      }, { status: 400 });
    }

    // Verify OTP
    const verificationResult = await verifyOTP(email, otp, type);
    
    if (!verificationResult.success) {
      return NextResponse.json({ 
        message: verificationResult.message 
      }, { status: 400 });
    }

    if (type === 'registration') {
      // Complete user registration
      const userData = verificationResult.userData;
      if (!userData) {
        return NextResponse.json({ 
          message: "User data not found" 
        }, { status: 400 });
      }

      const users = await getUserCollection();
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const newUser = await users.insertOne({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        dob: userData.dob || "",
        avatar: userData.avatar || "",
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create JWT token
      const token = jwt.sign(
        { 
          id: newUser.insertedId.toString(),
          email: userData.email 
        },
        JWT_SECRET,
        { expiresIn: "30d" } // 30 days
      );

      // Create response and set cookie
      const response = NextResponse.json({ 
        message: "Registration successful",
        success: true,
        user: {
          id: newUser.insertedId.toString(),
          email: userData.email,
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          dob: userData.dob || "",
          avatar: userData.avatar || "",
          isEmailVerified: true
        }
      }, { status: 201 });

      // Set the token as an HTTP-only cookie with extended expiration
      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
        expires: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000)
      });

      return response;
    }

    if (type === 'login') {
      // Complete login process
      const users = await getUserCollection();
      const user = await users.findOne({ email });
      
      if (!user) {
        return NextResponse.json({ 
          message: "User not found" 
        }, { status: 404 });
      }

      // Create JWT token with extended expiration
      const token = jwt.sign(
        { 
          id: user._id.toString(),
          email: user.email 
        },
        JWT_SECRET,
        { expiresIn: "30d" } // 30 days
      );

      // Create response and set cookie
      const response = NextResponse.json({ 
        message: "Login successful",
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName || user.username || "",
          lastName: user.lastName || "",
          dob: user.dob || "",
          avatar: user.avatar || "",
          isEmailVerified: user.isEmailVerified || false
        }
      }, { status: 200 });

      // Set the token as an HTTP-only cookie with extended expiration
      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
        expires: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000)
      });

      return response;
    }

    return NextResponse.json({ 
      message: "Invalid verification type" 
    }, { status: 400 });

  } catch (error) {
    console.error("Verify OTP error:", error);
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
