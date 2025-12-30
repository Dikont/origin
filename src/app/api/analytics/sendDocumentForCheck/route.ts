import { useTranslations } from "next-intl";
import { NextResponse } from "next/server";

const API = process.env.API_BASE_URL!;

export async function POST(req: Request) {
  const t = useTranslations("confirmationOfDocument");

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        {
          isValid: false,
          message: "Geçerli bir JSON body bekleniyor",
          backendStatus: 400,
        },
        { status: 200 }
      );
    }

    const backendUrl = `${API}/DocumentService/Document/SendDocumentForCheck`;

    const resp = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify(body),
    });

    const text = await resp.text(); // log satırları

    const successRegex = /zaman\s*damgasi\s*gecerli.*dosya\s*degis(memis|miş)/i;
    const isMatch = resp.ok && successRegex.test(text);

    const lastInfo =
      text
        .split(/\r?\n/)
        .reverse()
        .find((l) => /\bINFO\b/i.test(l)) || "";
    const cleanMessage = isMatch
      ? t("validNotChanged")
      : lastInfo.replace(/^\[[^\]]+\]\s*/g, "").trim() ||
        t("notFoundOrInvalid");

    return NextResponse.json(
      {
        isValid: isMatch,
        message: cleanMessage,
        raw: text,
        backendStatus: resp.status,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        isValid: false,
        message: "İşlem hatası",
        error: err?.message ?? String(err),
        backendStatus: 500,
      },
      { status: 200 }
    );
  }
}
