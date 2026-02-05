import OpenAI, { toFile } from "openai";
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import * as mammoth from "mammoth"; // <-- eklendi

export const runtime = "nodejs";

const API = process.env.API_BASE_URL!;
const ALLOWED = [
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE = 20 * 1024 * 1024;

type TokenDecreaseOk = { userId: string; tokens: number };

async function getUserIdFromCookie() {
  const raw = (await cookies()).get("user")?.value; // yapıyı bozmadım
  if (!raw) return undefined;
  try {
    const obj = JSON.parse(decodeURIComponent(raw));
    return obj?.user?.id || obj?.id || obj?.userId;
  } catch {
    return undefined;
  }
}

async function callTokenDecrease(authToken: string, userId: string) {
  const url = `${API}/UserService/UserAuth/TokenDecrease`;

  const form = new FormData();
  form.append("userId", userId);

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: "*/*",
    },
    body: form,
  });

  // GÖVDEYİ SADECE BİR KEZ OKUYORUZ
  const rawBody = await resp.text();
  let payload: any = null;

  try {
    // Eğer gelen metin JSON ise parse et, değilse olduğu gibi bırak
    payload = JSON.parse(rawBody);
  } catch {
    payload = rawBody;
  }

  return { ok: resp.ok, status: resp.status, payload };
}

export async function POST(req: Request) {
  try {
    const form = await req.formData().catch(() => null);
    if (!form)
      return NextResponse.json(
        { error: "FormData bekleniyor" },
        { status: 400 },
      );

    const prompt = String(form.get("prompt") || "").trim();
    const file = form.get("file") as File | null;
    if (!prompt && !file) {
      return NextResponse.json(
        { error: "En az bir alan gerekli: prompt veya file" },
        { status: 400 },
      );
    }

    if (file) {
      if (!ALLOWED.includes(file.type))
        return NextResponse.json(
          { error: `Desteklenmeyen dosya türü: ${file.type || "unknown"}` },
          { status: 415 },
        );
      if (file.size > MAX_SIZE)
        return NextResponse.json(
          {
            error: `Dosya çok büyük. Maksimum ${Math.round(
              MAX_SIZE / 1024 / 1024,
            )}MB`,
          },
          { status: 413 },
        );
    }

    const tokenFromCookie = (await cookies()).get("token")?.value;
    const authHeader =
      (await headers()).get("authorization") ||
      (await headers()).get("Authorization");
    const tokenFromHeader = authHeader?.replace(/Bearer\s+/i, "");
    const authToken = tokenFromCookie || tokenFromHeader;
    if (!authToken)
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });

    const userId = getUserIdFromCookie();
    if (!userId)
      return NextResponse.json(
        { error: "userId bulunamadı (cookie 'user')" },
        { status: 400 },
      );

    const dec = await callTokenDecrease(authToken, await userId);

    if (!dec.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            typeof dec.payload === "string"
              ? dec.payload
              : dec.payload?.error || "TokenDecrease başarısız",
          status: dec.status,
        },
        { status: dec.status },
      );
    }
    const remainingTokens: number | undefined = (dec.payload as TokenDecreaseOk)
      ?.tokens;

    // 2) OpenAI
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let uploadedFileId: string | undefined;
    let extraText = ""; // DOCX/TXT metni buraya

    if (file) {
      const isPdf = file.type === "application/pdf";
      const isDocx =
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const isTxt = file.type === "text/plain";

      if (isPdf) {
        // --- YENİ EKLENECEK KISIM BURASI ---

        // 1. Dosyayı tampon belleğe (Buffer) alıyoruz ki "okundu" hatası vermesin
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 2. OpenAI'ın sevdiği formata çeviriyoruz
        const openaiFile = await toFile(buffer, file.name || "dosya.pdf", {
          type: "application/pdf",
        });

        // 3. Şimdi temiz bir şekilde yüklüyoruz
        const uploaded = await client.files.create({
          file: openaiFile,
          purpose: "assistants",
        });
        uploadedFileId = uploaded.id;

        // --- YENİ KISIM BİTTİ ---
      } else if (isDocx) {
        const buf = Buffer.from(await file.arrayBuffer());
        const { value } = await mammoth.extractRawText({ buffer: buf });
        extraText = (value || "").trim();
      } else if (isTxt) {
        extraText = (await file.text()).trim();
      }
    }

    const composedText =
      (prompt || "") +
      (extraText ? `\n\n---\n[Belge Metni]\n${extraText}` : "") +
      "\n\nLütfen başlık önerileri, netlik/akış iyileştirmeleri, dil/ton düzeltmeleri ve madde madde düzenleme önerileri ver.";

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content:
            "Siz, bilgisayar tabanlı bir dijital imza yazılımı olan Dikont'un yapay zeka asistanı Digichat'siniz. Rolünüz, kullanıcıların sistemde gezinmesine yardımcı olmak, sorularını yanıtlamak ve dijital imza sürecinin her adımında onlara rehberlik etmektir. Yükledikleri dosyalarla ilgili sözleşme niteliği taşıyıp taşımadığını kontrol ettikten sonra yardımcı olmanı istedikleri konularda detaya girmeden, hukuksal risk almadan öneriler bulunabilirsin. Nasıl davranmalısınız: Her zaman yardımsever, arkadaş canlısı ve profesyonel olun. Anlaşılması kolay, açık ve basit bir dille konuşun. Başlıca Görevleriniz: Kullanıcıların sözleşmelerini nasıl güncelleyebileceklerini, panelde nereye tıklayacaklarını ve adım adım nasıl ilerleyeceklerini açıklayın. Kullanıcılara form doldurma, imza adımları ve belge yönetimi konusunda rehberlik edin. Kullanıcı kafası karışıksa veya takılıp kalmışsa, kişisel yardım için +90 212 936 17 96 numaralı telefondan bizi arayabileceğini belirtin. Müşteri Desteği için Örnek Cümle: Takılırsanız veya gerçek bir kişiden yardıma ihtiyacınız olursa, +90 212 936 17 96 numaralı telefondan bizi aramaktan çekinmeyin. Sizin için buradayız!",
        },
        {
          role: "system",
          content:
            "Her cevabının sonunda mutlaka şu cümleyi ekle: 'Takılırsanız veya gerçek bir kişiden yardıma ihtiyacınız olursa, +90 212 936 17 96 numaralı telefondan bizi aramaktan çekinmeyin. Sizin için buradayız!'",
        },
        {
          role: "user",
          content: [
            { type: "input_text", text: composedText },
            ...(uploadedFileId
              ? [{ type: "input_file" as const, file_id: uploadedFileId }]
              : []),
          ],
        },
      ],
      max_output_tokens: 1200,
      temperature: 0.2,
    });

    const output = response.output_text || "Herhangi bir çıktı alınamadı.";
    return NextResponse.json(
      { ok: true, result: output, remainingTokens, userId },
      { status: 200 },
    );
  } catch (err: any) {
    const message =
      err?.response?.data?.error?.message || err?.message || "Bilinmeyen hata";
    const status = err?.status || 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
