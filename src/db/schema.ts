import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "operator", "viewer", "customer"]);
export const recordStatusEnum = pgEnum("record_status", ["active", "inactive"]);
export const loadStatusEnum = pgEnum("load_status", [
  "draft",
  "quoted",
  "tendered",
  "dispatched",
  "picked_up",
  "in_transit",
  "delivered",
  "closed",
  "exception",
  "canceled",
]);
export const orderSourceEnum = pgEnum("order_source", ["wms", "external"]);
export const freightModeEnum = pgEnum("freight_mode", ["ltl", "ftl", "parcel"]);
export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "import",
  "export",
  "login",
  "role_change",
]);

const id = () => uuid("id").defaultRandom().primaryKey();
const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userProfiles = pgTable(
  "user_profiles",
  {
    id: id(),
    authUserId: text("auth_user_id").notNull(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    role: userRoleEnum("role").default("viewer").notNull(),
    status: recordStatusEnum("status").default("active").notNull(),
    warehouseIds: jsonb("warehouse_ids").$type<string[]>().default([]).notNull(),
    customerIds: jsonb("customer_ids").$type<string[]>().default([]).notNull(),
    ...timestamps(),
  },
  (table) => ({
    authUserIdIdx: uniqueIndex("user_profiles_auth_user_id_idx").on(table.authUserId),
    emailIdx: uniqueIndex("user_profiles_email_idx").on(table.email),
  }),
);

export const warehouses = pgTable(
  "warehouses",
  {
    id: id(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    address: text("address").default("").notNull(),
    city: text("city").default("").notNull(),
    state: text("state").default("").notNull(),
    postalCode: text("postal_code").default("").notNull(),
    status: recordStatusEnum("status").default("active").notNull(),
    ...timestamps(),
  },
  (table) => ({
    codeIdx: uniqueIndex("warehouses_code_idx").on(table.code),
  }),
);

export const customers = pgTable(
  "customers",
  {
    id: id(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    contact: text("contact").default("").notNull(),
    email: text("email").default("").notNull(),
    phone: text("phone").default("").notNull(),
    status: recordStatusEnum("status").default("active").notNull(),
    warehouseIds: jsonb("warehouse_ids").$type<string[]>().default([]).notNull(),
    ...timestamps(),
  },
  (table) => ({
    codeIdx: uniqueIndex("customers_code_idx").on(table.code),
  }),
);

export const skus = pgTable(
  "skus",
  {
    id: id(),
    sku: text("sku").notNull(),
    name: text("name").notNull(),
    customerId: uuid("customer_id").references(() => customers.id),
    length: integer("length").default(0).notNull(),
    width: integer("width").default(0).notNull(),
    height: integer("height").default(0).notNull(),
    weight: integer("weight").default(0).notNull(),
    notes: text("notes").default("").notNull(),
    ...timestamps(),
  },
  (table) => ({
    skuIdx: uniqueIndex("skus_sku_idx").on(table.sku),
  }),
);

export const warehouseBays = pgTable(
  "warehouse_bays",
  {
    id: id(),
    warehouseId: uuid("warehouse_id").references(() => warehouses.id).notNull(),
    code: text("code").notNull(),
    zone: text("zone").default("").notNull(),
    maxPallets: integer("max_pallets").default(0).notNull(),
    maxWeight: integer("max_weight").default(0).notNull(),
    notes: text("notes").default("").notNull(),
    ...timestamps(),
  },
  (table) => ({
    bayWarehouseIdx: uniqueIndex("warehouse_bays_warehouse_code_idx").on(table.warehouseId, table.code),
  }),
);

export const inventoryBalances = pgTable(
  "inventory_balances",
  {
    id: id(),
    warehouseId: uuid("warehouse_id").references(() => warehouses.id).notNull(),
    customerId: uuid("customer_id").references(() => customers.id),
    skuId: uuid("sku_id").references(() => skus.id).notNull(),
    bayId: uuid("bay_id").references(() => warehouseBays.id).notNull(),
    units: integer("units").default(0).notNull(),
    pallets: integer("pallets").default(0).notNull(),
    reservedUnits: integer("reserved_units").default(0).notNull(),
    ...timestamps(),
  },
  (table) => ({
    balanceIdx: uniqueIndex("inventory_balances_unique_idx").on(table.warehouseId, table.skuId, table.bayId),
  }),
);

export const shipments = pgTable("shipments", {
  id: id(),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id),
  customerId: uuid("customer_id").references(() => customers.id),
  reference: text("reference").notNull(),
  status: text("status").default("draft").notNull(),
  origin: text("origin").default("").notNull(),
  destination: text("destination").default("").notNull(),
  carrier: text("carrier").default("").notNull(),
  trackingNumber: text("tracking_number").default("").notNull(),
  invoiceTotalCents: integer("invoice_total_cents").default(0).notNull(),
  internalCostCents: integer("internal_cost_cents").default(0).notNull(),
  notes: text("notes").default("").notNull(),
  internalNotes: text("internal_notes").default("").notNull(),
  ...timestamps(),
});

export const receipts = pgTable("receipts", {
  id: id(),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id),
  customerId: uuid("customer_id").references(() => customers.id),
  reference: text("reference").notNull(),
  status: text("status").default("draft").notNull(),
  supplier: text("supplier").default("").notNull(),
  origin: text("origin").default("").notNull(),
  carrier: text("carrier").default("").notNull(),
  units: integer("units").default(0).notNull(),
  pallets: integer("pallets").default(0).notNull(),
  notes: text("notes").default("").notNull(),
  internalNotes: text("internal_notes").default("").notNull(),
  ...timestamps(),
});

export const pickRequests = pgTable("pick_requests", {
  id: id(),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  reference: text("reference").notNull(),
  status: text("status").default("review").notNull(),
  priority: text("priority").default("standard").notNull(),
  requestedShipDate: text("requested_ship_date").default("").notNull(),
  destination: text("destination").default("").notNull(),
  assignedUserId: uuid("assigned_user_id").references(() => userProfiles.id),
  notes: text("notes").default("").notNull(),
  internalNotes: text("internal_notes").default("").notNull(),
  ...timestamps(),
});

export const pickRequestLines = pgTable("pick_request_lines", {
  id: id(),
  pickRequestId: uuid("pick_request_id").references(() => pickRequests.id).notNull(),
  skuId: uuid("sku_id").references(() => skus.id).notNull(),
  preferredBayId: uuid("preferred_bay_id").references(() => warehouseBays.id),
  quantity: integer("quantity").default(0).notNull(),
  reservedQuantity: integer("reserved_quantity").default(0).notNull(),
  pickedQuantity: integer("picked_quantity").default(0).notNull(),
  status: text("status").default("open").notNull(),
  notes: text("notes").default("").notNull(),
  ...timestamps(),
});

export const kitOrders = pgTable("kit_orders", {
  id: id(),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  reference: text("reference").notNull(),
  status: text("status").default("review").notNull(),
  kitName: text("kit_name").default("").notNull(),
  assignedUserId: uuid("assigned_user_id").references(() => userProfiles.id),
  notes: text("notes").default("").notNull(),
  internalNotes: text("internal_notes").default("").notNull(),
  ...timestamps(),
});

export const kitOrderLines = pgTable("kit_order_lines", {
  id: id(),
  kitOrderId: uuid("kit_order_id").references(() => kitOrders.id).notNull(),
  skuId: uuid("sku_id").references(() => skus.id).notNull(),
  quantity: integer("quantity").default(0).notNull(),
  reservedQuantity: integer("reserved_quantity").default(0).notNull(),
  completedQuantity: integer("completed_quantity").default(0).notNull(),
  ...timestamps(),
});

export const laborEntries = pgTable("labor_entries", {
  id: id(),
  userId: uuid("user_id").references(() => userProfiles.id),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id),
  customerId: uuid("customer_id").references(() => customers.id),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  taskType: text("task_type").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  durationMinutes: integer("duration_minutes").default(0).notNull(),
  billable: boolean("billable").default(false).notNull(),
  rateCents: integer("rate_cents").default(0).notNull(),
  notes: text("notes").default("").notNull(),
  ...timestamps(),
});

