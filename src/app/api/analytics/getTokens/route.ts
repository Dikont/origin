import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenValue = cookieStore.get("token")?.value;
    const cookieUser = cookieStore.get("user")?.value as string;
    const userId = JSON.parse(cookieUser).user.id;

    if (!tokenValue) {
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    }

    const url = `${process.env.API_BASE_URL}/UserService/UserAuth/getTokens`;

    const form = new FormData();
    form.append("userId", userId);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenValue}`,
        Accept: "*/*",
      },
      body: form,
    });

    const text = await response.text();
    let raw: any;
    try {
      raw = JSON.parse(text);
    } catch {
      raw = text;
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, status: response.status, data: raw },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: raw }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Bilinmeyen hata" },
      { status: 500 }
    );
  }
}
