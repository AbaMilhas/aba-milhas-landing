import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { body } = await req.json().catch(() => ({ body: "" }));

    const resp = await fetch(
      https://graph.facebook.com/v20.0//messages,
      {
        method: "POST",
        headers: {
          "Authorization": Bearer ,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: process.env.WA_TO,
          type: "text",
          text: { body: body || "🚀 Teste da Aba Milhas via WhatsApp Cloud API" },
        }),
      }
    );

    const data = await resp.json();
    return NextResponse.json({ ok: resp.ok, status: resp.status, data });
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

// Para teste no navegador (GET)
export async function GET() {
  return NextResponse.json({
    message: "Use POST para enviar mensagens pelo WhatsApp Cloud API 🚀",
  });
}
