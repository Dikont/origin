import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const API = process.env.API_BASE_URL!; // https://cloudservices.dikontapp.com

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
    const cookieStore = cookies();
    const token =
      (await cookieStore).get("token")?.value ??
      req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    }

    const ct = req.headers.get("content-type") || "";
    let bodyToSend: BodyInit;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      bodyToSend = form;
    } else {
      let obj: any = {};
      try {
        obj = await req.json();
      } catch {
        const t = await req.text();
        try {
          obj = JSON.parse(t);
        } catch {
          obj = {};
        }
      }

      // ✅ PhoneNumber zorunlu + normalize
      if (!obj?.PhoneNumber || String(obj.PhoneNumber).trim().length === 0) {
        return NextResponse.json(
          { error: "PhoneNumber zorunlu" },
          { status: 400 },
        );
      }

      obj.PhoneNumber = String(obj.PhoneNumber).trim();
      if (!obj.PhoneNumber.startsWith("+"))
        obj.PhoneNumber = `+${obj.PhoneNumber}`;

      const form = new FormData();
      Object.entries(obj || {}).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (v instanceof Blob) {
          form.append(k, v);
        } else if (Array.isArray(v) || typeof v === "object") {
          form.append(k, JSON.stringify(v));
        } else {
          form.append(k, String(v));
        }
      });

      bodyToSend = form;
    }

    const upstream = await fetch(`${API}/UserService/UserAuth/CreateAccount`, {
      method: "POST",
      headers,
      body: bodyToSend,
      cache: "no-store",
    });

    const payload = await parseUpstream(upstream);
    return NextResponse.json(payload, { status: upstream.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "CreateAccount hatası", details: String(err?.message ?? err) },
      { status: 500 },
    );
  }
}
