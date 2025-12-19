import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getUserFromCookies, getUserFromAuthHeader } from "@/lib/auth";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieUser = getUserFromCookies();
    const headerUser = getUserFromAuthHeader(request.headers.get("authorization"));
    const user = cookieUser || headerUser;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();

    const [analyses, geneSequences] = await Promise.all([
      db
        .collection("aiAnalyses")
        .find({ userId: user.id })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray(),
      db
        .collection("geneSequences")
        .find({ userId: user.id })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray(),
    ]);

    return NextResponse.json({ analyses, geneSequences });
  } catch (error) {
    console.error("/api/history error", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
