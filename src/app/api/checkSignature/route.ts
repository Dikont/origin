import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { mail, userName, DocumentId, isSms } = await req.json();

    if (!mail || !userName || !DocumentId) {
      return NextResponse.json(
        { error: "mail, userName ve DocumentId zorunludur" },
        { status: 400 }
      );
    }

    const apiUrl = `${
      process.env.API_BASE_URL
    }/DocumentService/Document/CheckSigner?mail=${encodeURIComponent(
      mail
    )}&isSms=${encodeURIComponent(isSms)}&userName=${encodeURIComponent(
      userName
    )}&DocumentId=${encodeURIComponent(DocumentId)}`;

    const res = await fetch(apiUrl, {
      method: "GET", // ✅ Swagger GET istiyor
      headers: {
        "Content-Type": "application/json",
        // Authorization gerekiyorsa ekle
      },
    });

    const raw = await res.text();
    if (raw == "Kullanıcı adı veya maili yanlış") {
      return NextResponse.json(
        { error: "Kullanıcı adı veya maili yanlış" },
        { status: 400 }
      );
    }
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("CheckSigner API hatası:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu", details: error.message },
      { status: 500 }
    );
  }
}
