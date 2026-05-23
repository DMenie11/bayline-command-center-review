import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { auditLogs, tmsLoads } from "@/db/schema";
import { requireAdmin, requireUserProfile } from "@/lib/access";

export async function GET() {
  const { profile } = await requireUserProfile();
  requireAdmin(profile);
  const db = getDb();
  const loads = await db.select().from(tmsLoads);
  await db.insert(auditLogs).values({
    actorUserId: profile.id,
    action: "export",
    entityType: "tms_load",
    detail: "Admin exported internal TMS load report",
  });

  const csv = [
    "reference,status,mode,origin,destination,clientChargeCents,carrierCostCents,marginCents",
    ...loads.map((load) =>
      [
        load.reference,
        load.status,
        load.mode,
        load.origin,
        load.destination,
        load.clientChargeCents,
        load.carrierCostCents,
        load.clientChargeCents - load.carrierCostCents,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="bayline-internal-tms-export.csv"`,
    },
  });
}
