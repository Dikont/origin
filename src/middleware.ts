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
  "uploadedDocument",
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

// Güvenli cookie parse
function safeParseCookie(value?: string) {
  if (!value) return null;
  try {
    const decoded = decodeURIComponent(value);
    return JSON.parse(decoded);
  } catch {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
}

// YENİ: Rolleri dizi olarak döndüren yardımcı fonksiyon
function getUserRoles(parsedUser: any): string[] {
  const roles = parsedUser?.userRoles ?? parsedUser?.user?.roles ?? [];
  return Array.isArray(roles) ? roles : [];
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const { locale, pathWithoutLocale } = splitPath(pathname);

  const isStatic =
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.\w+$/.test(pathname);

  const isAuthPage = pathWithoutLocale === "login";
  const isPublicPage = PUBLIC_ROUTES.some((r) =>
    pathWithoutLocale.startsWith(r),
  );

  // Path tanımları
  const isAdminPath =
    pathWithoutLocale === "admin" || pathWithoutLocale.startsWith("admin/");

  //  YENİ: Company Profile path tespiti
  const isCompanyProfilePath =
    pathWithoutLocale === "companyProfile" ||
    pathWithoutLocale.startsWith("companyProfile/");

  // 1) Statik ve public sayfaları doğrudan geçir
  if (isStatic || isPublicPage) {
    return intlMiddleware(req);
  }

  // 2) Cookie'leri oku
  const token = req.cookies.get("token")?.value;
  const userRaw = req.cookies.get("user")?.value;

  // 3) Auth yoksa -> Login'e
  if (!token || !userRaw) {
    if (!isAuthPage) {
      const res = NextResponse.redirect(new URL(`/${locale}/login`, req.url));
      res.cookies.set("token", "", { path: "/", expires: new Date(0) });
      res.cookies.set("user", "", { path: "/", expires: new Date(0) });
      return res;
    }
    return intlMiddleware(req);
  }

  // 4) Auth VAR ve login sayfasına gelmişse -> Dashboard'a
  if (isAuthPage) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
  }

  // Kullanıcı verisini parse et (Aşağıdaki kontroller için gerekli)
  const parsedUser = safeParseCookie(userRaw);
  const roles = getUserRoles(parsedUser);

  // 5) ADMIN KORUMASI: Sadece 'Admin' rolü olanlar
  if (isAdminPath) {
    if (!roles.includes("Admin")) {
      // Yetkisiz ise dashboard'a gönder
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }
  }

  // 6) ✅ YENİ: COMPANY PROFILE KORUMASI
  // Sadece 'Admin' VEYA 'CompanySuperUser' rolü olanlar görebilsin
  if (isCompanyProfilePath) {
    const hasAccess =
      roles.includes("Admin") || roles.includes("CompanySuperUser");

    if (!hasAccess) {
      // Yetkisi yoksa LOGIN yerine DASHBOARD'a yönlendir
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }
  }

  // 7) Normal akış
  return intlMiddleware(req);
}

export const config = {
  matcher: "/((?!api|trpc|_vercel|_next|.*\\..*).*)",
};
