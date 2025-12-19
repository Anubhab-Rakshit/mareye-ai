import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	// Ultra-simplified middleware for deployment compatibility
	const pathname = request.nextUrl.pathname;
	
	// Only protect the root path - avoid complex operations
	// if (pathname === "/") {
	// 	const authToken = request.cookies.get("auth_token");
	// 	if (!authToken || !authToken.value) {
	// 		return NextResponse.redirect(new URL("/try", request.url));
	// 	}
	// }

	return NextResponse.next();
}

export const config = {
	matcher: [
		// Only match the root path to minimize middleware execution
		"/",
	],
};
