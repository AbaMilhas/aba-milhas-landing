import { NextResponse } from "next/server";
// importa o JSON como objeto
import cias from "@/data/cias.json";

export async function GET() {
  // garante que sai como objeto simples
  return NextResponse.json(cias);
}