export const tmsCarriers = pgTable("tms_carriers", {
  id: id(),
  name: text("name").notNull(),
  scac: text("scac").default("").notNull(),
  modes: jsonb("modes").$type<Array<"ltl" | "ftl" | "parcel">>().default(["ltl"]).notNull(),
  contact: text("contact").default("").notNull(),
  email: text("email").default("").notNull(),
  phone: text("phone").default("").notNull(),
  serviceAreas: text("service_areas").default("").notNull(),
  status: recordStatusEnum("status").default("active").notNull(),
  insurance: text("insurance").default("").notNull(),
  internalNotes: text("internal_notes").default("").notNull(),
  ...timestamps(),
});

export const tmsCarrierRates = pgTable("tms_carrier_rates", {
  id: id(),
  carrierId: uuid("carrier_id").references(() => tmsCarriers.id).notNull(),
  laneName: text("lane_name").notNull(),
  originRegion: text("origin_region").default("").notNull(),
  destinationRegion: text("destination_region").default("").notNull(),
  mode: freightModeEnum("mode").default("ltl").notNull(),
  serviceLevel: text("service_level").default("Standard LTL").notNull(),
  freightClass: text("freight_class").default("70").notNull(),
  minWeight: integer("min_weight").default(0).notNull(),
  maxWeight: integer("max_weight").default(0).notNull(),
  minimumChargeCents: integer("minimum_charge_cents").default(0).notNull(),
  linehaulCentsPerLb: integer("linehaul_cents_per_lb").default(0).notNull(),
  fuelPctBps: integer("fuel_pct_bps").default(0).notNull(),
  accessorialFlatCents: integer("accessorial_flat_cents").default(0).notNull(),
  effectiveFrom: text("effective_from").default("").notNull(),
  effectiveTo: text("effective_to").default("").notNull(),
  internalNotes: text("internal_notes").default("").notNull(),
  ...timestamps(),
});

