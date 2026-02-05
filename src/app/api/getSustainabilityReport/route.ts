import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.API_BASE_URL!;

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("token")?.value ??
      req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    }

    const url = `${API}/SustainabilityService/Sustainability/GetReport`;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
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
        { error: "GetReport başarısız", details: payload },
        { status: resp.status },
      );
    }

    const out = payload?.result !== undefined ? payload.result : payload;
    return NextResponse.json(out, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "İşlem Hatası", details: error?.message ?? String(error) },
      { status: 500 },
    );
  }
}
