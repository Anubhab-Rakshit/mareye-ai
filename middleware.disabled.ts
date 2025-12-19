// Disabled middleware for deployment compatibility
// If you need to disable middleware completely, rename this file to middleware.ts
// and delete the original middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	// Completely disabled - just pass through all requests
	return NextResponse.next();
}

export const config = {
	matcher: [],
};