export const tmsClientRates = pgTable("tms_client_rates", {
  id: id(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  carrierRateId: uuid("carrier_rate_id").references(() => tmsCarrierRates.id),
  name: text("name").notNull(),
  mode: freightModeEnum("mode").default("ltl").notNull(),
  percentMarkupBps: integer("percent_markup_bps").default(0).notNull(),
  flatMarkupCents: integer("flat_markup_cents").default(0).notNull(),
  fuelMarkupBps: integer("fuel_markup_bps").default(0).notNull(),
  accessorialMarkupBps: integer("accessorial_markup_bps").default(0).notNull(),
  minimumMarginCents: integer("minimum_margin_cents").default(0).notNull(),
  effectiveFrom: text("effective_from").default("").notNull(),
  effectiveTo: text("effective_to").default("").notNull(),
  internalNotes: text("internal_notes").default("").notNull(),
  ...timestamps(),
});

export const tmsLoads = pgTable("tms_loads", {
  id: id(),
  reference: text("reference").notNull(),
  orderSource: orderSourceEnum("order_source").default("external").notNull(),
  shipmentId: uuid("shipment_id").references(() => shipments.id),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  carrierId: uuid("carrier_id").references(() => tmsCarriers.id),
  carrierRateId: uuid("carrier_rate_id").references(() => tmsCarrierRates.id),
  clientRateId: uuid("client_rate_id").references(() => tmsClientRates.id),
  mode: freightModeEnum("mode").default("ltl").notNull(),
  status: loadStatusEnum("status").default("draft").notNull(),
  serviceLevel: text("service_level").default("").notNull(),
  proNumber: text("pro_number").default("").notNull(),
  shipper: text("shipper").default("").notNull(),
  origin: text("origin").default("").notNull(),
  consignee: text("consignee").default("").notNull(),
  destination: text("destination").default("").notNull(),
  billTo: text("bill_to").default("").notNull(),
  freightClass: text("freight_class").default("70").notNull(),
  nmfc: text("nmfc").default("").notNull(),
  handlingUnits: integer("handling_units").default(1).notNull(),
  pieces: integer("pieces").default(1).notNull(),
  pallets: integer("pallets").default(0).notNull(),
  weight: integer("weight").default(0).notNull(),
  declaredValueCents: integer("declared_value_cents").default(0).notNull(),
  carrierCostCents: integer("carrier_cost_cents").default(0).notNull(),
  clientChargeCents: integer("client_charge_cents").default(0).notNull(),
  internalNotes: text("internal_notes").default("").notNull(),
  notes: text("notes").default("").notNull(),
  accessorials: jsonb("accessorials").$type<Array<{ name: string; amountCents: number }>>().default([]).notNull(),
  ...timestamps(),
});

export const documents = pgTable("documents", {
  id: id(),
  customerId: uuid("customer_id").references(() => customers.id),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id),
  loadId: uuid("load_id").references(() => tmsLoads.id),
  type: text("type").default("misc").notNull(),
  status: text("status").default("waiting").notNull(),
  title: text("title").notNull(),
  url: text("url").default("").notNull(),
  notes: text("notes").default("").notNull(),
  internalNotes: text("internal_notes").default("").notNull(),
  ...timestamps(),
});

