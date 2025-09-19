import { NextResponse } from "next/server";
import cias from "../../../data/cias.json";

export async function GET() {
  return NextResponse.json(cias);
}
