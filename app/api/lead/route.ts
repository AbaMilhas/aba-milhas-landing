import { NextResponse } from "next/server";

// ⚠️ Substitua pelo seu webhook real do Make
const MAKE_WEBHOOK =
  process.env.MAKE_WEBHOOK ||
  "https://hook.us2.make.com/t3bv6ngxkg5kue1en9vdggss6hieksz3";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Repassa os dados para o Make
    await fetch(MAKE_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        receivedAt: new Date().toISOString(),
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

// 🔹 GET opcional só para testar se a rota está ativa
export async function GET() {
  return NextResponse.json({ message: "API de lead está funcionando 🚀" });
}

