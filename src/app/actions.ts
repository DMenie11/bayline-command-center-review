"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  auditLogs,
  customers,
  shipments,
  skus,
  tmsCarrierRates,
  tmsCarriers,
  tmsClientRates,
  tmsLoads,
  userProfiles,
  warehouseBays,
  warehouses,
} from "@/db/schema";
import { requireAdmin, requireUserProfile, requireWrite } from "@/lib/access";
import { dollarsToCents, pctToBps } from "@/lib/money";
import {
  baySchema,
  carrierRateSchema,
  carrierSchema,
  clientRateSchema,
  customerSchema,
  reviewerRoleSchema,
  shipmentSchema,
  skuSchema,
  tmsLoadSchema,
  warehouseSchema,
} from "@/lib/validators";

async function writeAudit(actorUserId: string, entityType: string, entityId: string, detail: string, action: "create" | "update" | "role_change" = "create") {
  await getDb().insert(auditLogs).values({
    actorUserId,
    action,
    entityType,
    entityId,
    detail,
  });
}

function toInt(value: FormDataEntryValue | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

export async function createWarehouseAction(formData: FormData) {
  const { profile } = await requireUserProfile();
  requireWrite(profile);
  const data = warehouseSchema.parse(Object.fromEntries(formData));
  const [row] = await getDb().insert(warehouses).values(data).returning();
  await writeAudit(profile.id, "warehouse", row.id, `Created warehouse ${row.code}`);
  revalidatePath("/");
}

export async function createCustomerAction(formData: FormData) {
  const { profile } = await requireUserProfile();
  requireWrite(profile);
  const data = customerSchema.parse(Object.fromEntries(formData));
  const [row] = await getDb().insert(customers).values(data).returning();
  await writeAudit(profile.id, "customer", row.id, `Created customer ${row.code}`);
  revalidatePath("/");
}

export async function createSkuAction(formData: FormData) {
  const { profile } = await requireUserProfile();
  requireWrite(profile);
  const data = skuSchema.parse(Object.fromEntries(formData));
  const [row] = await getDb()
    .insert(skus)
    .values({
      sku: data.sku,
      name: data.name,
      customerId: data.customerId || null,
      length: toInt(data.length),
      width: toInt(data.width),
      height: toInt(data.height),
      weight: toInt(data.weight),
      notes: data.notes,
    })
    .returning();
  await writeAudit(profile.id, "sku", row.id, `Created SKU ${row.sku}`);
  revalidatePath("/");
}

export async function createBayAction(formData: FormData) {
  const { profile } = await requireUserProfile();
  requireWrite(profile);
  const data = baySchema.parse(Object.fromEntries(formData));
  const [row] = await getDb()
    .insert(warehouseBays)
    .values({
      warehouseId: data.warehouseId,
      code: data.code,
      zone: data.zone,
      maxPallets: toInt(data.maxPallets),
      maxWeight: toInt(data.maxWeight),
      notes: data.notes,
    })
    .returning();
  await writeAudit(profile.id, "warehouse_bay", row.id, `Created bay ${row.code}`);
  revalidatePath("/");
}

export async function createShipmentAction(formData: FormData) {
  const { profile } = await requireUserProfile();
  requireWrite(profile);
  const data = shipmentSchema.parse(Object.fromEntries(formData));
  const [row] = await getDb()
    .insert(shipments)
    .values({
      reference: data.reference,
      warehouseId: data.warehouseId || null,
      customerId: data.customerId || null,
      status: data.status || "draft",
      origin: data.origin,
      destination: data.destination,
      carrier: data.carrier,
      invoiceTotalCents: dollarsToCents(data.invoiceTotal),
      internalCostCents: dollarsToCents(data.internalCost),
      notes: data.notes,
    })
    .returning();
  await writeAudit(profile.id, "shipment", row.id, `Created WMS shipment ${row.reference}`);
  revalidatePath("/");
}

export async function createCarrierAction(formData: FormData) {
  const { profile } = await requireUserProfile();
  requireWrite(profile);
  const data = carrierSchema.parse(Object.fromEntries(formData));
  const [row] = await getDb()
    .insert(tmsCarriers)
    .values({ ...data, modes: ["ltl"] })
    .returning();
  await writeAudit(profile.id, "tms_carrier", row.id, `Created carrier ${row.name}`);
  revalidatePath("/");
}

export async function createCarrierRateAction(formData: FormData) {
  const { profile } = await requireUserProfile();
  requireWrite(profile);
  const data = carrierRateSchema.parse(Object.fromEntries(formData));
  const [row] = await getDb()
    .insert(tmsCarrierRates)
    .values({
      carrierId: data.carrierId,
      laneName: data.laneName,
      originRegion: data.originRegion,
      destinationRegion: data.destinationRegion,
      mode: data.mode,
      freightClass: data.freightClass,
      minimumChargeCents: dollarsToCents(data.minimumCharge),
      linehaulCentsPerLb: dollarsToCents(data.linehaul),
      fuelPctBps: pctToBps(data.fuelPct),
    })
    .returning();
  await writeAudit(profile.id, "tms_carrier_rate", row.id, `Created carrier rate ${row.laneName}`);
  revalidatePath("/");
}

export async function createClientRateAction(formData: FormData) {
  const { profile } = await requireUserProfile();
  requireWrite(profile);
  const data = clientRateSchema.parse(Object.fromEntries(formData));
  const [row] = await getDb()
    .insert(tmsClientRates)
    .values({
      customerId: data.customerId,
      carrierRateId: data.carrierRateId || null,
      name: data.name,
      mode: data.mode,
      percentMarkupBps: pctToBps(data.percentMarkup),
      flatMarkupCents: dollarsToCents(data.flatMarkup),
      minimumMarginCents: dollarsToCents(data.minimumMargin),
    })
    .returning();
  await writeAudit(profile.id, "tms_client_rate", row.id, `Created client rate ${row.name}`);
  revalidatePath("/");
}

export async function createTmsLoadAction(formData: FormData) {
  const { profile } = await requireUserProfile();
  requireWrite(profile);
  const data = tmsLoadSchema.parse(Object.fromEntries(formData));
  const [row] = await getDb()
    .insert(tmsLoads)
    .values({
      reference: data.reference,
      orderSource: data.orderSource,
      customerId: data.customerId,
      warehouseId: data.warehouseId || null,
      carrierId: data.carrierId || null,
      mode: data.mode,
      status: data.status,
      origin: data.origin,
      destination: data.destination,
      freightClass: data.freightClass,
      weight: toInt(data.weight),
      carrierCostCents: dollarsToCents(data.carrierCost),
      clientChargeCents: dollarsToCents(data.clientCharge),
    })
    .returning();
  await writeAudit(profile.id, "tms_load", row.id, `Created load ${row.reference}`);
  revalidatePath("/");
}

export async function closeLoadAction(formData: FormData) {
  const { profile } = await requireUserProfile();
  requireWrite(profile);
  const id = String(formData.get("id") ?? "");
  const [row] = await getDb().update(tmsLoads).set({ status: "closed" }).where(eq(tmsLoads.id, id)).returning();
  if (row) await writeAudit(profile.id, "tms_load", row.id, `Closed load ${row.reference}`, "update");
  revalidatePath("/");
}

export async function updateReviewerAccessAction(formData: FormData) {
  const { profile } = await requireUserProfile();
  requireAdmin(profile);
  const data = reviewerRoleSchema.parse(Object.fromEntries(formData));
  const [row] = await getDb()
    .update(userProfiles)
    .set({
      role: data.role,
      status: data.status,
      customerIds: data.customerId ? [data.customerId] : [],
      warehouseIds: data.warehouseId ? [data.warehouseId] : [],
    })
    .where(eq(userProfiles.id, data.userId))
    .returning();

  if (row) {
    await writeAudit(profile.id, "user_profile", row.id, `Updated ${row.email || row.name} to ${row.role}`, "role_change");
  }
  revalidatePath("/");
}
