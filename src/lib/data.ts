import { desc, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
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
  type UserProfile,
} from "@/db/schema";
import { stripInternalLoadFields } from "@/lib/access";

export async function getReviewSnapshot(profile: UserProfile) {
  const db = getDb();
  const isCustomer = profile.role === "customer";
  const scopedCustomers = isCustomer ? profile.customerIds : [];
  const emptyScope = ["00000000-0000-0000-0000-000000000000"];
  const customerIds = scopedCustomers.length ? scopedCustomers : emptyScope;
  const customerWhere = isCustomer ? inArray(customers.id, customerIds) : undefined;
  const loadWhere = isCustomer ? inArray(tmsLoads.customerId, customerIds) : undefined;

  const customerRows = customerWhere
    ? await db.select().from(customers).where(customerWhere).orderBy(customers.name)
    : await db.select().from(customers).orderBy(customers.name);

  const customerWarehouseIds = isCustomer
    ? [
        ...new Set([
          ...profile.warehouseIds,
          ...customerRows.flatMap((customer) => (Array.isArray(customer.warehouseIds) ? customer.warehouseIds : [])),
        ]),
      ]
    : [];
  const warehouseScope = customerWarehouseIds.length ? customerWarehouseIds : emptyScope;

  const [
    warehouseRows,
    carrierRows,
    carrierRateRows,
    clientRateRows,
    loadRows,
    skuRows,
    bayRows,
    shipmentRows,
    userRows,
  ] = await Promise.all([
    isCustomer ? db.select().from(warehouses).where(inArray(warehouses.id, warehouseScope)).orderBy(warehouses.code) : db.select().from(warehouses).orderBy(warehouses.code),
    isCustomer ? Promise.resolve([]) : db.select().from(tmsCarriers).orderBy(tmsCarriers.name),
    isCustomer ? Promise.resolve([]) : db.select().from(tmsCarrierRates).orderBy(tmsCarrierRates.laneName),
    customerWhere
      ? db.select().from(tmsClientRates).where(inArray(tmsClientRates.customerId, customerIds)).orderBy(tmsClientRates.name)
      : db.select().from(tmsClientRates).orderBy(tmsClientRates.name),
    loadWhere ? db.select().from(tmsLoads).where(loadWhere).orderBy(desc(tmsLoads.updatedAt)) : db.select().from(tmsLoads).orderBy(desc(tmsLoads.updatedAt)),
    isCustomer ? db.select().from(skus).where(inArray(skus.customerId, customerIds)).orderBy(skus.sku) : db.select().from(skus).orderBy(skus.sku),
    isCustomer ? db.select().from(warehouseBays).where(inArray(warehouseBays.warehouseId, warehouseScope)).orderBy(warehouseBays.code) : db.select().from(warehouseBays).orderBy(warehouseBays.code),
    isCustomer ? Promise.resolve([]) : db.select().from(shipments).orderBy(desc(shipments.updatedAt)),
    profile.role === "admin" ? db.select().from(userProfiles).orderBy(userProfiles.name) : Promise.resolve([]),
  ]);

  return {
    profile,
    warehouses: warehouseRows,
    customers: customerRows,
    carriers: carrierRows,
    carrierRates: carrierRateRows,
    clientRates: clientRateRows.map((rate) => ({
      id: rate.id,
      customerId: rate.customerId,
      name: rate.name,
      mode: rate.mode,
      effectiveFrom: rate.effectiveFrom,
      effectiveTo: rate.effectiveTo,
      ...(isCustomer
        ? {}
        : {
            carrierRateId: rate.carrierRateId,
            percentMarkupBps: rate.percentMarkupBps,
            flatMarkupCents: rate.flatMarkupCents,
            fuelMarkupBps: rate.fuelMarkupBps,
            accessorialMarkupBps: rate.accessorialMarkupBps,
            minimumMarginCents: rate.minimumMarginCents,
            internalNotes: rate.internalNotes,
          }),
    })),
    loads: isCustomer ? loadRows.map((load) => stripInternalLoadFields(load)) : loadRows,
    skus: skuRows,
    bays: bayRows,
    shipments: shipmentRows,
    users: userRows,
    isBlank:
      warehouseRows.length === 0 &&
      customerRows.length === 0 &&
      skuRows.length === 0 &&
      bayRows.length === 0 &&
      shipmentRows.length === 0 &&
      carrierRows.length === 0 &&
      carrierRateRows.length === 0 &&
      clientRateRows.length === 0 &&
      loadRows.length === 0,
  };
}

export async function getCustomerSafeLoads(profile: UserProfile) {
  const db = getDb();
  const ids = profile.role === "customer" ? profile.customerIds : [];
  if (!ids.length && profile.role === "customer") return [];
  const rows =
    profile.role === "customer"
      ? await db.select().from(tmsLoads).where(inArray(tmsLoads.customerId, ids))
      : await db.select().from(tmsLoads);
  return rows.map((row) => stripInternalLoadFields(row));
}
