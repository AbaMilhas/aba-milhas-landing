import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { body } = await req.json().catch(() => ({ body: "" }));

    const url = `https://graph.facebook.com/v20.0/${process.env.WA_PHONE_ID}/messages`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: process.env.WA_TO,
        type: "text",
        text: { body: body || "🚀 Teste da Aba Milhas via WhatsApp Cloud API" },
      }),
    });

    const data = await resp.json();
    return NextResponse.json({ ok: resp.ok, status: resp.status, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// Para teste no navegador (GET)
export async function GET() {
  return NextResponse.json({
    message: "Use POST para enviar mensagens pelo WhatsApp Cloud API 🚀",
  });
}
