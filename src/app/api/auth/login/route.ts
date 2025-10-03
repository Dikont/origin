import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email ve şifre zorunludur." },
        { status: 400 }
      );
    }

    const url = `${process.env.API_BASE_URL}/UserService/UserAuth/LoginAccount`;

    const fd = new FormData();
    fd.append("email", String(email));
    fd.append("password", String(password));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "*/*",
      },
      body: fd,
    });

    const raw = await response.text();
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }

    if (!response.ok) {
      const msg =
        data?.message || data?.error || "Login failed (sunucu hatası)";
      return NextResponse.json(
        { success: false, message: msg },
        { status: response.status }
      );
    }

    const token = data?.token || data?.accessToken || data?.result?.token;
    const loginResult =
      data?.loginResult || data?.user || data?.result?.user || data;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token alınamadı." },
        { status: 502 }
      );
    }

    const res = NextResponse.json({ user: loginResult });

    res.cookies.set("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    res.cookies.set("user", JSON.stringify(loginResult), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Bilinmeyen hata" },
      { status: 500 }
    );
  }
}
