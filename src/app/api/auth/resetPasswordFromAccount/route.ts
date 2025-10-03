import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API = process.env.API_BASE_URL!;

type Body = {
  oldPas: string;
  newPas: string;
  newPasAgain: string;
};

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const tokenValue = (await cookieStore).get("token")?.value;
    const cookieUser = (await cookieStore).get("user")?.value as string;
    const userId = JSON.parse(cookieUser).user.id;
    if (!tokenValue) {
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    }

    const body: Body = await req.json().catch(() => ({} as Body));

    const { oldPas, newPas, newPasAgain } = body;

    const url = `${API}/UserService/UserAuth/resetPasswordFromAccount?userId=${encodeURIComponent(
      String(userId)
    )}&oldPas=${encodeURIComponent(String(oldPas))}&newPas=${encodeURIComponent(
      String(newPas)
    )}&newPasAgain=${encodeURIComponent(String(newPasAgain))}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenValue}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const raw = await resp.json();

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
    if (payload.succeeded === true) {
      return NextResponse.json(payload, { status: 200 });
    } else {
      return NextResponse.json(payload, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: "İşlem Hatası", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
