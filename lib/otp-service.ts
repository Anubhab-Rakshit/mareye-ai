import crypto from "crypto";
import type { Collection } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

export interface OTPData {
  otp: string;
  email: string;
  expiresAt: Date;
  attempts: number;
  type: 'registration' | 'login';
  userData?: any;
}

// Fallback in-memory storage (used only when DB isn't available)
const otpStorage = new Map<string, OTPData>();
const otpKey = (email: string, type: "registration" | "login") => `${type}:${email}` as const;

type OTPRecord = {
  email: string;
  type: "registration" | "login";
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  userData?: any;
  createdAt: Date;
  updatedAt: Date;
};

async function getOtpCollection(): Promise<Collection<OTPRecord>> {
  const db = await getDatabase();
  const col = db.collection<OTPRecord>("otps");

  // Ensure TTL index once per process.
  const g = globalThis as any;
  if (!g.__mareyeOtpIndexesEnsured) {
    g.__mareyeOtpIndexesEnsured = true;
    // Expire documents automatically when `expiresAt` is reached.
    // `expireAfterSeconds: 0` means expire exactly at the timestamp.
    await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await col.createIndex({ email: 1, type: 1 }, { unique: true });
  }

  return col;
}

function hashOTP(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function storeOTP(
  email: string,
  otp: string,
  type: "registration" | "login",
  userData?: any
): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    const col = await getOtpCollection();
    const now = new Date();
    await col.updateOne(
      { email, type },
      {
        $set: {
          email,
          type,
          otpHash: hashOTP(otp),
          expiresAt,
          attempts: 0,
          userData,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
  } catch (e) {
    // DB not available (or failed). Fall back to in-memory.
    otpStorage.set(otpKey(email, type), {
    otp,
    email,
    expiresAt,
    attempts: 0,
    type,
    userData,
  });
  cleanupExpiredOTPs();
}
}

export async function verifyOTP(
  email: string,
  inputOTP: string,
  type?: "registration" | "login"
): Promise<{ success: boolean; message: string; userData?: any }> {
  // Prefer DB-backed OTPs when possible
  try {
    const col = await getOtpCollection();
    const query = type ? { email, type } : ({ email } as any);
    const record = await col.findOne(query);

    if (!record) {
      return { success: false, message: "OTP not found or expired" };
    }

    if (new Date() > new Date(record.expiresAt)) {
      await col.deleteOne({ email: record.email, type: record.type });
      return { success: false, message: "OTP has expired" };
    }

    if ((record.attempts ?? 0) >= 3) {
      await col.deleteOne({ email: record.email, type: record.type });
      return { success: false, message: "Too many failed attempts. Please request a new OTP" };
    }

    if (record.otpHash !== hashOTP(inputOTP)) {
      await col.updateOne(
        { email: record.email, type: record.type },
        { $inc: { attempts: 1 }, $set: { updatedAt: new Date() } }
      );
      return { success: false, message: "Invalid OTP" };
    }

    const userData = record.userData;
    await col.deleteOne({ email: record.email, type: record.type });
    return { success: true, message: "OTP verified successfully", userData };
  } catch (_) {
    // fall back to in-memory below
  }

  // In-memory fallback
  const storedOTP = otpStorage.get(type ? otpKey(email, type) : otpKey(email, "registration")) ?? otpStorage.get(type ? otpKey(email, type) : otpKey(email, "login"));
  
  if (!storedOTP) {
    return { success: false, message: "OTP not found or expired" };
  }
  
  if (new Date() > storedOTP.expiresAt) {
    otpStorage.delete(otpKey(storedOTP.email, storedOTP.type));
    return { success: false, message: "OTP has expired" };
  }
  
  if (storedOTP.attempts >= 3) {
    otpStorage.delete(otpKey(storedOTP.email, storedOTP.type));
    return { success: false, message: "Too many failed attempts. Please request a new OTP" };
  }
  
  if (storedOTP.otp !== inputOTP) {
    storedOTP.attempts += 1;
    return { success: false, message: "Invalid OTP" };
  }
  const userData = storedOTP.userData;
  otpStorage.delete(otpKey(storedOTP.email, storedOTP.type));
  
  return { success: true, message: "OTP verified successfully", userData };
}

export function getOTPData(email: string): OTPData | null {
  // kept for backwards-compatibility
  return otpStorage.get(otpKey(email, "registration")) || otpStorage.get(otpKey(email, "login")) || null;
}

export async function deleteOTP(email: string, type?: "registration" | "login"): Promise<void> {
  try {
    const col = await getOtpCollection();
    if (type) {
      await col.deleteOne({ email, type });
    } else {
      await col.deleteMany({ email } as any);
    }
  } catch (_) {
    if (type) {
      otpStorage.delete(otpKey(email, type));
    } else {
      otpStorage.delete(otpKey(email, "registration"));
      otpStorage.delete(otpKey(email, "login"));
    }
  }
}

function cleanupExpiredOTPs(): void {
  const now = new Date();
  for (const [email, { expiresAt }] of otpStorage.entries()) {
    if (now > expiresAt) {
      otpStorage.delete(email);
    }
  }
}

setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);
