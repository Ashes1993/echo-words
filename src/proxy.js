import { auth } from "./lib/auth.js";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthRoute =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register");
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/overview") ||
    req.nextUrl.pathname.startsWith("/play") ||
    req.nextUrl.pathname.startsWith("/profile");

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/overview", req.nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && isProtectedRoute) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  return null;
});

// Configure which paths the middleware runs on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
