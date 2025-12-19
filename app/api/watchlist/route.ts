import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getUserFromCookies, getUserFromAuthHeader } from "@/lib/auth";

type ItemType = "gene_sequence" | "image_recognition";

export async function GET(request: NextRequest) {
  try {
    const cookieUser = getUserFromCookies();
    const headerUser = getUserFromAuthHeader(request.headers.get("authorization"));
    const user = cookieUser || headerUser;
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const items = await db
      .collection("watchlist")
      .find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ items });
  } catch (error) {
    console.error("/api/watchlist GET error", error);
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieUser = getUserFromCookies();
    const headerUser = getUserFromAuthHeader(request.headers.get("authorization"));
    const user = cookieUser || headerUser;
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      itemType,
      referenceId,
      title,
      summary,
      dataPreview,
      score,
    }: {
      itemType: ItemType;
      referenceId?: string;
      title?: string;
      summary?: string;
      dataPreview?: string;
      score?: number;
    } = body || {};

    if (!itemType) {
      return NextResponse.json({ error: "itemType is required" }, { status: 400 });
    }

    const db = await getDatabase();
    const doc = {
      userId: user.id,
      itemType,
      referenceId: referenceId || null,
      title: title || null,
      summary: summary || null,
      dataPreview: dataPreview || null,
      score: typeof score === "number" ? score : null,
      createdAt: new Date(),
    };

    const result = await db.collection("watchlist").insertOne(doc as any);
    return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("/api/watchlist POST error", error);
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 });
  }
}
