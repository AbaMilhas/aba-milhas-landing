// app/api/debug-env/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    WA_TOKEN: process.env.WA_TOKEN ? "✅ carregado" : "❌ vazio",
    WA_PHONE_ID: process.env.WA_PHONE_ID ? "✅ carregado" : "❌ vazio",
    WA_TO: process.env.WA_TO ? "✅ carregado" : "❌ vazio",
  });
}
