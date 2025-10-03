import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
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
  const outputPath = `/tmp/${uuid()}.pdf`;

  try {
    await writeFile(inputPath, buffer);

    const pdfBuf: Buffer = await new Promise((resolve, reject) => {
      libre.convert(buffer, ".pdf", undefined, (err, done) => {
        if (err) reject(err);
        else resolve(done);
      });
    });

    await unlink(inputPath);

    return new NextResponse(pdfBuf, {
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
