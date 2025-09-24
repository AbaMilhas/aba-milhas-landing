// app/api/lead/route.ts
import { NextResponse } from "next/server";

type LeadInput = {
  cia: string;
  pontos: number;
  whatsapp: string; // com +55 ou somente dígitos? aqui pode ser só dígitos
  email: string;
  valor: number; // valor estimado calculado
  cpm: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<LeadInput>;

    // validações básicas
    if (!body.cia || typeof body.cia !== "string") {
      return NextResponse.json({ ok: false, error: "cia inválida" }, { status: 400 });
    }
    if (!body.pontos || typeof body.pontos !== "number") {
      return NextResponse.json({ ok: false, error: "pontos inválidos" }, { status: 400 });
    }
    if (!body.whatsapp || typeof body.whatsapp !== "string") {
      return NextResponse.json({ ok: false, error: "whatsapp inválido" }, { status: 400 });
    }
    if (!body.email || typeof body.email !== "string") {
      return NextResponse.json({ ok: false, error: "email inválido" }, { status: 400 });
    }

    const payload = {
      cia: body.cia,
      pontos: body.pontos,
      whatsapp: body.whatsapp,
      email: body.email,
      valor: body.valor ?? 0,
      cpm: body.cpm ?? 0,
      ts: new Date().toISOString(),
      ua: req.headers.get("user-agent") || "",
    };

    // 1) (opcional) enviar para um webhook (Google Apps Script, Make, Zapier, Notion, etc.)
    // Configure LEAD_WEBHOOK_URL na Vercel se quiser usar
    const webhook = process.env.LEAD_WEBHOOK_URL;
    if (webhook) {
      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          // timeout “manual” simples:
          signal: AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined,
        });
      } catch {
        // não quebra o fluxo se o webhook falhar
      }
    }

    // 2) (mínimo) log no servidor — útil em dev/Vercel Logs
    console.log("[LEAD]", payload);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

// GET de teste opcional: abre /api/lead no navegador para ver se está vivo
export async function GET() {
  return NextResponse.json({ ok: true, info: "POST /api/lead para registrar leads" });
}

