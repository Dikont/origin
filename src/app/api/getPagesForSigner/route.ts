import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { documentGroup, signerMail, signerCode, documentId } =
      await req.json();

    if (!documentGroup || !signerMail || !signerCode || !documentId) {
      return NextResponse.json(
        {
          error:
            "documentGroup, signerMail, signerCode ve documentId zorunludur",
        },
        { status: 400 }
      );
    }

    const apiUrl = `${
      process.env.API_BASE_URL
    }/DocumentService/Document/GetPagesForSigner?documentGroup=${encodeURIComponent(
      documentGroup
    )}&signerMail=${encodeURIComponent(
      signerMail
    )}&signerCode=${encodeURIComponent(
      signerCode
    )}&documentId=${encodeURIComponent(documentId)}`;

    const res = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Doğrulama kodu hatası", details: error.message },
      { status: 500 }
    );
  }
}
