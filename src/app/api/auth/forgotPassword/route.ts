// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const API = process.env.API_BASE_URL!;
const ENDPOINT = `${API}/UserService/UserAuth/ForgotPassword`;

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

async function parseResponse(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text();
  return { message: text };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      Email?: string;
    };

    const email = (body.email ?? body.Email ?? "").trim();
    if (!email) {
      return NextResponse.json(
        { error: "Email alanı zorunludur" },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Geçerli bir email giriniz" },
        { status: 400 }
      );
    }

    const fd = new FormData();
    fd.append("Email", email); // <-- swagger’daki alan adı

    const res = await fetch(ENDPOINT, {
      method: "POST",
      body: fd, // <-- multipart/form-data; boundary otomatik set edilir
    });

    const data = await parseResponse(res);

    if (!res.ok) {
      return NextResponse.json(
        { error: "ForgotPassword isteği başarısız", details: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Bir hata oluştu",
        details: error?.message || "Bilinmeyen hata",
      },
      { status: 500 }
    );
  }
}
