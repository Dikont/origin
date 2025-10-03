import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API = process.env.API_BASE_URL!; // https://cloudservices.dikontapp.com

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const docGId =
      body?.docGId ?? body?.DocGId ?? body?.groupId ?? body?.id ?? null;

    if (!docGId) {
      return NextResponse.json(
        { error: "docGId parametresi eksik" },
        { status: 400 }
      );
    }

    const url = `${API}/DocumentService/Document/GetSignedPdf?docGId=${encodeURIComponent(
      String(docGId)
    )}`;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: "GetSignedPdf başarısız", details: text },
        { status: resp.status }
      );
    }

    // PDF binary response
    const buffer = Buffer.from(await resp.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="signed-${docGId}.pdf"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "İşlem Hatası", details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
