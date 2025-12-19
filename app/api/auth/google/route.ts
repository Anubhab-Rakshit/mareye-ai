import { NextResponse } from "next/server";
import { getGoogleAuthorizationUrl } from "@/lib/google-oauth";

export async function GET() {
  try {
    const url = getGoogleAuthorizationUrl();
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Google OAuth start error:", error);
    return NextResponse.json({ message: "Failed to start Google OAuth" }, { status: 500 });
  }
}
