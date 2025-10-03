import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const uploadPayload = body;
    const cookieStore = cookies();
    const tokenValue = (await cookieStore).get("token")?.value;
    const userRaw = (await cookieStore).get("user")?.value ?? "";

    if (!tokenValue) {
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    }

    const decoded = decodeURIComponent(userRaw);

    const obj = JSON.parse(decoded);

    const userIdFromLogin = obj.user?.id;

    if (!userIdFromLogin) {
      return NextResponse.json({ error: "userId bulunamadı" }, { status: 400 });
    }

    // ---- 3) Önce UploadDocument
    const uploadUrl = `${process.env.API_BASE_URL}/DocumentService/Document/UploadDocument`;

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenValue}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(uploadPayload),
    });

    const uploadText = await uploadRes.text(); // ör: 83 veya "83"

    if (!uploadRes.ok) {
      console.error("UploadDocument hata:", uploadText);
      return NextResponse.json(
        { error: `UploadDocument başarısız`, details: uploadText },
        { status: uploadRes.status }
      );
    }

    const documentGroupId = uploadText.trim().replace(/^"|"$/g, "");
    if (!documentGroupId) {
      return NextResponse.json(
        { error: "Geçersiz documentGroupId", raw: uploadText },
        { status: 502 }
      );
    }

    // ---- 4) Sonra SendMailForSign (Authorization EKLE!)
    const sendUrl = `${
      process.env.API_BASE_URL
    }/DocumentService/Document/SendMailForSign?documentGroupId=${encodeURIComponent(
      documentGroupId
    )}&userId=${encodeURIComponent(userIdFromLogin)}`;

    const sendRes = await fetch(sendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenValue}`,
        "Content-Type": "application/json",
      },
    });

    const raw = await sendRes.text();
    let json: any;
    try {
      json = JSON.parse(raw);
    } catch {
      json = { raw };
    }

    return NextResponse.json(
      { documentGroupId, result: json },
      { status: sendRes.status }
    );
  } catch (error: any) {
    console.error("SendMailForSign hata:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu", details: String(error?.message ?? error) },
      { status: 500 }
    );
  }
}
