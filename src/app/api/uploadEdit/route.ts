import { cookies } from "next/headers";

export async function POST(req: Request) {
  const token = await cookies();
  const tokenValue = token.get("token")?.value;

  const payload = await req.json();
  const res = await fetch(
    `${process.env.API_BASE_URL}/DocumentService/Document/UpdateDoc`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenValue}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
