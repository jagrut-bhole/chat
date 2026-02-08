import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = req.nextUrl;

    const authRoutes = ["/", "/signin", "/signup", "/logout"];

    const isAuthRoute =
      authRoutes.includes(pathname) ||
      pathname.startsWith("/signin") ||
      pathname.startsWith("/signup");

    const protectedRoutes = ["/dashboard", "/profile"];

    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

    if (token && isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (!token && isProtectedRoute) {
      const loginUrl = new URL("/signin", req.url);

      loginUrl.searchParams.set("redirectTo", pathname);

      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Error in proxy middleware:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/", "/signin", "/signup", "/logout", "/dashboard/:path*", "/profile"],
};
