// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";

function clearAuthCookies(res: NextResponse) {
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  };
  res.cookies.set("token", "", base);
  res.cookies.set("user", "", base);
}

function buildLogoutResponse(req: NextRequest) {
  const current = new URL(req.url);
  // ?next paramı varsa ona, yoksa locale-aware login'e dön
  const nextParam = current.searchParams.get("next");

  // Locale’yi çıkar (örn: /tr/dashboard gibi yollar için)
  // API route'ı locale dışındadır, bu yüzden referans için header/cookie kullanmak zor olur.
  // En sağlamı: next paramını server component'ten göndermek (öneri altta).
  const target = new URL(nextParam ?? "/login", current);

  const res = NextResponse.redirect(target, { status: 307 });
  clearAuthCookies(res);
  return res;
}

export async function GET(req: NextRequest) {
  return buildLogoutResponse(req);
}

export async function POST(req: NextRequest) {
  return buildLogoutResponse(req);
}
