import { NextResponse, NextRequest } from "next/server";
import { buildLogoutResponse } from "@/lib/logout";

const API = process.env.API_BASE_URL!;
const ALLOWED = new Set(["today", "week", "month", "allTime"]);

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    }

    const body = await req.json();
    const { period, companyId, userId } = body;
    if (!period || !ALLOWED.has(String(period))) {
      return NextResponse.json({ error: "Geçersiz period" }, { status: 400 });
    }
    if (!companyId) {
      return NextResponse.json({ error: "companyId zorunlu" }, { status: 400 });
    }

    let url =
      `${API}/DocumentService/Analytics/ExportSignReport` +
      `?period=${encodeURIComponent(String(period))}` +
      `&companyId=${encodeURIComponent(String(companyId))}`;
    if (userId) url += `&userId=${encodeURIComponent(String(userId))}`;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
      cache: "no-store",
    });

    if (resp.status === 401) {
      const res = NextResponse.json({ error: "unauthorized" }, { status: 401 });
      res.cookies.set("token", "", {
        path: "/",
        expires: new Date(0),
        maxAge: 0,
      });
      res.cookies.set("user", "", {
        path: "/",
        expires: new Date(0),
        maxAge: 0,
      });
      return res;
    }
    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json(
        { error: "ExportSignReport başarısız", details: errText },
        { status: resp.status }
      );
    }

    const arrayBuffer = await resp.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="sign-report-${period}-${Date.now()}.xlsx"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "İşlem hatası", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
