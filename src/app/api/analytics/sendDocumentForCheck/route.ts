import { NextResponse } from "next/server";

const API = process.env.API_BASE_URL!;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        {
          isValid: false,
          messageKey: "Geçerli bir JSON body bekleniyor",
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

    const cleanMessage = isMatch
      ? "confirmationOfDocument.validNotChanged"
      : "confirmationOfDocument.notFoundOrInvalid";

    return NextResponse.json(
      {
        isValid: isMatch,
        messageKey: cleanMessage,
        raw: text,
        backendStatus: resp.status,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        isValid: false,
        messageKey: "İşlem hatası",
        error: err?.message ?? String(err),
        backendStatus: 500,
      },
      { status: 200 }
    );
  }
}
