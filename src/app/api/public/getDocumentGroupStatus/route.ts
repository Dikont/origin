import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const docGroupId = searchParams.get("docGroupId");

    if (!docGroupId) {
      return NextResponse.json(
        { error: "docGroupId zorunlu" },
        { status: 400 }
      );
    }

    const apiUrl = `${
      process.env.API_BASE_URL
    }/DocumentService/Document/GetDocumentGroupStatus?docGroupId=${encodeURIComponent(
      docGroupId
    )}`;

    const res = await fetch(apiUrl, { method: "GET" });
    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Bir hata oluştu", detail: e.message },
      { status: 500 }
    );
  }
}