export const documentStages = pgTable("document_stages", {
  id: id(),
  customerId: uuid("customer_id").references(() => customers.id),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id),
  shipmentId: uuid("shipment_id").references(() => shipments.id),
  loadId: uuid("load_id").references(() => tmsLoads.id),
  reference: text("reference").notNull(),
  status: text("status").default("waiting").notNull(),
  requiredDocs: jsonb("required_docs").$type<string[]>().default([]).notNull(),
  receivedDocs: jsonb("received_docs").$type<string[]>().default([]).notNull(),
  softWarnings: jsonb("soft_warnings").$type<string[]>().default([]).notNull(),
  assignedUserId: uuid("assigned_user_id").references(() => userProfiles.id),
  notes: text("notes").default("").notNull(),
  internalNotes: text("internal_notes").default("").notNull(),
  ...timestamps(),
});

export const bols = pgTable("bols", {
  id: id(),
  loadId: uuid("load_id").references(() => tmsLoads.id).notNull(),
  customerId: uuid("customer_id").references(() => customers.id),
  bolNumber: text("bol_number").notNull(),
  status: text("status").default("draft").notNull(),
  shipper: text("shipper").default("").notNull(),
  consignee: text("consignee").default("").notNull(),
  billTo: text("bill_to").default("").notNull(),
  freightLines: jsonb("freight_lines").$type<Array<Record<string, unknown>>>().default([]).notNull(),
  specialInstructions: text("special_instructions").default("").notNull(),
  publicNotes: text("public_notes").default("").notNull(),
  internalNotes: text("internal_notes").default("").notNull(),
  ...timestamps(),
});

export const shipmentSummaries = pgTable("shipment_summaries", {
  id: id(),
  loadId: uuid("load_id").references(() => tmsLoads.id),
  shipmentId: uuid("shipment_id").references(() => shipments.id),
  customerId: uuid("customer_id").references(() => customers.id),
  title: text("title").notNull(),
  visibility: text("visibility").default("customer").notNull(),
  summary: text("summary").default("").notNull(),
  publicData: jsonb("public_data").$type<Record<string, unknown>>().default({}).notNull(),
  internalData: jsonb("internal_data").$type<Record<string, unknown>>().default({}).notNull(),
  ...timestamps(),
});

export const reports = pgTable("reports", {
  id: id(),
  ownerUserId: uuid("owner_user_id").references(() => userProfiles.id),
  customerId: uuid("customer_id").references(() => customers.id),
  name: text("name").notNull(),
  source: text("source").notNull(),
  visibility: text("visibility").default("internal").notNull(),
  definition: jsonb("definition").$type<Record<string, unknown>>().default({}).notNull(),
  ...timestamps(),
});

export const auditLogs = pgTable("audit_logs", {
  id: id(),
  actorUserId: uuid("actor_user_id").references(() => userProfiles.id),
  action: auditActionEnum("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").default("").notNull(),
  detail: text("detail").default("").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type UserProfile = typeof userProfiles.$inferSelect;
export type Warehouse = typeof warehouses.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type TmsLoad = typeof tmsLoads.$inferSelect;
