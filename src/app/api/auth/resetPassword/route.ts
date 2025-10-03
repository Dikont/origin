import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { token, email, password, rePassword } = body;
    if (!token || !email || !password || !rePassword) {
      return NextResponse.json(
        { error: "token, email, password ve rePassword zorunludur" },
        { status: 400 }
      );
    }
    if (password !== rePassword) {
      return NextResponse.json(
        { error: "Şifreler eşleşmiyor" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/UserService/UserAuth/ResetPassword`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("ResetPassword API hatası:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu", details: error.message },
      { status: 500 }
    );
  }
}
