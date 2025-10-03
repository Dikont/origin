import MainLayout from "@/component/mainLayout";
import ThemeRegistry from "@/component/ThemeRegistry";
import { Providers } from "@/store/provider";
import { cookies } from "next/headers";
import { ReactNode, Suspense } from "react";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound, redirect } from "next/navigation";
import ReactQueryClientProvider from "@/component/ReactQueryClientProvider";
import { SnackbarProvider } from "@/component/SnackbarProvider";
import NextTopLoader from "nextjs-toploader";
import { getMessages } from "next-intl/server";
export const metadata = {
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const messages = (await getMessages()) as any;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userCookie = cookieStore.get("user");
  const user = userCookie
    ? JSON.parse(decodeURIComponent(userCookie.value)).user
    : null;
  const userRole = userCookie
    ? JSON.parse(userCookie.value).userRoles[1]
    : null;
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body style={{ margin: 0 }}>
        <NextTopLoader
          showSpinner={false}
          color="#227A2F"
          height={4}
          crawlSpeed={20}
          initialPosition={0.3}
          shadow="0 0 10px rgba(0, 0, 0, 0.2)"
        />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <MainLayout token={token} user={user} userRole={userRole}>
              <ReactQueryClientProvider>
                <SnackbarProvider>{children}</SnackbarProvider>
              </ReactQueryClientProvider>
            </MainLayout>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
