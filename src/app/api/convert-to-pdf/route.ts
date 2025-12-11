import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";
import libre from "libreoffice-convert";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Dosya yüklenemedi." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name);
  const inputPath = `/tmp/${uuid()}${ext}`;

  try {
    // Geçici dosyayı yaz
    await writeFile(inputPath, buffer);

    // LibreOffice ile PDF'e dönüştür
    // LibreOffice sonucu Buffer (Node.js)
    const pdfBuf: Buffer = await new Promise((resolve, reject) => {
      libre.convert(buffer, ".pdf", undefined, (err, done) => {
        if (err) reject(err);
        else resolve(done);
      });
    });

    await unlink(inputPath);

    // ❗ Next.js 15 uyumlu: Buffer → Uint8Array → Blob
    const uint8 = new Uint8Array(pdfBuf);
    const blob = new Blob([uint8], { type: "application/pdf" });

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="converted.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF dönüşüm hatası:", error);
    return NextResponse.json(
      { error: "PDF'e dönüştürülemedi." },
      { status: 500 }
    );
  }
}
