"use client";
import { useState } from "react";
import Image from "next/image";

export function GoogleSignInButton({ label = "Continue with Google" }: { label?: string }) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    try {
      setLoading(true);
      window.location.href = "/api/auth/google";
    } finally {
      // no-op
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 disabled:opacity-60"
    >
      <Image src="https://developers.google.com/identity/images/g-logo.png" alt="Google" width={16} height={16} />
      {loading ? "Redirecting..." : label}
    </button>
  );
}
