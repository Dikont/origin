import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token)
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    const apiUrl = `${process.env.API_BASE_URL}/CompanyService/Company/GetAllCompanies?superUser=DikontUserCreator&superPassword=0rScRXazj39p`;

    const res = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        cache: "no-store",
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
