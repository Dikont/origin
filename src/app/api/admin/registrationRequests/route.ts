import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";
import { buildLogoutResponse } from "@/lib/logout";
const API = process.env.API_BASE_URL!;
export const runtime = "nodejs";

type InBody = {
  page?: number | string;
  pageSize?: number | string;
  search?: string;
  status?: string;
};

export async function POST(req: NextRequest) {
  try {
    const tokenValue = (await cookies()).get("token")?.value;
    if (!tokenValue) {
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    }
    const body = (await req.json().catch(() => ({}))) as InBody;
    const pageRaw = (body.page ?? "1").toString().trim();
    const pageSizeRaw = (body.pageSize ?? "20").toString().trim();
    const search = (body.search ?? "").toString().trim();
    const status = (body.status ?? "Pending").toString().trim();

    const page = Number.isFinite(+pageRaw) && +pageRaw > 0 ? pageRaw : "1";
    const pageSize =
      Number.isFinite(+pageSizeRaw) && +pageSizeRaw > 0 ? pageSizeRaw : "20";

    const qs = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
    });
    const backendUrl = `${API}/UserService/RegistrationRequests?${qs.toString()}`;

    const resp = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenValue}`,
        Accept: "*/*",
      },
      cache: "no-store",
    });
    if (resp.status === 401) {
      return buildLogoutResponse(req);
    }
    const raw = await resp.text();
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }

    if (!resp.ok) {
      return NextResponse.json(
        {
          error: "RegistrationRequests isteği başarısız",
          status: resp.status,
          details: data,
        },
        { status: resp.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "İşlem hatası", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
