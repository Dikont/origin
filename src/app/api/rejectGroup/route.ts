import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env.API_BASE_URL!;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // FE -> Backend için token’ı cookie’den alalım
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    const backendUrl = `${API}/DocumentService/Document/RejectGroup`;

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: "RejectGroup API error", details: String(err) },
      { status: 500 }
    );
  }
}
