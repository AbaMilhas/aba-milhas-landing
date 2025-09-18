// app/api/send/route.ts
import { NextResponse } from "next/server";

const WA_PHONE_ID = process.env.WA_PHONE_ID!;
const WA_TOKEN = process.env.WA_TOKEN!;
const DEFAULT_TO = process.env.WA_TO!;

async function sendWhatsApp(to: string, body: string) {
  const url = `https://graph.facebook.com/v20.0/${WA_PHONE_ID}/messages`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WA_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });

  const data = await resp.json();
  return { status: resp.status, data };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get("to") || DEFAULT_TO;
  const body =
    searchParams.get("body") || "🚀 Teste enviado via API do WhatsApp Cloud!";
  const result = await sendWhatsApp(to, body);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const { to, body } = (await req.json().catch(() => ({}))) as {
    to?: string;
    body?: string;
  };
  const result = await sendWhatsApp(to || DEFAULT_TO, body || "Mensagem padrão");
  return NextResponse.json(result);
}

