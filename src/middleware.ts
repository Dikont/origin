// src/middleware.ts
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const PUBLIC_ROUTES = [
  "checkSignature",
  "forgotPassword",
  "sifre-sifirla",
  "confirmationOfDocument",
];

function splitPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const maybeLocale = parts[0];
  const hasLocale = routing.locales.includes(maybeLocale as any);
  const locale = hasLocale ? maybeLocale : routing.defaultLocale;
  const pathWithoutLocale = hasLocale
    ? parts.slice(1).join("/")
    : parts.join("/");
  return { locale, pathWithoutLocale };
}

// Güvenli cookie parse (URL-encoded olabilir)
function safeParseCookie(value?: string) {
  if (!value) return null;
  try {
    const decoded = decodeURIComponent(value);
    return JSON.parse(decoded);
  } catch {
    try {
      // Bazı durumlarda zaten plain JSON olabilir
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
}

// Admin rol kontrolü (sadece 'Admin' aranıyor)
function hasAdminRole(parsedUser: any) {
  const roles: string[] =
    parsedUser?.userRoles ?? parsedUser?.user?.roles ?? [];
  return Array.isArray(roles) && roles.includes("Admin");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const { locale, pathWithoutLocale } = splitPath(pathname);

  const isStatic =
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.\w+$/.test(pathname); // dosya uzantılı istekler

  const isAuthPage = pathWithoutLocale === "login";
  const isPublicPage = PUBLIC_ROUTES.some((r) =>
    pathWithoutLocale.startsWith(r)
  );

  // ✅ Admin path tespiti (örn. /tr/admin, /en/admin/users vb.)
  const isAdminPath =
    pathWithoutLocale === "admin" || pathWithoutLocale.startsWith("admin/");

  // 1) Statik ve public sayfaları doğrudan geçir
  if (isStatic || isPublicPage) {
    return intlMiddleware(req);
  }

  // 2) Cookie'leri oku
  const token = req.cookies.get("token")?.value;
  const userRaw = req.cookies.get("user")?.value;

  // 3) Auth yoksa ve şu an login sayfasında DEĞİLSE → login'e yönlendir + cookie temizle
  if (!token || !userRaw) {
    if (!isAuthPage) {
      const res = NextResponse.redirect(new URL(`/${locale}/login`, req.url));
      res.cookies.set("token", "", { path: "/", expires: new Date(0) });
      res.cookies.set("user", "", { path: "/", expires: new Date(0) });
      return res;
    }
    // login sayfasındaysa içeri girsin
    return intlMiddleware(req);
  }

  // 4) Auth VAR ve login sayfasına gelmişse → dashboard'a gönder
  if (isAuthPage) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
  }

  // 5) ADMIN KORUMASI: Sadece Admin rolü olanlar /admin altını görebilsin
  if (isAdminPath) {
    const parsedUser = safeParseCookie(userRaw);
    if (!hasAdminRole(parsedUser)) {
      // Yetkisiz ise dashboard'a gönder (403 yerine UX açısından daha yumuşak)
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }
  }

  // 6) Normal akış
  return intlMiddleware(req);
}

export const config = {
  matcher: "/((?!api|trpc|_vercel|_next|.*\\..*).*)",
};
