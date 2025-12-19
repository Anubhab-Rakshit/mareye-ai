// dbCollections.ts
import type { Collection } from "mongodb";
import { getDatabase } from "@/lib/mongodb"; // uses the named export from lib/mongodb

export async function getUserCollection(): Promise<Collection> {
  const db = await getDatabase();
  return db.collection("users");
}

export async function getSessionsCollection(): Promise<Collection> {
  const db = await getDatabase();
  return db.collection("sessions");
}

/** convenience default export if you prefer */
export default {
  getUserCollection,
  getSessionsCollection,
};
