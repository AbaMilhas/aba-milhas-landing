import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { to, body } = (await req.json().catch(() => ({}))) as {
      to?: string;
      body?: string;
    };

    const phoneId = process.env.WA_PHONE_ID;
    const token = process.env.WA_TOKEN;
    const defaultTo = process.env.WA_TO;

    if (!phoneId || !token) {
      return NextResponse.json(
        { ok: false, error: "WA_PHONE_ID/WA_TOKEN ausentes" },
        { status: 500 }
      );
    }

    const destino = (to || defaultTo || "").replace(/[^\d]/g, "");
    if (!destino) {
      return NextResponse.json(
        { ok: false, error: "Número destino ausente (to ou WA_TO)" },
        { status: 400 }
      );
    }

    const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: destino,
        type: "text",
        text: { body: body || "🚀 Teste via Aba Milhas" }
      })
    });

    const data = await resp.json();
    return NextResponse.json({ ok: resp.ok, status: resp.status, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST { to, body } para enviar WhatsApp."
  });
}

