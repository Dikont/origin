import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL!;
const PDF_KEY = process.env.PUBLIC_PDF_API_KEY!;

export async function GET(req: NextRequest) {
  try {
    const docGId = req.nextUrl.searchParams.get("docGId");
    if (!docGId) {
      return NextResponse.json({ message: "docGId zorunlu." }, { status: 400 });
    }

    const backendUrl = `${API_BASE}/DocumentService/DocumentSecondary/GetDownloadAblePdf?docGId=${docGId}`;

    const response = await fetch(backendUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        "x-api-key": PDF_KEY, // BURASI
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return NextResponse.json(
        {
          message: "Backend PDF alınamadı.",
          status: response.status,
          backendText: text,
        },
        { status: response.status },
      );
    }

    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
