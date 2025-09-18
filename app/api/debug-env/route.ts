import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    WA_TOKEN: process.env.WA_TOKEN ? "✅ OK" : "❌ faltando",
    WA_PHONE_ID: process.env.WA_PHONE_ID ? "✅ OK" : "❌ faltando",
    WA_TO: process.env.WA_TO ? "✅ OK" : "❌ faltando",
  });
}
