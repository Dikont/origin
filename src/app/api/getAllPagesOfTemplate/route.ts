import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API = process.env.API_BASE_URL!;

type Body = {
  DocGId?: string | number;
  docGId?: string | number;
  groupId?: string | number;
  id?: string | number;
};

export async function POST(req: Request) {
  try {
    // --- Auth ---
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    }

    // --- Input ---
    const body: Body = await req.json().catch(() => ({} as Body));
    const docGId =
      body?.DocGId ?? body?.docGId ?? body?.groupId ?? body?.id ?? null;

    if (!docGId) {
      return NextResponse.json(
        { error: "DocGId parametresi eksik" },
        { status: 400 }
      );
    }

    const call = async (paramName: "DocumentGrouId" | "DocumentGroupId") => {
      const url = `${API}/DocumentService/Analytics/getAllPagesOfTemplate?${paramName}=${encodeURIComponent(
        String(docGId)
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
      return { resp, payload };
    };

    let { resp, payload } = await call("DocumentGrouId");

    if (!resp.ok && (resp.status === 400 || resp.status === 404)) {
      ({ resp, payload } = await call("DocumentGroupId"));
    }

    if (!resp.ok) {
      return NextResponse.json(
        {
          error: "getAllPagesOfTemplate başarısız",
          status: resp.status,
          details: payload,
        },
        { status: resp.status }
      );
    }

    const out = payload?.result !== undefined ? payload.result : payload;
    return NextResponse.json(out, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "İşlem Hatası", details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
