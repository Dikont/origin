import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const cookieStore = cookies();

    // Gerekli alanlar kontrolü
    const {
      documentGroup,
      signerMail,
      signerName,
      signerCode,
      documentId,
      signatureBase64,
      metadataInfo,
    } = payload;
    if (
      !documentGroup ||
      !signerMail ||
      !signerName ||
      !signerCode ||
      !documentId
    ) {
      return NextResponse.json(
        {
          error:
            "Zorunlu alanlar eksik: documentGroup, signerMail, signerName, signerCode, documentId, signatureBase64",
        },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.API_BASE_URL}/DocumentService/Document/SignDocument`;

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text }; // JSON değilse raw text döndür
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "SignDocument başarısız", details: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("SignDocument API hatası:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu", details: error.message },
      { status: 500 }
    );
  }
}
