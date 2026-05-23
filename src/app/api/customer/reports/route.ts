import { NextResponse } from "next/server";
import { requireUserProfile } from "@/lib/access";
import { getCustomerSafeLoads } from "@/lib/data";

export async function GET() {
  const { profile } = await requireUserProfile();
  const loads = await getCustomerSafeLoads(profile);
  return NextResponse.json({ loads });
}
