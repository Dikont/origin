// app/api/get-templates/route.ts
import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";
import { buildLogoutResponse } from "@/lib/logout";
type TemplateItem = {
  id: number;
  documentGroupId?: string | number | null;
  // ... diğer alanlar
};

type GroupInfoResponse = {
  documentGroupName?: string | null;
  documentGroupDesc?: string | null;
};

const API = process.env.API_BASE_URL!; // https://cloudservices.dikontapp.com

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const tokenValue = (await cookieStore).get("token")?.value;
    const cookieUser = (await cookieStore).get("user")?.value;

    if (!tokenValue) {
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    }

    const { user } = (await req.json().catch(() => ({}))) as { user?: string };
    const userId = user ?? cookieUser;
    if (!userId) {
      return NextResponse.json(
        { error: "Kullanıcı bilgisi yok (userId)" },
        { status: 400 }
      );
    }

    const templatesUrl = `${API}/DocumentService/Document/GetTemplates?userId=${encodeURIComponent(
      userId
    )}`;
    const templatesRes = await fetch(templatesUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenValue}`,
        "Content-Type": "application/json",
      },
    });
    if (templatesRes.status === 401) {
      return buildLogoutResponse(req);
    }
    if (!templatesRes.ok) {
      return NextResponse.json(
        { error: "GetTemplates başarısız", details: await templatesRes.text() },
        { status: templatesRes.status }
      );
    }

    const templates: TemplateItem[] = await templatesRes.json();

    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Listeleme Hatası", details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
