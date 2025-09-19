import { NextResponse } from "next/server";
// Caminho relativo saindo de app/api/cias/route.ts até data/cias.json
import cias from "../../../data/cias.json";

export async function GET() {
  return NextResponse.json(cias);
}

