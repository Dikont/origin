import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";
import { buildLogoutResponse } from "@/lib/logout";
const API = process.env.API_BASE_URL!;

type GroupInfo = {
  documentGroupName?: string | null;
  documentGroupDesc?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token =
      (await cookieStore).get("token")?.value ??
      req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    }

    const { user, userRole } = await req.json();

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bilgisi yok (userId)" },
        { status: 400 }
      );
    }

    const listUrl = `${API}/DocumentService/Analytics/getDocumentTakip?userId=${encodeURIComponent(
      user
    )}&userRole=${encodeURIComponent(userRole)}`;
    const listRes = await fetch(listUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (listRes.status === 401) {
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

    const payload = await listRes.json();

    const items: any[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.result)
      ? payload.result
      : [];

    if (!listRes.ok) {
      return NextResponse.json(
        {
          error: "getSignStatusOfUser başarısız",
          details: await listRes.text(),
        },
        { status: listRes.status }
      );
    }

    const groupIds = Array.from(
      new Set(
        items
          .map((x) => x.documentGroupId)
          .filter((x) => x !== null && x !== undefined)
          .map((x) => String(x))
      )
    );

    const entries = await Promise.all(
      groupIds.map(async (gid) => {
        try {
          const url = `${API}/DocumentService/Analytics/getGroupInfo?DocumentGrouId=${encodeURIComponent(
            gid
          )}`;
          const r = await fetch(url, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          });

          if (!r.ok) {
            return [
              gid,
              { documentGroupName: null, documentGroupDesc: null },
            ] as const;
          }

          const data: GroupInfo = await r.json();
          return [
            gid,
            {
              documentGroupName: data?.documentGroupName ?? null,
              documentGroupDesc: data?.documentGroupDesc ?? null,
            },
          ] as const;
        } catch {
          return [
            gid,
            { documentGroupName: null, documentGroupDesc: null },
          ] as const;
        }
      })
    );

    const infoMap = new Map<string, GroupInfo>(entries as any);

    const enriched = items.map((it) => {
      const key = it.documentGroupId != null ? String(it.documentGroupId) : "";
      const info = key ? infoMap.get(key) : undefined;
      return {
        ...it,
        documentGroupName: info?.documentGroupName ?? null,
        documentGroupDesc: info?.documentGroupDesc ?? null,
      };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    const res = NextResponse.json({ success: true });
    res.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0),
      sameSite: "lax",
    });

    res.cookies.set("user", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0),
      sameSite: "lax",
    });
    return NextResponse.json(
      { error: "Listeleme Hatası", details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
