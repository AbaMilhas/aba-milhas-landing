import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    vendorWhats: process.env.VENDOR_WHATS || null,
  });
}
