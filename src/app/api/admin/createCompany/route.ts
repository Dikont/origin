import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { CompName, CompDesc } = await req.json();

    if (!CompName || !CompDesc) {
      return NextResponse.json(
        {
          error: "Şirket adı ve acıklaması zorunludur",
        },
        { status: 400 }
      );
    }

    const apiUrl = `${
      process.env.API_BASE_URL
    }/CompanyService/Company/CreateCompany?CompName=${encodeURIComponent(
      CompName
    )}&CompDesc=${encodeURIComponent(
      CompDesc
    )}&superUser=DikontUserCreator&superPassword=0rScRXazj39p`;

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Doğrulama kodu hatası", details: error.message },
      { status: 500 }
    );
  }
}
