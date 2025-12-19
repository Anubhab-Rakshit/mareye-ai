import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getUserFromCookies, getUserFromAuthHeader } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieUser = getUserFromCookies();
    const headerUser = getUserFromAuthHeader(request.headers.get("authorization"));
    const user = cookieUser || headerUser;
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const db = await getDatabase();
    const result = await db
      .collection("watchlist")
      .deleteOne({ _id: new ObjectId(id), userId: user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/watchlist/[id] DELETE error", error);
    return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 500 });
  }
}
