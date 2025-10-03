import { NextResponse, NextRequest } from "next/server";

export function buildLogoutResponse(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";

  const res = NextResponse.redirect(url);

  res.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
    sameSite: "lax",
  });

  res.cookies.set("user", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
    sameSite: "lax",
  });

  return res;
}
