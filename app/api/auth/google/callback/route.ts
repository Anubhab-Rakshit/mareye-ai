import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getUserCollection } from "@/dbCollections";
import { exchangeCodeForTokens, fetchGoogleUserProfile } from "@/lib/google-oauth";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`/auth/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`/auth/login?error=${encodeURIComponent("Missing code")}`);
  }

  try {
    const tokenResponse = await exchangeCodeForTokens(code);
    const profile = await fetchGoogleUserProfile(tokenResponse.access_token);

    const users = await getUserCollection();
    const email = profile.email?.toLowerCase();
    const googleId = profile.sub;

    if (!email) {
      return NextResponse.redirect(`/auth/login?error=${encodeURIComponent("Email not available from Google")}`);
    }

    const updateDoc = {
      $setOnInsert: {
        username: profile.name || email.split("@")[0],
        createdAt: new Date(),
      },
      $set: {
        email,
        firstName: profile.given_name || "",
        lastName: profile.family_name || "",
        avatar: profile.picture || "",
        googleId,
        emailVerified: Boolean(profile.email_verified),
        updatedAt: new Date(),
      },
    };

    const result = await users.findOneAndUpdate(
      { $or: [{ email }, { googleId }] },
      updateDoc,
      { upsert: true, returnDocument: "after" }
    );

    const user = result?.value || (await users.findOne({ email }))!;

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.redirect("/");
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (e) {
    console.error("Google OAuth callback error:", e);
    return NextResponse.redirect(`/auth/login?error=${encodeURIComponent("Google sign-in failed")}`);
  }
}
