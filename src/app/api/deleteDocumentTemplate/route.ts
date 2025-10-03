import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API = process.env.API_BASE_URL!; // https://cloudservices.dikontapp.com

export async function DELETE(req: Request) {
  return handleDelete(req);
}
export async function POST(req: Request) {
  return handleDelete(req);
}

async function handleDelete(req: Request) {
  try {
    const cookieStore = cookies();
    const tokenValue = (await cookieStore).get("token")?.value;
    if (!tokenValue)
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });

    // docGId hem query'den hem body'den okunabilir
    const url = new URL(req.url);
    let docGId = url.searchParams.get("docGId");
    if (!docGId) {
      try {
        const b = await req.json();
        if (b?.docGId != null) docGId = String(b.docGId);
      } catch {
        /* body yok → sorun değil */
      }
    }
    if (!docGId || !String(docGId).trim()) {
      return NextResponse.json({ error: "docGId gerekli" }, { status: 400 });
    }

    const backendUrl = `${API}/DocumentService/Document/DeleteDocumentTemplate?docGId=${encodeURIComponent(
      docGId
    )}`;

    // 1. Tercihen DELETE
    let res = await fetch(backendUrl, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenValue}` },
      cache: "no-store",
    });

    // 2. Bazı ortamlarda DELETE kapalı olabilir → 405 gelirse GET’e düş
    if (res.status === 405) {
      res = await fetch(backendUrl, {
        method: "GET",
        headers: { Authorization: `Bearer ${tokenValue}` },
        cache: "no-store",
      });
    }

    const ctype = res.headers.get("content-type") || "";

    if (res.ok) {
      if (ctype.includes("application/json")) {
        const payload = await res.json().catch(() => ({}));
        return NextResponse.json({ success: true, ...payload });
      } else {
        const text = (await res.text()).trim(); // genelde "" ya da "Success"
        return NextResponse.json({ success: true, message: text || "Success" });
      }
    }

    let details: any = await res.text();
    try {
      details = JSON.parse(details);
    } catch {}
    return NextResponse.json(
      { error: "DeleteDocumentTemplate başarısız", details },
      { status: res.status }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Silme Hatası", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
