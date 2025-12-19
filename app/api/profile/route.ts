import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserCollection } from "@/dbCollections";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

function dbConfigError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  return msg.toLowerCase().includes("mongodb_uri is not set")
}

export async function GET(req: Request) {
  try {
    console.log("Profile API called");

    // Extract token from cookies (Next.js helper handles parsing correctly)
    const token = cookies().get("auth_token")?.value;
    console.log("Extracted token:", token ? "Present" : "Missing");
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication token not found",
        debug: "auth_token cookie missing"
      }, { status: 401 });
    }

    // Check if JWT_SECRET is available
    const jwtSecret = process.env.JWT_SECRET || "supersecret";
    
    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
      // console.log("JWT decoded successfully, user ID:", decoded.id);
    } catch (jwtError: any) {
      console.error("JWT verification failed:", jwtError.message);
      
      // If token is expired, provide helpful message
      if (jwtError.name === 'TokenExpiredError') {
        return NextResponse.json({ 
          success: false, 
          error: "Your session has expired. Please log in again.",
          debug: `Token expired at: ${jwtError.expiredAt}`
        }, { status: 401 });
      }
      
      return NextResponse.json({ 
        success: false, 
        error: "Invalid authentication token. Please log in again.",
        debug: `JWT Error: ${jwtError.message}`
      }, { status: 401 });
    }

    // Validate decoded token structure
    if (!decoded || !decoded.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid token structure",
        debug: "Token does not contain user ID"
      }, { status: 401 });
    }

    // Find user in database using the same method as login
    const users = await getUserCollection();
    const user = await users.findOne({ _id: new ObjectId(decoded.id) });
    
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      return NextResponse.json({
        success: false, 
        error: "User not found",
        debug: `User ID ${decoded.id} not found in database`
      }, { status: 404 });
    }

    console.log("Profile retrieved successfully for user:", user.email);
    return NextResponse.json({ 
      success: true, 
      user: {
        firstName: user.firstName || user.username || "", // Handle both schemas
        lastName: user.lastName || "",
        email: user.email,
        dob: user.dob,
        avatar: user.avatar,
        subscription: user.subscription || {
          plan: 'basic',
          status: 'active'
        },
        tokens: user.tokens || {
          dailyLimit: 10,
          usedToday: 0,
          lastResetDate: new Date(),
          totalUsed: 0
        }
      }
    });
    
  } catch (err: any) {
    console.error("Profile API Error:", err);
    console.error("Error stack:", err.stack);

    if (dbConfigError(err)) {
      return NextResponse.json(
        { success: false, error: "Database not configured. Set MONGODB_URI in .env.local (see ENVIRONMENT_SETUP.md)." },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error",
      debug: err.message
    }, { status: 500 });
  }
}
