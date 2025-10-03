import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API = process.env.API_BASE_URL!;

type Body = {
  email: string;
  newTokenCount: number;
  superUser: string;
  superPassword: string;
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

    const { email, newTokenCount, superUser, superPassword } = body;

    const url = `${API}/UserService/UserAuth/AITokenUpdate?email=${encodeURIComponent(
      String(email)
    )}&newTokenCount=${encodeURIComponent(
      String(newTokenCount)
    )}&superUser=${encodeURIComponent(
      String(superUser)
    )}&superPassword=${encodeURIComponent(String(superPassword))}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenValue}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const raw = await resp.json();

    return NextResponse.json(raw, { status: resp.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "İşlem Hatası", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
