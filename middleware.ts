import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const authCookie = request.cookies.get("auth");
    const insuranceCookie = request.cookies.get("insurance");
    const { pathname } = request.nextUrl;

    // Always allow access to the auth page
    if (pathname === "/auth") {
        return NextResponse.next();
    }

    // Check for authentication
    if (!authCookie && !insuranceCookie) {
        const redirectUrl = new URL("/auth", request.url);
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
    }

    if (insuranceCookie && pathname !== "/insurance") {
        return NextResponse.redirect(new URL("/insurance", request.url));
    }

    // Redirect root to home
    if (pathname === "/") {
        return NextResponse.redirect(new URL("/home", request.url));
    }

    // If authenticated, allow access to all other pages
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
