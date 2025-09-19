import { NextResponse } from "next/server";
import cias from "@/data/cias.json"; // importa o JSON como objeto

export async function GET() {
  // devolve exatamente { "LATAM": 25, "Smiles": 15.5, ... }
  return NextResponse.json(cias);
}
