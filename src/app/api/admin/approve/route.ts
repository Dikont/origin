import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const API = process.env.API_BASE_URL!;

async function parseUpstream(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text ? { message: text } : {};
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("token")?.value ??
      req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");

    if (!token)
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });

    // Swagger approve body’siz (opsiyonel note destekliyorsa geçebilirsin)
    const maybeBody = await req.text();
    const hasBody = !!maybeBody.trim();
    const bodyId = JSON.parse(maybeBody).id;

    const url = `${API}/UserService/RegistrationRequests/${encodeURIComponent(
      bodyId
    )}/approve`;
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
      },
      body: hasBody ? maybeBody : undefined,
      cache: "no-store",
    });

    const payload = await parseUpstream(upstream);
    return NextResponse.json(payload, { status: upstream.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Approve hatası", details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
