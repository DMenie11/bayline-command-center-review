import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { auditLogs, customers, tmsCarriers, tmsLoads, warehouses } from "@/db/schema";
import { requireAdmin, requireUserProfile } from "@/lib/access";
import { dollarsToCents } from "@/lib/money";

type LocalExport = {
  warehouses?: Array<{ id?: string; code?: string; name?: string; city?: string; state?: string }>;
  customers?: Array<{ id?: string; code?: string; name?: string; email?: string; phone?: string }>;
  tmsCarriers?: Array<{ id?: string; name?: string; scac?: string; serviceAreas?: string }>;
  tmsLoads?: Array<{
    reference?: string;
    customerId?: string;
    warehouseId?: string;
    carrierId?: string;
    orderSource?: "wms" | "external";
    mode?: "ltl" | "ftl" | "parcel";
    status?: "draft" | "quoted" | "tendered" | "dispatched" | "picked_up" | "in_transit" | "delivered" | "closed" | "exception" | "canceled";
    origin?: string;
    destination?: string;
    freightClass?: string;
    weight?: number;
    clientCharge?: number;
    carrierCost?: number;
  }>;
};

export async function POST(request: Request) {
  const { profile } = await requireUserProfile();
  requireAdmin(profile);
  const payload = (await request.json()) as LocalExport;
  const db = getDb();

  const warehouseValues = (payload.warehouses ?? []).map((row) => ({
    code: (row.code || row.name || "WH").toUpperCase(),
    name: row.name || row.code || "Imported Warehouse",
    city: row.city || "",
    state: (row.state || "").toUpperCase(),
  }));
  const warehouseRows = warehouseValues.length
    ? await db.insert(warehouses).values(warehouseValues).onConflictDoNothing().returning()
    : [];

  const customerValues = (payload.customers ?? []).map((row) => ({
    code: (row.code || row.name || "CUST").toUpperCase(),
    name: row.name || row.code || "Imported Customer",
    email: row.email || "",
    phone: row.phone || "",
  }));
  const customerRows = customerValues.length
    ? await db.insert(customers).values(customerValues).onConflictDoNothing().returning()
    : [];

  const carrierValues = (payload.tmsCarriers ?? []).map((row) => ({
    name: row.name || "Imported Carrier",
    scac: (row.scac || "").toUpperCase(),
    serviceAreas: row.serviceAreas || "",
    modes: ["ltl" as const],
  }));
  const carrierRows = carrierValues.length ? await db.insert(tmsCarriers).values(carrierValues).returning() : [];
  const customerByOldId = new Map((payload.customers ?? []).map((row, index) => [row.id || row.code || row.name || String(index), customerRows[index]]));
  const warehouseByOldId = new Map((payload.warehouses ?? []).map((row, index) => [row.id || row.code || row.name || String(index), warehouseRows[index]]));
  const carrierByOldId = new Map((payload.tmsCarriers ?? []).map((row, index) => [row.id || row.scac || row.name || String(index), carrierRows[index]]));

  const loadValues = (payload.tmsLoads ?? [])
    .map((row, index) => {
      const customer = customerByOldId.get(row.customerId || "") || customerRows[0];
      if (!customer) return null;
      const warehouse = warehouseByOldId.get(row.warehouseId || "") || warehouseRows[0];
      const carrier = carrierByOldId.get(row.carrierId || "") || carrierRows[0];

      return {
        reference: (row.reference || `IMPORT-${index + 1}`).toUpperCase(),
        orderSource: row.orderSource || "external",
        customerId: customer.id,
        warehouseId: warehouse?.id ?? null,
        carrierId: carrier?.id ?? null,
        mode: row.mode || "ltl",
        status: row.status || "draft",
        origin: row.origin || "",
        destination: row.destination || "",
        freightClass: row.freightClass || "70",
        weight: Number(row.weight || 0),
        clientChargeCents: dollarsToCents(String(row.clientCharge || 0)),
        carrierCostCents: dollarsToCents(String(row.carrierCost || 0)),
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
  const loadRows = loadValues.length ? await db.insert(tmsLoads).values(loadValues).returning() : [];

  await db.insert(auditLogs).values({
    actorUserId: profile.id,
    action: "import",
    entityType: "local_json",
    detail: `Imported ${warehouseRows.length} warehouses, ${customerRows.length} customers, ${carrierRows.length} carriers, ${loadRows.length} loads`,
  });

  return NextResponse.json({
    imported: {
      warehouses: warehouseRows.length,
      customers: customerRows.length,
      carriers: carrierRows.length,
      loads: loadRows.length,
    },
  });
}
