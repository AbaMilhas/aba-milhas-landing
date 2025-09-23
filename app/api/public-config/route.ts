import { NextResponse } from "next/server";

export async function GET() {
  const vendor =
    process.env.VENDOR_WHATS ||
    process.env.NEXT_PUBLIC_VENDEDOR_WHATS ||
    "";
  return NextResponse.json({ vendorWhats: vendor });
}

