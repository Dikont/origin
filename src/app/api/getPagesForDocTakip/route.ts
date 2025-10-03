import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API = process.env.API_BASE_URL!;

type Body = {
  documentGroup?: string | number;
  docGId?: string | number;
  groupId?: string | number;
  id?: string | number;
};

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    }

    const body: Body = await req.json().catch(() => ({} as Body));
    const documentGroup =
      body.documentGroup ?? body.docGId ?? body.groupId ?? body.id ?? null;

    if (!documentGroup) {
      return NextResponse.json(
        { error: "documentGroup parametresi eksik" },
        { status: 400 }
      );
    }

    const url = `${API}/DocumentService/Document/GetPagesForDocTakip?documentGroup=${encodeURIComponent(
      String(documentGroup)
    )}`;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const raw = await resp.text();
    let payload: any;
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = raw;
    }

    if (!resp.ok) {
      return NextResponse.json(
        { error: "GetPagesForDocTakip başarısız", details: payload },
        { status: resp.status }
      );
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "İşlem Hatası", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
