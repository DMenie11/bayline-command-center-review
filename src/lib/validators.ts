import { z } from "zod";

const required = z.string().trim().min(1);
const optional = z.string().trim().optional().default("");

export const warehouseSchema = z.object({
  code: required.max(24).transform((value) => value.toUpperCase()),
  name: required.max(120),
  city: optional,
  state: optional.transform((value) => value.toUpperCase()),
});

export const customerSchema = z.object({
  code: required.max(24).transform((value) => value.toUpperCase()),
  name: required.max(160),
  email: optional,
  phone: optional,
});

export const carrierSchema = z.object({
  name: required.max(160),
  scac: optional.transform((value) => value.toUpperCase()),
  serviceAreas: optional,
});

export const skuSchema = z.object({
  sku: required.max(80).transform((value) => value.toUpperCase()),
  name: required.max(160),
  customerId: z.string().uuid().optional().or(z.literal("")),
  length: optional,
  width: optional,
  height: optional,
  weight: optional,
  notes: optional,
});

export const baySchema = z.object({
  warehouseId: required.uuid(),
  code: required.max(80).transform((value) => value.toUpperCase()),
  zone: optional,
  maxPallets: optional,
  maxWeight: optional,
  notes: optional,
});

export const shipmentSchema = z.object({
  reference: required.max(80).transform((value) => value.toUpperCase()),
  warehouseId: z.string().uuid().optional().or(z.literal("")),
  customerId: z.string().uuid().optional().or(z.literal("")),
  status: z.string().trim().optional().default("draft"),
  origin: optional,
  destination: optional,
  carrier: optional,
  invoiceTotal: optional,
  internalCost: optional,
  notes: optional,
});

export const carrierRateSchema = z.object({
  carrierId: required.uuid(),
  laneName: required.max(180),
  originRegion: optional,
  destinationRegion: optional,
  mode: z.enum(["ltl", "ftl", "parcel"]).default("ltl"),
  freightClass: optional.default("70"),
  minimumCharge: optional,
  linehaul: optional,
  fuelPct: optional,
});

export const clientRateSchema = z.object({
  customerId: required.uuid(),
  carrierRateId: z.string().uuid().optional().or(z.literal("")),
  name: required.max(160),
  mode: z.enum(["ltl", "ftl", "parcel"]).default("ltl"),
  percentMarkup: optional,
  flatMarkup: optional,
  minimumMargin: optional,
});

export const tmsLoadSchema = z.object({
  reference: required.max(80).transform((value) => value.toUpperCase()),
  orderSource: z.enum(["wms", "external"]).default("external"),
  customerId: required.uuid(),
  warehouseId: z.string().uuid().optional().or(z.literal("")),
  carrierId: z.string().uuid().optional().or(z.literal("")),
  mode: z.enum(["ltl", "ftl", "parcel"]).default("ltl"),
  status: z
    .enum(["draft", "quoted", "tendered", "dispatched", "picked_up", "in_transit", "delivered", "closed", "exception", "canceled"])
    .default("draft"),
  origin: optional,
  destination: optional,
  freightClass: optional.default("70"),
  weight: optional,
  carrierCost: optional,
  clientCharge: optional,
});

export const reviewerRoleSchema = z.object({
  userId: required.uuid(),
  role: z.enum(["admin", "operator", "viewer", "customer"]),
  status: z.enum(["active", "inactive"]).default("active"),
  customerId: z.string().uuid().optional().or(z.literal("")),
  warehouseId: z.string().uuid().optional().or(z.literal("")),
});
