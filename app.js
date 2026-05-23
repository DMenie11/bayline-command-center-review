const STORAGE_KEY = "bayline-wms-state-v1";
const STATE_VERSION = 1;
const DEFAULT_WAREHOUSE_ID = "WH-MAIN";

const PICK_STATUSES = {
  requested: "Requested",
  review: "In Review",
  reserved: "Reserved",
  picking: "Picking",
  exception: "Exception",
  picked: "Picked",
  packed: "Packed",
  shipped: "Shipped",
  closed: "Closed",
  canceled: "Canceled",
};

const LABOR_TASK_TYPES = {
  receiving: "Receiving",
  picking: "Picking",
  packing: "Packing",
  staging: "Staging",
  shipping: "Shipping",
  exception: "Exception",
  kitting: "Kitting",
  docs: "Document Review",
  admin: "Admin Adjustment",
};

const ORDER_TYPES = {
  receipt: "Inbound Receipt",
  shipment: "Outbound Shipment",
  pick: "Pick Request",
  kit: "Kit Order",
  document: "Document Stage",
  admin: "Admin",
};

const DOCUMENT_STATUSES = {
  waiting: "Waiting",
  missing_docs: "Missing Docs",
  received: "Received",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
  released: "Released",
};

const TMS_MODES = {
  ltl: "LTL",
  ftl: "FTL",
  parcel: "Parcel",
};

const TMS_LOAD_STATUSES = {
  draft: "Draft",
  quoted: "Quoted",
  tendered: "Tendered",
  dispatched: "Dispatched",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  delivered: "Delivered",
  closed: "Closed",
  exception: "Exception",
  canceled: "Canceled",
};

const FREIGHT_CLASSES = ["50", "55", "60", "65", "70", "77.5", "85", "92.5", "100", "110", "125", "150", "175", "200", "250", "300", "400", "500"];

const ROADMAP_ITEMS = [
  "Barcode scanning",
  "Cycle counts",
  "ASN receiving",
  "Inventory adjustments",
  "Replenishment",
  "Wave picking",
  "EDI/API integrations",
  "Accounting sync",
  "Carrier labels",
  "Customer portal",
  "Document center",
  "Live alerts",
  "Analytics",
  "AI-assisted reporting",
  "Shared Vercel database",
  "Role-backed user accounts",
  "Labor productivity KPIs",
  "Document staging automation",
  "LTL rating engine",
  "Customer TMS portal",
  "BOL document automation",
  "Carrier tender APIs",
];

const CARRIER_CATALOG = {
  ups: {
    name: "UPS",
    trackingPrefix: "1Z",
    trackingUrl: (tracking) => `https://www.ups.com/track?tracknum=${encodeURIComponent(tracking)}`,
    services: [
      { code: "ground", label: "Ground", multiplier: 1 },
      { code: "three-day", label: "3 Day Select", multiplier: 1.35 },
      { code: "next-day", label: "Next Day Air", multiplier: 2.2 },
    ],
  },
  fedex: {
    name: "FedEx",
    trackingPrefix: "FDX",
    trackingUrl: (tracking) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(tracking)}`,
    services: [
      { code: "ground", label: "Ground", multiplier: 1.05 },
      { code: "express-saver", label: "Express Saver", multiplier: 1.45 },
      { code: "priority-overnight", label: "Priority Overnight", multiplier: 2.35 },
    ],
  },
  usps: {
    name: "USPS",
    trackingPrefix: "9400",
    trackingUrl: (tracking) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(tracking)}`,
    services: [
      { code: "ground-advantage", label: "Ground Advantage", multiplier: 0.82 },
      { code: "priority-mail", label: "Priority Mail", multiplier: 1.15 },
      { code: "priority-express", label: "Priority Mail Express", multiplier: 2.05 },
    ],
  },
};

const emptyState = () => ({
  version: STATE_VERSION,
  warehouses: [defaultWarehouse()],
  selectedWarehouseId: "",
  skus: [],
  bays: [],
  inventory: [],
  receipts: [],
  shipments: [],
  customReports: [],
  customers: [],
  customerLeases: [],
  kitTemplates: [],
  kitOrders: [],
  pickRequests: [],
  pickReservations: [],
  reservations: [],
  users: [],
  laborEntries: [],
  documentStages: [],
  tmsCarriers: [],
  tmsCarrierRates: [],
  tmsClientRates: [],
  tmsLoads: [],
  kpiSnapshots: [],
  financialExports: [],
  auditLog: [],
  pickSettings: defaultPickSettings(),
  currentUserRole: "admin",
  warehouseLocation: defaultWarehouseLocation(),
  carrierSettings: defaultCarrierSettings(),
  appearance: defaultAppearance(),
});

const demoState = () => ({
  version: STATE_VERSION,
  warehouses: [
    {
      id: DEFAULT_WAREHOUSE_ID,
      code: "MAIN",
      name: "Main Warehouse",
      address: "100 Distribution Way",
      city: "Columbus",
      state: "OH",
      postalCode: "43215",
      lat: 39.9612,
      lng: -82.9988,
      status: "active",
      storageRate: 2.5,
      handlingRate: 8,
      notes: "Primary central Ohio warehouse",
    },
    {
      id: "WH-EAST",
      code: "EAST",
      name: "East Crossdock",
      address: "4100 Harbor Road",
      city: "Pittsburgh",
      state: "PA",
      postalCode: "15222",
      lat: 40.4406,
      lng: -79.9959,
      status: "active",
      storageRate: 2.25,
      handlingRate: 7.5,
      notes: "Regional outbound and overflow storage",
    },
  ],
  selectedWarehouseId: "",
  skus: [
    {
      sku: "DRY-1001",
      name: "Dry Goods Case",
      length: 18,
      width: 14,
      height: 12,
      weight: 22,
      warehouseIds: [DEFAULT_WAREHOUSE_ID, "WH-EAST"],
      notes: "Shelf-stable outbound case",
    },
    {
      sku: "CHL-2200",
      name: "Chilled Tote",
      length: 24,
      width: 16,
      height: 14,
      weight: 31,
      warehouseIds: [DEFAULT_WAREHOUSE_ID],
      notes: "Temperature controlled tote",
    },
    {
      sku: "BULK-450",
      name: "Bulk Ingredient Bag",
      length: 32,
      width: 20,
      height: 6,
      weight: 48,
      warehouseIds: [DEFAULT_WAREHOUSE_ID, "WH-EAST"],
      notes: "Bagged pallet stock",
    },
  ],
  bays: [
    {
      warehouseId: DEFAULT_WAREHOUSE_ID,
      code: "A-01",
      zone: "Aisle A",
      maxPallets: 12,
      maxWeight: 16000,
      length: 96,
      width: 48,
      height: 120,
      notes: "Primary dry storage",
    },
    {
      warehouseId: DEFAULT_WAREHOUSE_ID,
      code: "B-04",
      zone: "Aisle B",
      maxPallets: 10,
      maxWeight: 14000,
      length: 96,
      width: 48,
      height: 110,
      notes: "Fast moving pick bay",
    },
    {
      warehouseId: DEFAULT_WAREHOUSE_ID,
      code: "COLD-2",
      zone: "Cold Room",
      maxPallets: 8,
      maxWeight: 10000,
      length: 96,
      width: 48,
      height: 96,
      notes: "Chilled storage",
    },
    {
      warehouseId: "WH-EAST",
      code: "A-01",
      zone: "East Aisle",
      maxPallets: 14,
      maxWeight: 18000,
      length: 96,
      width: 48,
      height: 120,
      notes: "Same bay code in a different warehouse",
    },
  ],
  inventory: [
    { warehouseId: DEFAULT_WAREHOUSE_ID, sku: "DRY-1001", bayCode: "A-01", units: 240, pallets: 6 },
    { warehouseId: DEFAULT_WAREHOUSE_ID, sku: "BULK-450", bayCode: "B-04", units: 80, pallets: 5 },
    { warehouseId: DEFAULT_WAREHOUSE_ID, sku: "CHL-2200", bayCode: "COLD-2", units: 96, pallets: 4 },
    { warehouseId: "WH-EAST", sku: "DRY-1001", bayCode: "A-01", units: 120, pallets: 3 },
  ],
  receipts: [
    {
      id: "REC-DEMO-1",
      date: "2026-05-18",
      warehouseId: DEFAULT_WAREHOUSE_ID,
      sku: "DRY-1001",
      bayCode: "A-01",
      units: 240,
      pallets: 6,
      reference: "IN-10027",
      customerId: "CUST-DEMO-1",
      primaryUserId: "USER-DEMO-1",
      assignedUserIds: ["USER-DEMO-1"],
      origin: "Springfield Supplier",
      routeEvents: makeRouteEvents("Springfield Supplier", "Main Warehouse", "Inbound", null, defaultWarehouseLocation()),
      notes: "Demo receipt",
    },
    {
      id: "REC-DEMO-2",
      date: "2026-05-19",
      warehouseId: DEFAULT_WAREHOUSE_ID,
      sku: "CHL-2200",
      bayCode: "COLD-2",
      units: 144,
      pallets: 6,
      reference: "IN-10031",
      customerId: "CUST-DEMO-2",
      primaryUserId: "USER-DEMO-2",
      assignedUserIds: ["USER-DEMO-2"],
      origin: "Cold Chain Supplier",
      routeEvents: makeRouteEvents("Cold Chain Supplier", "Main Warehouse", "Inbound", null, defaultWarehouseLocation()),
      notes: "Demo receipt",
    },
  ],
  shipments: [
    {
      id: "SHP-DEMO-1",
      date: "2026-05-20",
      warehouseId: DEFAULT_WAREHOUSE_ID,
      sku: "CHL-2200",
      bayCode: "COLD-2",
      units: 48,
      pallets: 2,
      reference: "OUT-9902",
      customerId: "CUST-DEMO-2",
      primaryUserId: "USER-DEMO-2",
      assignedUserIds: ["USER-DEMO-2"],
      origin: "Main Warehouse",
      destination: "North Dock",
      routeEvents: makeRouteEvents("Main Warehouse", "North Dock", "Outbound", defaultWarehouseLocation()),
      miles: 42,
      carrier: "ups",
      service: "ground",
      packageCount: 2,
      package: { length: 24, width: 18, height: 16 },
      shipTo: {
        name: "North Dock Receiving",
        address: "100 Market Street",
        city: "Columbus",
        state: "OH",
        postalCode: "43215",
      },
      declaredValue: 1200,
      rateEstimate: 418.75,
      carrierStatus: "Submitted",
      trackingNumber: "1Z867530900000001",
      carrierSubmittedAt: "2026-05-20",
      freightCharge: 325,
      fuelCharge: 48.75,
      accessorials: [{ name: "Liftgate", amount: 45 }],
      notes: "Demo shipment",
      totalWeight: 1488,
      invoiceTotal: 418.75,
    },
  ],
  customReports: [
    {
      id: "RPT-DEMO-1",
      name: "Outbound Billing Summary",
      source: "shipments",
      filters: { warehouse: "", sku: "", bay: "", from: "", to: "" },
      fields: ["date", "reference", "warehouse", "origin", "destination", "sku", "units", "miles", "invoiceTotal"],
      createdAt: "2026-05-20",
    },
  ],
  customers: [
    {
      id: "CUST-DEMO-1",
      code: "ACME",
      name: "Acme Retail",
      contact: "Receiving Team",
      email: "receiving@example.com",
      phone: "555-0100",
      warehouseIds: [DEFAULT_WAREHOUSE_ID, "WH-EAST"],
      skuLinks: ["DRY-1001", "BULK-450"],
      bayLinks: [`${DEFAULT_WAREHOUSE_ID}::A-01`, `${DEFAULT_WAREHOUSE_ID}::B-04`, "WH-EAST::A-01"],
      kitFee: 8,
      storageRate: 2.5,
    },
    {
      id: "CUST-DEMO-2",
      code: "NORTH",
      name: "North Dock Foods",
      contact: "Ops Desk",
      email: "ops@example.com",
      phone: "555-0200",
      warehouseIds: [DEFAULT_WAREHOUSE_ID],
      skuLinks: ["CHL-2200"],
      bayLinks: [`${DEFAULT_WAREHOUSE_ID}::COLD-2`],
      kitFee: 11,
      storageRate: 3,
    },
  ],
  customerLeases: [
    {
      id: "LEASE-DEMO-1",
      customerId: "CUST-DEMO-1",
      warehouseId: DEFAULT_WAREHOUSE_ID,
      bayKeys: [`${DEFAULT_WAREHOUSE_ID}::A-01`, `${DEFAULT_WAREHOUSE_ID}::B-04`],
      startDate: "2026-05-01",
      endDate: "",
      monthlyRate: 1850,
      palletAllowance: 8,
      sqftAllowance: 64,
      weightAllowance: 20000,
      palletOverageRate: 18,
      sqftOverageRate: 1.25,
      weightOverageRate: 0.02,
      status: "active",
      notes: "Hybrid lease for dry storage",
    },
    {
      id: "LEASE-DEMO-2",
      customerId: "CUST-DEMO-2",
      warehouseId: DEFAULT_WAREHOUSE_ID,
      bayKeys: [`${DEFAULT_WAREHOUSE_ID}::COLD-2`],
      startDate: "2026-05-01",
      endDate: "",
      monthlyRate: 1250,
      palletAllowance: 4,
      sqftAllowance: 32,
      weightAllowance: 10000,
      palletOverageRate: 24,
      sqftOverageRate: 1.75,
      weightOverageRate: 0.03,
      status: "active",
      notes: "Cold room lease",
    },
  ],
  users: [
    {
      id: "USER-DEMO-1",
      authUserId: "clerk_demo_taylor",
      name: "Taylor Brooks",
      role: "operator",
      status: "active",
      warehouseIds: [DEFAULT_WAREHOUSE_ID, "WH-EAST"],
      contact: "taylor@example.com",
    },
    {
      id: "USER-DEMO-2",
      authUserId: "",
      name: "Jordan Lee",
      role: "operator",
      status: "active",
      warehouseIds: [DEFAULT_WAREHOUSE_ID],
      contact: "jordan@example.com",
    },
    {
      id: "USER-DEMO-3",
      authUserId: "clerk_demo_admin",
      name: "Admin Desk",
      role: "admin",
      status: "active",
      warehouseIds: [DEFAULT_WAREHOUSE_ID, "WH-EAST"],
      contact: "admin@example.com",
    },
  ],
  laborEntries: [
    {
      id: "LAB-DEMO-1",
      userId: "USER-DEMO-1",
      warehouseId: DEFAULT_WAREHOUSE_ID,
      customerId: "CUST-DEMO-1",
      orderType: "receipt",
      orderId: "REC-DEMO-1",
      taskType: "receiving",
      startTime: "2026-05-18T08:00",
      endTime: "2026-05-18T09:15",
      hours: 1.25,
      billable: true,
      rate: 42,
      notes: "Inbound unload and putaway",
      createdAt: "2026-05-18",
    },
    {
      id: "LAB-DEMO-2",
      userId: "USER-DEMO-2",
      warehouseId: DEFAULT_WAREHOUSE_ID,
      customerId: "CUST-DEMO-2",
      orderType: "shipment",
      orderId: "SHP-DEMO-1",
      taskType: "shipping",
      startTime: "2026-05-20T13:15",
      endTime: "2026-05-20T14:00",
      hours: 0.75,
      billable: true,
      rate: 42,
      notes: "Outbound prep and carrier handoff",
      createdAt: "2026-05-20",
    },
  ],
  documentStages: [
    {
      id: "DOC-DEMO-1",
      warehouseId: DEFAULT_WAREHOUSE_ID,
      customerId: "CUST-DEMO-2",
      orderType: "shipment",
      orderId: "SHP-DEMO-1",
      reference: "OUT-9902",
      status: "missing_docs",
      assignedUserId: "USER-DEMO-2",
      requiredDocs: ["BOL", "POD", "Invoice"],
      receivedDocs: ["BOL-9902.pdf"],
      notes: "Waiting on POD before billing packet is released",
      createdAt: "2026-05-20",
      updatedAt: "2026-05-20",
    },
  ],
  tmsCarriers: [
    {
      id: "TMSC-DEMO-1",
      name: "Buckeye Freight Lines",
      scac: "BKYE",
      modes: ["ltl", "ftl"],
      contact: "Dispatch Desk",
      email: "dispatch@buckeyefreight.example",
      phone: "555-0300",
      serviceAreas: "OH, PA, IN, MI",
      status: "active",
      insurance: "Cargo $250k / Auto $1M",
      notes: "Preferred Midwest LTL partner",
    },
    {
      id: "TMSC-DEMO-2",
      name: "ParcelPro National",
      scac: "PCLP",
      modes: ["parcel", "ltl"],
      contact: "Account Team",
      email: "account@parcelpro.example",
      phone: "555-0400",
      serviceAreas: "National parcel and deferred LTL",
      status: "active",
      insurance: "Cargo $100k / Auto $1M",
      notes: "Good parcel overflow option",
    },
  ],
  tmsCarrierRates: [
    {
      id: "TMSR-DEMO-1",
      carrierId: "TMSC-DEMO-1",
      laneName: "Columbus OH to Pittsburgh PA",
      originRegion: "OH",
      destinationRegion: "PA",
      mode: "ltl",
      serviceLevel: "Standard LTL",
      freightClass: "70",
      minWeight: 0,
      maxWeight: 4999,
      minimumCharge: 185,
      linehaul: 0.48,
      fuelPct: 18,
      accessorialFlat: 55,
      effectiveFrom: "2026-05-01",
      effectiveTo: "",
      notes: "Demo tariff lane",
    },
    {
      id: "TMSR-DEMO-2",
      carrierId: "TMSC-DEMO-2",
      laneName: "Columbus OH to National Parcel",
      originRegion: "OH",
      destinationRegion: "US",
      mode: "parcel",
      serviceLevel: "Ground Parcel",
      freightClass: "100",
      minWeight: 0,
      maxWeight: 150,
      minimumCharge: 24,
      linehaul: 0.92,
      fuelPct: 14,
      accessorialFlat: 12,
      effectiveFrom: "2026-05-01",
      effectiveTo: "",
      notes: "Parcel fallback rate",
    },
  ],
  tmsClientRates: [
    {
      id: "TMSCR-DEMO-1",
      customerId: "CUST-DEMO-1",
      name: "Acme LTL Standard",
      mode: "ltl",
      rateId: "TMSR-DEMO-1",
      percentMarkup: 18,
      flatMarkup: 35,
      fuelMarkupPct: 3,
      accessorialMarkupPct: 12,
      minimumMargin: 75,
      effectiveFrom: "2026-05-01",
      effectiveTo: "",
      notes: "Customer-facing LTL pricing",
    },
    {
      id: "TMSCR-DEMO-2",
      customerId: "CUST-DEMO-2",
      name: "North Dock Parcel Plus",
      mode: "parcel",
      rateId: "TMSR-DEMO-2",
      percentMarkup: 12,
      flatMarkup: 18,
      fuelMarkupPct: 2,
      accessorialMarkupPct: 8,
      minimumMargin: 25,
      effectiveFrom: "2026-05-01",
      effectiveTo: "",
      notes: "Parcel-facing customer profile",
    },
  ],
  tmsLoads: [
    {
      id: "TMSL-DEMO-1",
      reference: "LOAD-7001",
      orderType: "wms",
      shipmentId: "SHP-DEMO-1",
      customerId: "CUST-DEMO-2",
      warehouseId: DEFAULT_WAREHOUSE_ID,
      carrierId: "TMSC-DEMO-1",
      carrierRateId: "TMSR-DEMO-1",
      clientRateId: "TMSCR-DEMO-2",
      mode: "ltl",
      status: "in_transit",
      serviceLevel: "Standard LTL",
      shipDate: "2026-05-20",
      deliveryDate: "2026-05-22",
      proNumber: "BKYE392881",
      shipper: "Main Warehouse",
      origin: "Columbus, OH",
      consignee: "North Dock Foods",
      destination: "Columbus, OH",
      billTo: "North Dock Foods",
      freightClass: "70",
      nmfc: "156600",
      handlingUnits: 2,
      pieces: 48,
      pallets: 2,
      weight: 1488,
      length: 48,
      width: 40,
      height: 54,
      hazmat: false,
      stackable: true,
      accessorials: [{ name: "Liftgate", amount: 45 }],
      declaredValue: 1200,
      carrierCost: 431.34,
      clientCharge: 534.12,
      notes: "Created from WMS outbound shipment",
      internalNotes: "Keep margin above $75",
      createdAt: "2026-05-20",
    },
    {
      id: "TMSL-DEMO-2",
      reference: "EXT-4108",
      orderType: "external",
      shipmentId: "",
      customerId: "CUST-DEMO-1",
      warehouseId: "WH-EAST",
      carrierId: "TMSC-DEMO-1",
      carrierRateId: "TMSR-DEMO-1",
      clientRateId: "TMSCR-DEMO-1",
      mode: "ltl",
      status: "quoted",
      serviceLevel: "Standard LTL",
      shipDate: "2026-05-24",
      deliveryDate: "",
      proNumber: "",
      shipper: "Third Party Warehouse",
      origin: "Pittsburgh, PA",
      consignee: "Acme Store 42",
      destination: "Erie, PA",
      billTo: "Acme Retail",
      freightClass: "100",
      nmfc: "999923",
      handlingUnits: 3,
      pieces: 60,
      pallets: 3,
      weight: 2100,
      length: 48,
      width: 40,
      height: 60,
      hazmat: false,
      stackable: false,
      accessorials: [{ name: "Residential", amount: 65 }],
      declaredValue: 2500,
      carrierCost: 1258.4,
      clientCharge: 1594.91,
      notes: "External order, no WMS inventory movement",
      internalNotes: "Confirm appointment before tendering",
      createdAt: "2026-05-21",
    },
  ],
  kitTemplates: [
    {
      id: "KIT-DEMO-1",
      warehouseId: DEFAULT_WAREHOUSE_ID,
      customerId: "CUST-DEMO-1",
      name: "Retail Dry Starter",
      lines: [
        { sku: "DRY-1001", quantity: 3 },
        { sku: "BULK-450", quantity: 1 },
      ],
    },
  ],
  kitOrders: [
    {
      id: "KO-DEMO-1",
      warehouseId: DEFAULT_WAREHOUSE_ID,
      customerId: "CUST-DEMO-1",
      templateId: "KIT-DEMO-1",
      reference: "KIT-1001",
      status: "review",
      lines: [
        { sku: "DRY-1001", quantity: 3 },
        { sku: "BULK-450", quantity: 1 },
      ],
      reservations: [],
      createdAt: "2026-05-20",
    },
  ],
  pickRequests: [
    {
      id: "PICK-DEMO-1",
      reference: "PICK-2401",
      source: "customer",
      customerId: "CUST-DEMO-1",
      warehouseId: DEFAULT_WAREHOUSE_ID,
      priority: "rush",
      requestedShipDate: "2026-05-23",
      destination: "Acme Store 18",
      carrierPreference: "ups",
      assignedPicker: "Taylor",
      primaryUserId: "USER-DEMO-1",
      assignedUserIds: ["USER-DEMO-1"],
      status: "reserved",
      pickFee: 27,
      laborCharge: 42,
      notes: "Customer portal request",
      attachments: ["order-2401.csv"],
      createdAt: "2026-05-20",
      approvedAt: "2026-05-20",
      packedAt: "",
      shippedAt: "",
      closedAt: "",
      lines: [
        {
          id: "PICK-LINE-DEMO-1",
          sku: "DRY-1001",
          quantity: 12,
          preferredBay: "A-01",
          reservedQuantity: 12,
          pickedQuantity: 0,
          shortQuantity: 0,
          substitutionNote: "",
          status: "reserved",
        },
      ],
      exceptions: [],
      packingRecord: null,
      shipmentId: "",
    },
  ],
  pickReservations: [
    {
      id: "PRES-DEMO-1",
      pickRequestId: "PICK-DEMO-1",
      lineId: "PICK-LINE-DEMO-1",
      customerId: "CUST-DEMO-1",
      warehouseId: DEFAULT_WAREHOUSE_ID,
      sku: "DRY-1001",
      bayCode: "A-01",
      quantity: 12,
      status: "reserved",
    },
  ],
  reservations: [],
  kpiSnapshots: [],
  financialExports: [],
  auditLog: [],
  pickSettings: defaultPickSettings(),
  currentUserRole: "admin",
  warehouseLocation: defaultWarehouseLocation(),
  carrierSettings: {
    mode: "demo",
    backendUrl: "",
    accounts: { ups: "UPS-DEMO", fedex: "FDX-DEMO", usps: "USPS-DEMO" },
  },
  appearance: defaultAppearance(),
});

let state = loadState();
let activeView = "dashboard";
let activeArm = "wms";
let toastTimer;
let activeCustomReport = null;
let selectedInvoiceId = null;
let selectedPickRequestId = null;
let activeAdminTab = "finance";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return emptyState();
    const parsed = JSON.parse(saved);
    if (!parsed || parsed.version !== STATE_VERSION) return emptyState();
    return normalizeState(parsed);
  } catch {
    return emptyState();
  }
}

function saveState(message = "Saved") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  $("#saveStatus").textContent = message;
}

function normalizeState(raw) {
  const fallback = emptyState();
  const warehouses = (Array.isArray(raw.warehouses) && raw.warehouses.length ? raw.warehouses : [defaultWarehouse()])
    .map(normalizeWarehouse)
    .filter((warehouse) => warehouse.id && warehouse.code && warehouse.name);
  if (!warehouses.some((warehouse) => warehouse.id === DEFAULT_WAREHOUSE_ID)) {
    warehouses.unshift(defaultWarehouse());
  }
  const warehouseIds = new Set(warehouses.map((warehouse) => warehouse.id));
  const ensureWarehouseId = (value) => (warehouseIds.has(value) ? value : warehouses[0].id);
  const normalizeWarehouseList = (values) => {
    const ids = Array.isArray(values) ? values.map(cleanText).filter((id) => warehouseIds.has(id)) : [];
    return ids.length ? [...new Set(ids)] : [warehouses[0].id];
  };

  const skus = (Array.isArray(raw.skus) ? raw.skus : []).map((sku) => ({
    ...sku,
    sku: normalizeCode(sku.sku),
    name: cleanText(sku.name),
    length: toNumber(sku.length),
    width: toNumber(sku.width),
    height: toNumber(sku.height),
    weight: toNumber(sku.weight),
    warehouseIds: normalizeWarehouseList(sku.warehouseIds),
    notes: cleanText(sku.notes),
  }));
  const bays = (Array.isArray(raw.bays) ? raw.bays : []).map((bay) => normalizeBay(bay, ensureWarehouseId));
  const bayKeys = new Set(bays.map((bay) => bayKey(bay.warehouseId, bay.code)));
  const normalizeWarehouseRecord = (row) => ({
    ...row,
    warehouseId: ensureWarehouseId(row.warehouseId),
  });

  const next = {
    ...fallback,
    ...raw,
    version: STATE_VERSION,
    warehouses,
    selectedWarehouseId: warehouseIds.has(raw.selectedWarehouseId) ? raw.selectedWarehouseId : "",
    skus,
    bays,
    inventory: (Array.isArray(raw.inventory) ? raw.inventory : []).map((row) => ({
      warehouseId: ensureWarehouseId(row.warehouseId),
      sku: normalizeCode(row.sku),
      bayCode: normalizeCode(row.bayCode),
      units: toInteger(row.units),
      pallets: toInteger(row.pallets),
    })),
    users: (Array.isArray(raw.users) ? raw.users : []).map((user) =>
      normalizeUserProfile({ ...user, warehouseIds: normalizeWarehouseList(user.warehouseIds) })
    ),
    receipts: (Array.isArray(raw.receipts) ? raw.receipts : []).map((receipt) => normalizeReceipt(normalizeWarehouseRecord(receipt))),
    shipments: (Array.isArray(raw.shipments) ? raw.shipments : []).map((shipment) => normalizeShipment(normalizeWarehouseRecord(shipment))),
    customReports: Array.isArray(raw.customReports) ? raw.customReports : [],
    customers: (Array.isArray(raw.customers) ? raw.customers : []).map((customer) =>
      normalizeCustomer({
        ...customer,
        warehouseIds: normalizeWarehouseList(customer.warehouseIds),
        bayLinks: Array.isArray(customer.bayLinks)
          ? customer.bayLinks.map((link) => normalizeBayLink(link, warehouses[0].id)).filter((link) => !bayKeys.size || bayKeys.has(link))
          : [],
      })
    ),
    customerLeases: (Array.isArray(raw.customerLeases) ? raw.customerLeases : []).map((lease) =>
      normalizeLease({ ...lease, warehouseId: ensureWarehouseId(lease.warehouseId) })
    ),
    kitTemplates: (Array.isArray(raw.kitTemplates) ? raw.kitTemplates : []).map((template) =>
      normalizeKitTemplate({ ...template, warehouseId: ensureWarehouseId(template.warehouseId) })
    ),
    kitOrders: (Array.isArray(raw.kitOrders) ? raw.kitOrders : []).map((order) =>
      normalizeKitOrder({ ...order, warehouseId: ensureWarehouseId(order.warehouseId) })
    ),
    pickRequests: (Array.isArray(raw.pickRequests) ? raw.pickRequests : []).map((request) =>
      normalizePickRequest({ ...request, warehouseId: ensureWarehouseId(request.warehouseId) })
    ),
    laborEntries: (Array.isArray(raw.laborEntries) ? raw.laborEntries : []).map((entry) =>
      normalizeLaborEntry({ ...entry, warehouseId: ensureWarehouseId(entry.warehouseId) })
    ),
    documentStages: (Array.isArray(raw.documentStages) ? raw.documentStages : []).map((stage) =>
      normalizeDocumentStage({ ...stage, warehouseId: ensureWarehouseId(stage.warehouseId) })
    ),
    tmsCarriers: (Array.isArray(raw.tmsCarriers) ? raw.tmsCarriers : []).map(normalizeTmsCarrier),
    tmsCarrierRates: (Array.isArray(raw.tmsCarrierRates) ? raw.tmsCarrierRates : []).map(normalizeTmsCarrierRate),
    tmsClientRates: (Array.isArray(raw.tmsClientRates) ? raw.tmsClientRates : []).map(normalizeTmsClientRate),
    tmsLoads: (Array.isArray(raw.tmsLoads) ? raw.tmsLoads : []).map((load) =>
      normalizeTmsLoad({ ...load, warehouseId: ensureWarehouseId(load.warehouseId) })
    ),
    pickReservations: (Array.isArray(raw.pickReservations) ? raw.pickReservations : []).map((reservation) => ({
      ...reservation,
      warehouseId: ensureWarehouseId(reservation.warehouseId),
      bayCode: normalizeCode(reservation.bayCode),
      sku: normalizeCode(reservation.sku),
      quantity: toInteger(reservation.quantity),
      status: reservation.status || "reserved",
    })),
    reservations: (Array.isArray(raw.reservations) ? raw.reservations : []).map((reservation) => ({
      ...reservation,
      warehouseId: ensureWarehouseId(reservation.warehouseId),
      bayCode: normalizeCode(reservation.bayCode),
      sku: normalizeCode(reservation.sku),
      quantity: toInteger(reservation.quantity),
      status: reservation.status || "reserved",
    })),
    financialExports: Array.isArray(raw.financialExports) ? raw.financialExports : [],
    kpiSnapshots: Array.isArray(raw.kpiSnapshots) ? raw.kpiSnapshots : [],
    auditLog: Array.isArray(raw.auditLog) ? raw.auditLog : [],
    pickSettings: normalizePickSettings(raw.pickSettings),
    currentUserRole: raw.currentUserRole || "admin",
    warehouseLocation: normalizeLocation(raw.warehouseLocation || defaultWarehouseLocation()),
    carrierSettings: normalizeCarrierSettings(raw.carrierSettings),
    appearance: normalizeAppearance(raw.appearance),
  };
  return next;
}

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase();
}

function cleanText(value) {
  return String(value || "").trim();
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function toInteger(value) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value || 0);
}

function formatWeight(value) {
  return `${formatNumber(value || 0)} lb`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

function formatDimensions(record) {
  const values = [record.length, record.width, record.height].map((value) => Number(value) || 0);
  return values.some(Boolean) ? `${values.map(formatNumber).join(" x ")} in` : "-";
}

function defaultWarehouse() {
  const location = defaultWarehouseLocation();
  return {
    id: DEFAULT_WAREHOUSE_ID,
    code: "MAIN",
    name: location.name,
    address: "",
    city: "Columbus",
    state: "OH",
    postalCode: "",
    lat: location.lat,
    lng: location.lng,
    status: "active",
    storageRate: 0,
    handlingRate: 0,
    notes: "",
  };
}

function defaultWarehouseLocation() {
  return { name: "Main Warehouse", lat: 39.9612, lng: -82.9988 };
}

function normalizeLocation(location) {
  const fallback = defaultWarehouseLocation();
  return {
    name: cleanText(location?.name) || fallback.name,
    lat: Number.isFinite(Number(location?.lat)) ? Number(location.lat) : fallback.lat,
    lng: Number.isFinite(Number(location?.lng)) ? Number(location.lng) : fallback.lng,
  };
}

function hashLocation(name) {
  const label = cleanText(name) || "Unknown";
  let hash = 0;
  for (const char of label) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return {
    name: label,
    lat: 25 + (hash % 2200) / 100,
    lng: -124 + ((hash >> 8) % 5600) / 100,
  };
}

function makeRouteEvents(originName, destinationName, mode, originLocation, destinationLocation) {
  const origin = originLocation?.lat && originLocation?.lng ? normalizeLocation(originLocation) : hashLocation(originName);
  const destination =
    destinationLocation?.lat && destinationLocation?.lng
      ? normalizeLocation(destinationLocation)
      : cleanText(destinationName).toLowerCase().includes("warehouse") || cleanText(destinationName).toLowerCase().includes("main")
      ? normalizeLocation(defaultWarehouseLocation())
      : hashLocation(destinationName);
  const midpoint = {
    name: `${mode} Checkpoint`,
    lat: (origin.lat + destination.lat) / 2 + 0.7,
    lng: (origin.lng + destination.lng) / 2 - 0.4,
  };
  return [
    { label: `${mode} Origin`, location: origin.name, lat: origin.lat, lng: origin.lng, timestamp: todayISO() },
    { label: "In Transit", location: midpoint.name, lat: midpoint.lat, lng: midpoint.lng, timestamp: todayISO() },
    { label: `${mode} Destination`, location: destination.name, lat: destination.lat, lng: destination.lng, timestamp: todayISO() },
  ];
}

function defaultAppearance() {
  return {
    appName: "BayLine Command Center",
    initials: "BL",
    primaryColor: "#2364aa",
    navColor: "#111827",
    accentColor: "#f2b84b",
    pageColor: "#f4f6f8",
    density: "comfortable",
  };
}

function defaultCarrierSettings() {
  return {
    mode: "demo",
    backendUrl: "",
    accounts: { ups: "", fedex: "", usps: "" },
  };
}

function defaultPickSettings() {
  return {
    defaultFee: 18,
    laborRate: 42,
    rushMultiplier: 1.5,
    requireApproval: true,
    showExceptionsToCustomers: true,
  };
}

function normalizeAppearance(appearance) {
  return { ...defaultAppearance(), ...(appearance || {}) };
}

function normalizeCarrierSettings(settings) {
  const defaults = defaultCarrierSettings();
  return {
    ...defaults,
    ...(settings || {}),
    accounts: { ...defaults.accounts, ...((settings && settings.accounts) || {}) },
  };
}

function normalizePickSettings(settings) {
  const defaults = defaultPickSettings();
  return {
    defaultFee: toNumber(settings?.defaultFee) || defaults.defaultFee,
    laborRate: toNumber(settings?.laborRate) || defaults.laborRate,
    rushMultiplier: Math.max(1, Number(settings?.rushMultiplier) || defaults.rushMultiplier),
    requireApproval: typeof settings?.requireApproval === "boolean" ? settings.requireApproval : defaults.requireApproval,
    showExceptionsToCustomers:
      typeof settings?.showExceptionsToCustomers === "boolean"
        ? settings.showExceptionsToCustomers
        : defaults.showExceptionsToCustomers,
  };
}

function normalizeAssignmentFields(record) {
  const assignedUserIds = Array.isArray(record.assignedUserIds)
    ? record.assignedUserIds.map(cleanText).filter(Boolean)
    : cleanText(record.assignedUserIds).split(",").map(cleanText).filter(Boolean);
  return {
    primaryUserId: cleanText(record.primaryUserId),
    assignedUserIds: [...new Set([cleanText(record.primaryUserId), ...assignedUserIds].filter(Boolean))],
    laborEntryIds: Array.isArray(record.laborEntryIds) ? record.laborEntryIds.map(cleanText).filter(Boolean) : [],
    documentStageId: cleanText(record.documentStageId),
    averageCompletionMinutes: toNumber(record.averageCompletionMinutes),
  };
}

function normalizeUserProfile(user) {
  const role = ["admin", "operator", "viewer"].includes(user.role) ? user.role : "operator";
  const status = user.status === "inactive" ? "inactive" : "active";
  return {
    id: cleanText(user.id) || uid("USER"),
    authUserId: cleanText(user.authUserId),
    name: cleanText(user.name) || "Warehouse User",
    role,
    status,
    warehouseIds: Array.isArray(user.warehouseIds) ? [...new Set(user.warehouseIds.map(cleanText).filter(Boolean))] : [],
    contact: cleanText(user.contact),
    createdAt: cleanText(user.createdAt) || todayISO(),
  };
}

function calculateDurationHours(startTime, endTime, fallbackHours = 0) {
  const start = Date.parse(startTime);
  const end = Date.parse(endTime);
  if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
    return Math.round(((end - start) / 36_000) ) / 100;
  }
  return toNumber(fallbackHours);
}

function normalizeLaborEntry(entry) {
  const taskType = LABOR_TASK_TYPES[entry.taskType] ? entry.taskType : "admin";
  const orderType = ORDER_TYPES[entry.orderType] ? entry.orderType : "admin";
  const hours = calculateDurationHours(entry.startTime, entry.endTime, entry.hours);
  return {
    id: cleanText(entry.id) || uid("LAB"),
    userId: cleanText(entry.userId),
    warehouseId: entry.warehouseId || DEFAULT_WAREHOUSE_ID,
    customerId: cleanText(entry.customerId),
    orderType,
    orderId: cleanText(entry.orderId),
    taskType,
    startTime: cleanText(entry.startTime),
    endTime: cleanText(entry.endTime),
    hours,
    billable: entry.billable !== false,
    rate: toNumber(entry.rate),
    notes: cleanText(entry.notes),
    createdAt: cleanText(entry.createdAt) || todayISO(),
  };
}

function normalizeDocumentStage(stage) {
  const status = DOCUMENT_STATUSES[stage.status] ? stage.status : "waiting";
  const requiredDocs = Array.isArray(stage.requiredDocs)
    ? stage.requiredDocs.map(cleanText).filter(Boolean)
    : cleanText(stage.requiredDocs).split(",").map(cleanText).filter(Boolean);
  const receivedDocs = Array.isArray(stage.receivedDocs)
    ? stage.receivedDocs.map(cleanText).filter(Boolean)
    : cleanText(stage.receivedDocs).split(",").map(cleanText).filter(Boolean);
  return {
    id: cleanText(stage.id) || uid("DOC"),
    warehouseId: stage.warehouseId || DEFAULT_WAREHOUSE_ID,
    customerId: cleanText(stage.customerId),
    orderType: ORDER_TYPES[stage.orderType] ? stage.orderType : "shipment",
    orderId: cleanText(stage.orderId),
    reference: cleanText(stage.reference) || cleanText(stage.orderId) || uid("LOAD"),
    status,
    assignedUserId: cleanText(stage.assignedUserId),
    requiredDocs,
    receivedDocs,
    notes: cleanText(stage.notes),
    createdAt: cleanText(stage.createdAt) || todayISO(),
    updatedAt: cleanText(stage.updatedAt) || todayISO(),
  };
}

function normalizeModes(value) {
  const modes = Array.isArray(value)
    ? value
    : cleanText(value).split(",").map(cleanText);
  const valid = modes.filter((mode) => TMS_MODES[mode]);
  return valid.length ? [...new Set(valid)] : ["ltl"];
}

function normalizeTmsCarrier(carrier) {
  return {
    id: cleanText(carrier.id) || uid("TMSC"),
    name: cleanText(carrier.name) || "New Carrier",
    scac: normalizeCode(carrier.scac).slice(0, 8),
    modes: normalizeModes(carrier.modes),
    contact: cleanText(carrier.contact),
    email: cleanText(carrier.email),
    phone: cleanText(carrier.phone),
    serviceAreas: cleanText(carrier.serviceAreas),
    status: carrier.status === "inactive" ? "inactive" : "active",
    insurance: cleanText(carrier.insurance),
    notes: cleanText(carrier.notes),
    createdAt: cleanText(carrier.createdAt) || todayISO(),
  };
}

function normalizeFreightClass(value) {
  const text = cleanText(value);
  return FREIGHT_CLASSES.includes(text) ? text : "70";
}

function normalizeTmsCarrierRate(rate) {
  const mode = TMS_MODES[rate.mode] ? rate.mode : "ltl";
  return {
    id: cleanText(rate.id) || uid("TMSR"),
    carrierId: cleanText(rate.carrierId),
    laneName: cleanText(rate.laneName) || "General Lane",
    originRegion: cleanText(rate.originRegion),
    destinationRegion: cleanText(rate.destinationRegion),
    mode,
    serviceLevel: cleanText(rate.serviceLevel) || (mode === "ltl" ? "Standard LTL" : TMS_MODES[mode]),
    freightClass: normalizeFreightClass(rate.freightClass),
    minWeight: toNumber(rate.minWeight),
    maxWeight: toNumber(rate.maxWeight),
    minimumCharge: toNumber(rate.minimumCharge),
    linehaul: toNumber(rate.linehaul),
    fuelPct: toNumber(rate.fuelPct),
    accessorialFlat: toNumber(rate.accessorialFlat),
    effectiveFrom: cleanText(rate.effectiveFrom) || todayISO(),
    effectiveTo: cleanText(rate.effectiveTo),
    notes: cleanText(rate.notes),
  };
}

function normalizeTmsClientRate(rate) {
  const mode = TMS_MODES[rate.mode] ? rate.mode : "ltl";
  return {
    id: cleanText(rate.id) || uid("TMSCR"),
    customerId: cleanText(rate.customerId),
    name: cleanText(rate.name) || "Customer Rate Profile",
    mode,
    rateId: cleanText(rate.rateId),
    percentMarkup: toNumber(rate.percentMarkup),
    flatMarkup: toNumber(rate.flatMarkup),
    fuelMarkupPct: toNumber(rate.fuelMarkupPct),
    accessorialMarkupPct: toNumber(rate.accessorialMarkupPct),
    minimumMargin: toNumber(rate.minimumMargin),
    effectiveFrom: cleanText(rate.effectiveFrom) || todayISO(),
    effectiveTo: cleanText(rate.effectiveTo),
    notes: cleanText(rate.notes),
  };
}

function normalizeTmsLoad(load) {
  const mode = TMS_MODES[load.mode] ? load.mode : "ltl";
  const status = TMS_LOAD_STATUSES[load.status] ? load.status : "draft";
  const normalized = {
    id: cleanText(load.id) || uid("TMSL"),
    reference: normalizeCode(load.reference) || uid("LOAD"),
    orderType: load.orderType === "external" ? "external" : "wms",
    shipmentId: cleanText(load.shipmentId),
    customerId: cleanText(load.customerId),
    warehouseId: load.warehouseId || DEFAULT_WAREHOUSE_ID,
    carrierId: cleanText(load.carrierId),
    carrierRateId: cleanText(load.carrierRateId),
    clientRateId: cleanText(load.clientRateId),
    mode,
    status,
    serviceLevel: cleanText(load.serviceLevel) || (mode === "ltl" ? "Standard LTL" : TMS_MODES[mode]),
    shipDate: cleanText(load.shipDate) || todayISO(),
    deliveryDate: cleanText(load.deliveryDate),
    proNumber: cleanText(load.proNumber),
    shipper: cleanText(load.shipper),
    origin: cleanText(load.origin),
    consignee: cleanText(load.consignee),
    destination: cleanText(load.destination),
    billTo: cleanText(load.billTo),
    freightClass: normalizeFreightClass(load.freightClass),
    nmfc: cleanText(load.nmfc),
    handlingUnits: toInteger(load.handlingUnits) || 1,
    pieces: toInteger(load.pieces) || 1,
    pallets: toInteger(load.pallets),
    weight: toNumber(load.weight),
    length: toNumber(load.length),
    width: toNumber(load.width),
    height: toNumber(load.height),
    hazmat: Boolean(load.hazmat),
    stackable: load.stackable !== false,
    accessorials: normalizeAccessorials(load.accessorials),
    declaredValue: toNumber(load.declaredValue),
    carrierCost: toNumber(load.carrierCost),
    clientCharge: toNumber(load.clientCharge),
    notes: cleanText(load.notes),
    internalNotes: cleanText(load.internalNotes),
    createdAt: cleanText(load.createdAt) || todayISO(),
    updatedAt: cleanText(load.updatedAt) || todayISO(),
  };
  return normalized;
}

function normalizeWarehouse(warehouse) {
  const fallback = defaultWarehouse();
  const code = normalizeCode(warehouse.code || warehouse.name || fallback.code);
  return {
    id: warehouse.id || `WH-${code || Date.now()}`,
    code: code || fallback.code,
    name: cleanText(warehouse.name || code || fallback.name),
    address: cleanText(warehouse.address),
    city: cleanText(warehouse.city),
    state: cleanText(warehouse.state).toUpperCase(),
    postalCode: cleanText(warehouse.postalCode),
    lat: Number.isFinite(Number(warehouse.lat)) ? Number(warehouse.lat) : fallback.lat,
    lng: Number.isFinite(Number(warehouse.lng)) ? Number(warehouse.lng) : fallback.lng,
    status: warehouse.status === "inactive" ? "inactive" : "active",
    storageRate: toNumber(warehouse.storageRate),
    handlingRate: toNumber(warehouse.handlingRate),
    notes: cleanText(warehouse.notes),
  };
}

function normalizeBay(bay, ensureWarehouseId = (value) => value || DEFAULT_WAREHOUSE_ID) {
  return {
    warehouseId: ensureWarehouseId(bay.warehouseId),
    code: normalizeCode(bay.code),
    zone: cleanText(bay.zone),
    maxPallets: toInteger(bay.maxPallets),
    maxWeight: toNumber(bay.maxWeight),
    length: toNumber(bay.length),
    width: toNumber(bay.width),
    height: toNumber(bay.height),
    notes: cleanText(bay.notes),
  };
}

function bayKey(warehouseId, code) {
  return `${warehouseId || DEFAULT_WAREHOUSE_ID}::${normalizeCode(code)}`;
}

function parseBayKey(key) {
  const value = cleanText(key);
  if (value.includes("::")) {
    const [warehouseId, code] = value.split("::");
    return { warehouseId, code: normalizeCode(code) };
  }
  return { warehouseId: DEFAULT_WAREHOUSE_ID, code: normalizeCode(value) };
}

function normalizeBayLink(link, fallbackWarehouseId = DEFAULT_WAREHOUSE_ID) {
  const parsed = parseBayKey(link);
  return bayKey(parsed.warehouseId || fallbackWarehouseId, parsed.code);
}

function normalizeCustomer(customer) {
  return {
    id: customer.id || uid("CUST"),
    code: normalizeCode(customer.code || customer.name),
    name: cleanText(customer.name || customer.code),
    contact: cleanText(customer.contact),
    email: cleanText(customer.email),
    phone: cleanText(customer.phone),
    warehouseIds: Array.isArray(customer.warehouseIds)
      ? [...new Set(customer.warehouseIds.map(cleanText).filter(Boolean))]
      : [DEFAULT_WAREHOUSE_ID],
    skuLinks: Array.isArray(customer.skuLinks) ? customer.skuLinks.map(normalizeCode).filter(Boolean) : [],
    bayLinks: Array.isArray(customer.bayLinks) ? customer.bayLinks.map((link) => normalizeBayLink(link)).filter(Boolean) : [],
    kitFee: toNumber(customer.kitFee),
    storageRate: toNumber(customer.storageRate),
  };
}

function normalizeLease(lease) {
  return {
    id: lease.id || uid("LEASE"),
    customerId: lease.customerId || "",
    warehouseId: lease.warehouseId || DEFAULT_WAREHOUSE_ID,
    bayKeys: Array.isArray(lease.bayKeys)
      ? lease.bayKeys.map((link) => normalizeBayLink(link, lease.warehouseId)).filter(Boolean)
      : [],
    startDate: cleanText(lease.startDate),
    endDate: cleanText(lease.endDate),
    monthlyRate: toNumber(lease.monthlyRate),
    palletAllowance: toInteger(lease.palletAllowance),
    sqftAllowance: toNumber(lease.sqftAllowance),
    weightAllowance: toNumber(lease.weightAllowance),
    palletOverageRate: toNumber(lease.palletOverageRate),
    sqftOverageRate: toNumber(lease.sqftOverageRate),
    weightOverageRate: toNumber(lease.weightOverageRate),
    status: ["active", "pending", "expired"].includes(lease.status) ? lease.status : "active",
    notes: cleanText(lease.notes),
  };
}

function normalizeKitTemplate(template) {
  return {
    id: template.id || uid("KIT"),
    warehouseId: template.warehouseId || DEFAULT_WAREHOUSE_ID,
    customerId: template.customerId || "",
    name: cleanText(template.name) || "Standard Kit",
    lines: normalizeKitLines(template.lines),
  };
}

function normalizeKitOrder(order) {
  return {
    id: order.id || uid("KO"),
    warehouseId: order.warehouseId || DEFAULT_WAREHOUSE_ID,
    customerId: order.customerId || "",
    templateId: order.templateId || "",
    reference: cleanText(order.reference) || order.id || uid("KIT-ORDER"),
    status: order.status || "review",
    lines: normalizeKitLines(order.lines),
    reservations: Array.isArray(order.reservations) ? order.reservations : [],
    createdAt: order.createdAt || todayISO(),
    completedAt: order.completedAt || "",
    ...normalizeAssignmentFields(order),
  };
}

function normalizePickRequest(request) {
  const status = PICK_STATUSES[request.status] ? request.status : "requested";
  return {
    id: request.id || uid("PICK"),
    reference: cleanText(request.reference) || request.id || uid("PICK"),
    source: request.source === "internal" ? "internal" : "customer",
    customerId: request.customerId || "",
    warehouseId: request.warehouseId || DEFAULT_WAREHOUSE_ID,
    priority: ["standard", "rush", "hold"].includes(request.priority) ? request.priority : "standard",
    requestedShipDate: cleanText(request.requestedShipDate),
    destination: cleanText(request.destination),
    carrierPreference: cleanText(request.carrierPreference),
    assignedPicker: cleanText(request.assignedPicker),
    status,
    pickFee: toNumber(request.pickFee),
    laborCharge: toNumber(request.laborCharge),
    notes: cleanText(request.notes),
    attachments: Array.isArray(request.attachments)
      ? request.attachments.map(cleanText).filter(Boolean)
      : cleanText(request.attachments).split(",").map(cleanText).filter(Boolean),
    createdAt: cleanText(request.createdAt) || todayISO(),
    approvedAt: cleanText(request.approvedAt),
    packedAt: cleanText(request.packedAt),
    shippedAt: cleanText(request.shippedAt),
    closedAt: cleanText(request.closedAt),
    lines: normalizePickLines(request.lines),
    exceptions: Array.isArray(request.exceptions) ? request.exceptions.map(normalizePickException) : [],
    packingRecord: request.packingRecord ? normalizePackingRecord(request.packingRecord) : null,
    shipmentId: cleanText(request.shipmentId),
    ...normalizeAssignmentFields(request),
  };
}

function normalizeKitLines(lines) {
  return Array.isArray(lines)
    ? lines
        .map((line) => ({ sku: normalizeCode(line.sku), quantity: toInteger(line.quantity) }))
        .filter((line) => line.sku && line.quantity)
    : [];
}

function normalizePickLines(lines) {
  return Array.isArray(lines)
    ? lines
        .map((line) => ({
          id: line.id || uid("PICK-LINE"),
          sku: normalizeCode(line.sku),
          quantity: toInteger(line.quantity),
          preferredBay: normalizeCode(line.preferredBay || line.bayCode),
          reservedQuantity: toInteger(line.reservedQuantity),
          pickedQuantity: toInteger(line.pickedQuantity),
          shortQuantity: toInteger(line.shortQuantity),
          substitutionNote: cleanText(line.substitutionNote),
          status: line.status || "requested",
        }))
        .filter((line) => line.sku && line.quantity)
    : [];
}

function normalizePickException(exception) {
  return {
    id: exception.id || uid("PEX"),
    date: cleanText(exception.date) || todayISO(),
    type: cleanText(exception.type) || "Short pick",
    note: cleanText(exception.note),
    visibleToCustomer: exception.visibleToCustomer !== false,
  };
}

function normalizePackingRecord(record) {
  return {
    date: cleanText(record.date) || todayISO(),
    packedBy: cleanText(record.packedBy),
    cartons: toInteger(record.cartons) || 1,
    weight: toNumber(record.weight),
    notes: cleanText(record.notes),
  };
}

function parsePickLines(text) {
  return cleanText(text)
    .split(/\n|;/)
    .map((line) => line.split(",").map((part) => cleanText(part)))
    .map(([sku, quantity, preferredBay]) => ({
      id: uid("PICK-LINE"),
      sku: normalizeCode(sku),
      quantity: toInteger(quantity),
      preferredBay: normalizeCode(preferredBay),
      reservedQuantity: 0,
      pickedQuantity: 0,
      shortQuantity: 0,
      substitutionNote: "",
      status: "requested",
    }))
    .filter((line) => line.sku && line.quantity);
}

function pickLinesText(lines) {
  return normalizePickLines(lines)
    .map((line) => `${line.sku}, ${line.quantity}${line.preferredBay ? `, ${line.preferredBay}` : ""}`)
    .join("\n");
}

function parseKitLines(text) {
  return cleanText(text)
    .split(/\n|;/)
    .map((line) => line.split(",").map((part) => cleanText(part)))
    .map(([sku, quantity]) => ({ sku: normalizeCode(sku), quantity: toInteger(quantity) }))
    .filter((line) => line.sku && line.quantity);
}

function kitLinesText(lines) {
  return normalizeKitLines(lines)
    .map((line) => `${line.sku}, ${line.quantity}`)
    .join("\n");
}

function normalizeAccessorials(accessorials) {
  return Array.isArray(accessorials)
    ? accessorials
        .map((item) => ({
          name: cleanText(item.name),
          amount: toNumber(item.amount),
        }))
        .filter((item) => item.name || item.amount)
    : [];
}

function calculateInvoiceTotal(shipment) {
  const accessorialTotal = normalizeAccessorials(shipment.accessorials).reduce(
    (total, item) => total + (item.amount || 0),
    0
  );
  return toNumber(shipment.freightCharge) + toNumber(shipment.fuelCharge) + accessorialTotal;
}

function normalizeShipment(shipment) {
  const carrier = CARRIER_CATALOG[shipment.carrier] ? shipment.carrier : "";
  const service = carrier && CARRIER_CATALOG[carrier].services.some((item) => item.code === shipment.service)
    ? shipment.service
    : "";
  const normalized = {
    ...shipment,
    warehouseId: shipment.warehouseId || DEFAULT_WAREHOUSE_ID,
    customerId: cleanText(shipment.customerId),
    ...normalizeAssignmentFields(shipment),
    origin: cleanText(shipment.origin),
    destination: cleanText(shipment.destination),
    miles: toNumber(shipment.miles),
    carrier,
    service,
    packageCount: toInteger(shipment.packageCount) || 1,
    package: {
      length: toNumber(shipment.package?.length),
      width: toNumber(shipment.package?.width),
      height: toNumber(shipment.package?.height),
    },
    shipTo: {
      name: cleanText(shipment.shipTo?.name),
      address: cleanText(shipment.shipTo?.address),
      city: cleanText(shipment.shipTo?.city),
      state: cleanText(shipment.shipTo?.state).toUpperCase(),
      postalCode: cleanText(shipment.shipTo?.postalCode),
    },
    declaredValue: toNumber(shipment.declaredValue),
    rateEstimate: toNumber(shipment.rateEstimate),
    carrierStatus: shipment.carrierStatus || (shipment.trackingNumber ? "Submitted" : "Draft"),
    trackingNumber: cleanText(shipment.trackingNumber),
    carrierSubmittedAt: cleanText(shipment.carrierSubmittedAt),
    labelUrl: cleanText(shipment.labelUrl),
    routeEvents: Array.isArray(shipment.routeEvents)
      ? shipment.routeEvents.map(normalizeRouteEvent)
      : makeRouteEvents(
          cleanText(shipment.origin) || "Main Warehouse",
          cleanText(shipment.destination) || "Destination",
          "Outbound",
          defaultWarehouseLocation()
        ),
    freightCharge: toNumber(shipment.freightCharge),
    fuelCharge: toNumber(shipment.fuelCharge),
    accessorials: normalizeAccessorials(shipment.accessorials),
  };
  normalized.invoiceTotal = calculateInvoiceTotal(normalized);
  return normalized;
}

function normalizeReceipt(receipt) {
  const origin = cleanText(receipt.origin || receipt.reference || "Supplier Origin");
  const originLocation = {
    name: origin,
    lat: Number(receipt.originLat),
    lng: Number(receipt.originLng),
  };
  return {
    ...receipt,
    warehouseId: receipt.warehouseId || DEFAULT_WAREHOUSE_ID,
    customerId: receipt.customerId || "",
    ...normalizeAssignmentFields(receipt),
    origin,
    originLat: Number.isFinite(originLocation.lat) ? originLocation.lat : "",
    originLng: Number.isFinite(originLocation.lng) ? originLocation.lng : "",
    routeEvents: Array.isArray(receipt.routeEvents)
      ? receipt.routeEvents.map(normalizeRouteEvent)
      : makeRouteEvents(origin, "Main Warehouse", "Inbound", originLocation, defaultWarehouseLocation()),
  };
}

function normalizeRouteEvent(event) {
  const fallback = hashLocation(event.location || event.label);
  return {
    label: cleanText(event.label) || "Route Event",
    location: cleanText(event.location) || fallback.name,
    lat: Number.isFinite(Number(event.lat)) ? Number(event.lat) : fallback.lat,
    lng: Number.isFinite(Number(event.lng)) ? Number(event.lng) : fallback.lng,
    timestamp: cleanText(event.timestamp) || todayISO(),
  };
}

function accessorialSummary(accessorials) {
  const items = normalizeAccessorials(accessorials);
  return items.length ? items.map((item) => item.name).join(", ") : "-";
}

function getAccessorialTotal(accessorials) {
  return normalizeAccessorials(accessorials).reduce((total, item) => total + (item.amount || 0), 0);
}

function formatWarehouse(id) {
  const warehouse = getWarehouse(id);
  return warehouse ? `${warehouse.code} - ${warehouse.name}` : "-";
}

function formatBayKey(key) {
  const parsed = parseBayKey(key);
  const warehouse = getWarehouse(parsed.warehouseId);
  return `${warehouse?.code || parsed.warehouseId} / ${parsed.code}`;
}

function getBayAreaSqft(bay) {
  const length = Number(bay?.length) || 0;
  const width = Number(bay?.width) || 0;
  return length && width ? (length * width) / 144 : 0;
}

function calculateLeaseCharge(lease) {
  const normalized = normalizeLease(lease);
  const keys = new Set(normalized.bayKeys);
  const usage = state.inventory
    .filter((row) => row.warehouseId === normalized.warehouseId)
    .filter((row) => !keys.size || keys.has(bayKey(row.warehouseId, row.bayCode)))
    .reduce(
      (summary, row) => {
        const sku = getSku(row.sku);
        summary.pallets += row.pallets || 0;
        summary.weight += (row.units || 0) * (sku?.weight || 0);
        return summary;
      },
      { pallets: 0, weight: 0 }
    );
  const leasedBays = normalized.bayKeys
    .map((key) => parseBayKey(key))
    .map((parsed) => getBay(parsed.code, parsed.warehouseId))
    .filter(Boolean);
  usage.sqft = leasedBays.reduce((sum, bay) => sum + getBayAreaSqft(bay), 0);
  const palletOverage = Math.max(0, usage.pallets - (normalized.palletAllowance || 0));
  const sqftOverage = Math.max(0, usage.sqft - (normalized.sqftAllowance || 0));
  const weightOverage = Math.max(0, usage.weight - (normalized.weightAllowance || 0));
  const overageTotal =
    palletOverage * (normalized.palletOverageRate || 0) +
    sqftOverage * (normalized.sqftOverageRate || 0) +
    weightOverage * (normalized.weightOverageRate || 0);
  return {
    usage,
    palletOverage,
    sqftOverage,
    weightOverage,
    overageTotal,
    total: (normalized.monthlyRate || 0) + overageTotal,
  };
}

function estimateCarrierCost(shipment) {
  return (normalizeShipment(shipment).invoiceTotal || 0) * 0.78;
}

function getPickBilling(request) {
  const settings = normalizePickSettings(state.pickSettings);
  const baseFee = toNumber(request.pickFee) || settings.defaultFee;
  const labor = toNumber(request.laborCharge);
  const rushPremium = request.priority === "rush" ? baseFee * (settings.rushMultiplier - 1) : 0;
  return {
    baseFee,
    labor,
    rushPremium,
    total: baseFee + labor + rushPremium,
  };
}

function getPickReservedQuantity(sku, bayCode, warehouseId, excludingPickId = "") {
  return (state.pickReservations || [])
    .filter((reservation) => reservation.status === "reserved")
    .filter((reservation) => reservation.warehouseId === warehouseId && reservation.sku === sku)
    .filter((reservation) => !bayCode || reservation.bayCode === bayCode)
    .filter((reservation) => reservation.pickRequestId !== excludingPickId)
    .reduce((sum, reservation) => sum + (reservation.quantity || 0), 0);
}

function getKitReservedQuantity(sku, bayCode, warehouseId) {
  return (state.reservations || [])
    .filter((reservation) => reservation.status === "reserved")
    .filter((reservation) => reservation.warehouseId === warehouseId && reservation.sku === sku)
    .filter((reservation) => !bayCode || reservation.bayCode === bayCode)
    .reduce((sum, reservation) => sum + (reservation.quantity || 0), 0);
}

function getAvailableUnits(row, excludingPickId = "") {
  const pickReserved = getPickReservedQuantity(row.sku, row.bayCode, row.warehouseId, excludingPickId);
  const kitReserved = getKitReservedQuantity(row.sku, row.bayCode, row.warehouseId);
  return Math.max(0, (row.units || 0) - pickReserved - kitReserved);
}

function getPickTotals(request) {
  const lines = normalizePickLines(request.lines);
  return lines.reduce(
    (summary, line) => {
      summary.lines += 1;
      summary.quantity += line.quantity || 0;
      summary.reserved += line.reservedQuantity || 0;
      summary.picked += line.pickedQuantity || 0;
      summary.short += line.shortQuantity || 0;
      summary.weight += (line.quantity || 0) * (getSku(line.sku)?.weight || 0);
      return summary;
    },
    { lines: 0, quantity: 0, reserved: 0, picked: 0, short: 0, weight: 0 }
  );
}

function getPickStatusClass(status) {
  if (["closed", "shipped", "packed", "picked"].includes(status)) return "ok";
  if (["exception", "canceled"].includes(status)) return "over";
  return "warn";
}

function getPickStatusLabel(status) {
  return PICK_STATUSES[status] || status || "Requested";
}

function getDocumentStatusLabel(status) {
  return DOCUMENT_STATUSES[status] || status || "Waiting";
}

function getDocumentStatusClass(status) {
  if (["approved", "released", "received"].includes(status)) return "ok";
  if (["missing_docs", "rejected"].includes(status)) return "over";
  return "warn";
}

function getPickRequest(id) {
  return state.pickRequests.find((request) => request.id === id);
}

function getCarrierLabel(carrierCode, serviceCode) {
  const carrier = CARRIER_CATALOG[carrierCode];
  if (!carrier) return "-";
  const service = carrier.services.find((item) => item.code === serviceCode);
  return service ? `${carrier.name} ${service.label}` : carrier.name;
}

function getCarrierStatusClass(status) {
  if (status === "Submitted") return "ok";
  if (status === "Failed") return "over";
  return "warn";
}

function estimateCarrierRateFromValues({ carrier, service, weight, miles, packages, declaredValue }) {
  const carrierInfo = CARRIER_CATALOG[carrier] || CARRIER_CATALOG.ups;
  const serviceInfo = carrierInfo.services.find((item) => item.code === service) || carrierInfo.services[0];
  const chargeableWeight = Math.max(1, toNumber(weight));
  const chargeableMiles = Math.max(1, toNumber(miles));
  const packageCount = Math.max(1, toInteger(packages));
  const insurance = toNumber(declaredValue) * 0.006;
  const base = (18 + chargeableWeight * 0.36 + chargeableMiles * 0.18 + packageCount * 4.5 + insurance) * serviceInfo.multiplier;
  const freight = Math.round(base * 100) / 100;
  const fuel = Math.round(freight * 0.16 * 100) / 100;
  return { freight, fuel, total: Math.round((freight + fuel) * 100) / 100 };
}

function estimateOutboundRate() {
  const sku = getSku($("#outboundSku").value);
  const units = toInteger($("#outboundUnits").value);
  return estimateCarrierRateFromValues({
    carrier: $("#outboundCarrier").value,
    service: $("#outboundService").value,
    weight: units * (sku?.weight || 0),
    miles: $("#outboundMiles").value,
    packages: $("#outboundPackageCount").value,
    declaredValue: $("#outboundDeclaredValue").value,
  });
}

function generateTrackingNumber(carrierCode) {
  const carrier = CARRIER_CATALOG[carrierCode] || CARRIER_CATALOG.ups;
  const digits = `${Date.now()}${Math.floor(Math.random() * 1000000)}`.slice(-14);
  return `${carrier.trackingPrefix}${digits}`;
}

function getTrackingLink(shipment) {
  const normalized = normalizeShipment(shipment);
  const carrier = CARRIER_CATALOG[normalized.carrier];
  return carrier && normalized.trackingNumber ? carrier.trackingUrl(normalized.trackingNumber) : "";
}

const REPORT_COLUMNS = {
  shipments: [
    { key: "date", label: "Date", value: (row) => row.date },
    { key: "reference", label: "Reference", value: (row) => row.reference || "-" },
    { key: "warehouse", label: "Warehouse", value: (row) => getWarehouse(row.warehouseId)?.name || "-" },
    { key: "origin", label: "Start", value: (row) => row.origin || "-" },
    { key: "destination", label: "Destination", value: (row) => row.destination || "-" },
    { key: "sku", label: "SKU", value: (row) => row.sku },
    { key: "skuName", label: "Name", value: (row) => getSku(row.sku)?.name || "-" },
    { key: "bayCode", label: "Bay", value: (row) => row.bayCode },
    { key: "units", label: "Units", value: (row) => formatNumber(row.units) },
    { key: "pallets", label: "Pallets", value: (row) => formatNumber(row.pallets) },
    { key: "weight", label: "Weight", value: (row) => formatWeight(row.totalWeight) },
    { key: "carrier", label: "Carrier", value: (row) => getCarrierLabel(row.carrier, row.service) },
    { key: "carrierStatus", label: "Carrier Status", value: (row) => row.carrierStatus || "Draft" },
    { key: "trackingNumber", label: "Tracking", value: (row) => row.trackingNumber || "-" },
    { key: "miles", label: "Miles", value: (row) => formatNumber(row.miles) },
    { key: "fuelCharge", label: "Fuel", value: (row) => formatCurrency(row.fuelCharge) },
    { key: "accessorials", label: "Accessorials", value: (row) => accessorialSummary(row.accessorials) },
    { key: "invoiceTotal", label: "Invoice Total", value: (row) => formatCurrency(row.invoiceTotal) },
  ],
  inventory: [
    { key: "sku", label: "SKU", value: (row) => row.sku },
    { key: "warehouse", label: "Warehouse", value: (row) => getWarehouse(row.warehouseId)?.name || "-" },
    { key: "skuName", label: "Name", value: (row) => getSku(row.sku)?.name || "-" },
    { key: "bayCode", label: "Bay", value: (row) => row.bayCode },
    { key: "zone", label: "Zone", value: (row) => getBay(row.bayCode, row.warehouseId)?.zone || "-" },
    { key: "units", label: "Units", value: (row) => formatNumber(row.units) },
    { key: "pallets", label: "Pallets", value: (row) => formatNumber(row.pallets) },
    { key: "weight", label: "Weight", value: (row) => formatWeight((row.units || 0) * (getSku(row.sku)?.weight || 0)) },
  ],
  receipts: [
    { key: "date", label: "Date", value: (row) => row.date },
    { key: "reference", label: "Reference", value: (row) => row.reference || "-" },
    { key: "warehouse", label: "Warehouse", value: (row) => getWarehouse(row.warehouseId)?.name || "-" },
    { key: "sku", label: "SKU", value: (row) => row.sku },
    { key: "skuName", label: "Name", value: (row) => getSku(row.sku)?.name || "-" },
    { key: "bayCode", label: "Bay", value: (row) => row.bayCode },
    { key: "units", label: "Units", value: (row) => formatNumber(row.units) },
    { key: "pallets", label: "Pallets", value: (row) => formatNumber(row.pallets) },
  ],
  picks: [
    { key: "reference", label: "Reference", value: (row) => row.reference || "-" },
    { key: "customer", label: "Customer", value: (row) => getCustomer(row.customerId)?.name || "-" },
    { key: "warehouse", label: "Warehouse", value: (row) => getWarehouse(row.warehouseId)?.name || "-" },
    { key: "priority", label: "Priority", value: (row) => row.priority },
    { key: "status", label: "Status", value: (row) => getPickStatusLabel(row.status) },
    { key: "shipDate", label: "Ship Date", value: (row) => row.requestedShipDate || "-" },
    { key: "destination", label: "Destination", value: (row) => row.destination || "-" },
    { key: "units", label: "Units", value: (row) => formatNumber(getPickTotals(row).quantity) },
    { key: "reserved", label: "Reserved", value: (row) => formatNumber(getPickTotals(row).reserved) },
    { key: "billing", label: "Billing", value: (row) => formatCurrency(getPickBilling(row).total) },
  ],
  labor: [
    { key: "user", label: "User", value: (row) => formatUser(row.userId) },
    { key: "task", label: "Task", value: (row) => LABOR_TASK_TYPES[row.taskType] || row.taskType },
    { key: "order", label: "Order", value: (row) => getOrderReference(row.orderType, row.orderId) },
    { key: "warehouse", label: "Warehouse", value: (row) => getWarehouse(row.warehouseId)?.name || "-" },
    { key: "customer", label: "Customer", value: (row) => getCustomer(row.customerId)?.name || "-" },
    { key: "hours", label: "Hours", value: (row) => formatNumber(row.hours) },
    { key: "billable", label: "Billable", value: (row) => (row.billable ? formatCurrency((row.hours || 0) * (row.rate || 0)) : "-") },
    { key: "completed", label: "Completed", value: (row) => row.endTime || row.createdAt || "-" },
  ],
  documents: [
    { key: "reference", label: "Load", value: (row) => row.reference || row.id },
    { key: "warehouse", label: "Warehouse", value: (row) => getWarehouse(row.warehouseId)?.name || "-" },
    { key: "customer", label: "Customer", value: (row) => getCustomer(row.customerId)?.name || "-" },
    { key: "status", label: "Status", value: (row) => getDocumentStatusLabel(row.status) },
    { key: "required", label: "Required", value: (row) => row.requiredDocs.join(", ") || "-" },
    { key: "received", label: "Received", value: (row) => row.receivedDocs.join(", ") || "-" },
    { key: "assigned", label: "Assigned", value: (row) => formatUser(row.assignedUserId) },
    { key: "created", label: "Created", value: (row) => row.createdAt },
  ],
  users: [
    { key: "name", label: "User", value: (row) => row.name },
    { key: "role", label: "Role", value: (row) => row.role },
    { key: "status", label: "Status", value: (row) => row.status },
    { key: "warehouses", label: "Warehouses", value: (row) => row.warehouseIds.map((id) => getWarehouse(id)?.code || id).join(", ") || "-" },
    { key: "contact", label: "Contact", value: (row) => row.contact || "-" },
  ],
  leases: [
    { key: "customer", label: "Customer", value: (row) => getCustomer(row.customerId)?.name || "-" },
    { key: "warehouse", label: "Warehouse", value: (row) => getWarehouse(row.warehouseId)?.name || "-" },
    { key: "bays", label: "Leased Bays", value: (row) => row.bayKeys.map(formatBayKey).join(", ") || "-" },
    { key: "monthlyRate", label: "Monthly Rate", value: (row) => formatCurrency(row.monthlyRate) },
    { key: "overage", label: "Overage", value: (row) => formatCurrency(calculateLeaseCharge(row).overageTotal) },
    { key: "total", label: "Total", value: (row) => formatCurrency(calculateLeaseCharge(row).total) },
    { key: "status", label: "Status", value: (row) => row.status },
  ],
  tmsLoads: [
    { key: "reference", label: "Load", value: (row) => row.reference },
    { key: "customer", label: "Customer", value: (row) => getCustomer(row.customerId)?.name || "-" },
    { key: "warehouse", label: "Warehouse", value: (row) => getWarehouse(row.warehouseId)?.name || "-" },
    { key: "mode", label: "Mode", value: (row) => TMS_MODES[row.mode] || row.mode },
    { key: "status", label: "Status", value: (row) => TMS_LOAD_STATUSES[row.status] || row.status },
    { key: "carrier", label: "Carrier", value: (row) => getTmsCarrier(row.carrierId)?.name || "-" },
    { key: "lane", label: "Lane", value: (row) => `${row.origin || "-"} to ${row.destination || "-"}` },
    { key: "class", label: "Class", value: (row) => row.freightClass },
    { key: "weight", label: "Weight", value: (row) => formatWeight(row.weight) },
    { key: "carrierCost", label: "Carrier Cost", value: (row) => formatCurrency(calculateTmsLoadPricing(row).carrierCost) },
    { key: "clientCharge", label: "Client Charge", value: (row) => formatCurrency(calculateTmsLoadPricing(row).clientCharge) },
    { key: "margin", label: "Margin", value: (row) => formatCurrency(calculateTmsLoadPricing(row).margin) },
  ],
  tmsCustomerLoads: [
    { key: "reference", label: "Load", value: (row) => row.reference },
    { key: "mode", label: "Mode", value: (row) => TMS_MODES[row.mode] || row.mode },
    { key: "status", label: "Status", value: (row) => TMS_LOAD_STATUSES[row.status] || row.status },
    { key: "carrier", label: "Carrier", value: (row) => getTmsCarrier(row.carrierId)?.name || "-" },
    { key: "lane", label: "Lane", value: (row) => `${row.origin || "-"} to ${row.destination || "-"}` },
    { key: "class", label: "Class", value: (row) => row.freightClass },
    { key: "weight", label: "Weight", value: (row) => formatWeight(row.weight) },
    { key: "clientCharge", label: "Charge", value: (row) => formatCurrency(calculateTmsLoadPricing(row).clientCharge) },
  ],
  tmsCarrierRates: [
    { key: "carrier", label: "Carrier", value: (row) => getTmsCarrier(row.carrierId)?.name || "-" },
    { key: "lane", label: "Lane", value: (row) => row.laneName },
    { key: "mode", label: "Mode", value: (row) => TMS_MODES[row.mode] || row.mode },
    { key: "service", label: "Service", value: (row) => row.serviceLevel },
    { key: "class", label: "Class", value: (row) => row.freightClass },
    { key: "minimum", label: "Minimum", value: (row) => formatCurrency(row.minimumCharge) },
    { key: "linehaul", label: "Linehaul", value: (row) => formatCurrency(row.linehaul) },
    { key: "fuel", label: "Fuel %", value: (row) => `${formatNumber(row.fuelPct)}%` },
  ],
  tmsClientRates: [
    { key: "customer", label: "Customer", value: (row) => getCustomer(row.customerId)?.name || "-" },
    { key: "name", label: "Profile", value: (row) => row.name },
    { key: "mode", label: "Mode", value: (row) => TMS_MODES[row.mode] || row.mode },
    { key: "rate", label: "Carrier Rate", value: (row) => getTmsCarrierRate(row.rateId)?.laneName || "-" },
    { key: "markup", label: "Markup", value: (row) => `${formatNumber(row.percentMarkup)}% + ${formatCurrency(row.flatMarkup)}` },
    { key: "minimumMargin", label: "Minimum Margin", value: (row) => formatCurrency(row.minimumMargin) },
  ],
};

const DEFAULT_REPORT_FIELDS = {
  shipments: ["date", "reference", "warehouse", "destination", "sku", "carrier", "carrierStatus", "trackingNumber", "invoiceTotal"],
  inventory: ["sku", "warehouse", "skuName", "bayCode", "zone", "units", "pallets", "weight"],
  receipts: ["date", "reference", "warehouse", "sku", "bayCode", "units", "pallets"],
  picks: ["reference", "customer", "warehouse", "priority", "status", "shipDate", "units", "reserved", "billing"],
  labor: ["user", "task", "order", "warehouse", "hours", "billable", "completed"],
  documents: ["reference", "warehouse", "customer", "status", "required", "received", "assigned"],
  users: ["name", "role", "status", "warehouses", "contact"],
  leases: ["customer", "warehouse", "bays", "monthlyRate", "overage", "total", "status"],
  tmsLoads: ["reference", "customer", "mode", "status", "carrier", "lane", "class", "weight", "clientCharge", "margin"],
  tmsCustomerLoads: ["reference", "mode", "status", "carrier", "lane", "class", "weight", "clientCharge"],
  tmsCarrierRates: ["carrier", "lane", "mode", "service", "class", "minimum", "linehaul", "fuel"],
  tmsClientRates: ["customer", "name", "mode", "rate", "markup", "minimumMargin"],
};

function getSku(code) {
  return state.skus.find((item) => item.sku === code);
}

function getWarehouse(id) {
  return state.warehouses.find((warehouse) => warehouse.id === id) || state.warehouses[0] || defaultWarehouse();
}

function getWarehouseLocation(id) {
  const warehouse = getWarehouse(id);
  return {
    name: warehouse.name,
    lat: warehouse.lat,
    lng: warehouse.lng,
  };
}

function getActiveWarehouseId() {
  return state.selectedWarehouseId || "";
}

function warehouseMatches(record, warehouseId = getActiveWarehouseId()) {
  return !warehouseId || record.warehouseId === warehouseId;
}

function getBay(code, warehouseId = getActiveWarehouseId()) {
  return state.bays.find((bay) => bay.code === code && (!warehouseId || bay.warehouseId === warehouseId)) ||
    state.bays.find((bay) => bay.code === code);
}

function getCustomer(id) {
  return state.customers.find((customer) => customer.id === id);
}

function getTmsCarrier(id) {
  return state.tmsCarriers.find((carrier) => carrier.id === id);
}

function getTmsCarrierRate(id) {
  return state.tmsCarrierRates.find((rate) => rate.id === id);
}

function getTmsClientRate(id) {
  return state.tmsClientRates.find((rate) => rate.id === id);
}

function roundCurrency(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function getBestTmsCarrierRate(load) {
  const selected = getTmsCarrierRate(load.carrierRateId);
  if (selected) return selected;
  return state.tmsCarrierRates.find((rate) =>
    rate.mode === load.mode &&
    (!load.carrierId || rate.carrierId === load.carrierId) &&
    (!rate.freightClass || rate.freightClass === load.freightClass) &&
    (!rate.minWeight || load.weight >= rate.minWeight) &&
    (!rate.maxWeight || load.weight <= rate.maxWeight)
  ) || state.tmsCarrierRates.find((rate) => rate.mode === load.mode) || null;
}

function getBestTmsClientRate(load, carrierRate = getBestTmsCarrierRate(load)) {
  const selected = getTmsClientRate(load.clientRateId);
  if (selected) return selected;
  return state.tmsClientRates.find((rate) =>
    rate.customerId === load.customerId &&
    rate.mode === load.mode &&
    (!carrierRate || !rate.rateId || rate.rateId === carrierRate.id)
  ) || state.tmsClientRates.find((rate) => rate.customerId === load.customerId && rate.mode === load.mode) || null;
}

function calculateTmsLoadPricing(load) {
  const carrierRate = getBestTmsCarrierRate(load);
  const clientRate = getBestTmsClientRate(load, carrierRate);
  const accessorialTotal = normalizeAccessorials(load.accessorials).reduce((total, item) => total + (item.amount || 0), 0);
  if (!carrierRate) {
    const carrierCost = roundCurrency(toNumber(load.carrierCost));
    const clientCharge = roundCurrency(Math.max(toNumber(load.clientCharge), carrierCost));
    return { carrierCost, clientCharge, margin: roundCurrency(clientCharge - carrierCost), markupPct: 0, carrierRate: null, clientRate: null };
  }
  const ratedWeight = Math.max(1, toNumber(load.weight));
  const baseLinehaul = Math.max(carrierRate.minimumCharge || 0, ratedWeight * (carrierRate.linehaul || 0));
  const carrierFuel = baseLinehaul * ((carrierRate.fuelPct || 0) / 100);
  const carrierAccessorials = accessorialTotal + (carrierRate.accessorialFlat || 0);
  const carrierCost = roundCurrency(baseLinehaul + carrierFuel + carrierAccessorials);
  const percentMarkup = clientRate?.percentMarkup || 0;
  const flatMarkup = clientRate?.flatMarkup || 0;
  const clientFuel = carrierFuel * (1 + ((clientRate?.fuelMarkupPct || 0) / 100));
  const clientAccessorials = carrierAccessorials * (1 + ((clientRate?.accessorialMarkupPct || 0) / 100));
  let clientCharge = baseLinehaul * (1 + percentMarkup / 100) + flatMarkup + clientFuel + clientAccessorials;
  if (clientRate?.minimumMargin) {
    clientCharge = Math.max(clientCharge, carrierCost + clientRate.minimumMargin);
  }
  clientCharge = roundCurrency(clientCharge);
  return {
    carrierCost,
    clientCharge,
    margin: roundCurrency(clientCharge - carrierCost),
    markupPct: carrierCost ? roundCurrency(((clientCharge - carrierCost) / carrierCost) * 100) : 0,
    carrierRate,
    clientRate,
  };
}

function getTmsTotals(loads = state.tmsLoads) {
  return loads.reduce(
    (summary, load) => {
      const pricing = calculateTmsLoadPricing(load);
      summary.loads += 1;
      summary.open += ["draft", "quoted", "tendered", "dispatched", "picked_up", "in_transit", "exception"].includes(load.status) ? 1 : 0;
      summary.quoted += load.status === "quoted" ? 1 : 0;
      summary.tendered += ["tendered", "dispatched", "picked_up", "in_transit"].includes(load.status) ? 1 : 0;
      summary.inTransit += load.status === "in_transit" ? 1 : 0;
      summary.delivered += ["delivered", "closed"].includes(load.status) ? 1 : 0;
      summary.revenue += pricing.clientCharge;
      summary.cost += pricing.carrierCost;
      summary.margin += pricing.margin;
      return summary;
    },
    { loads: 0, open: 0, quoted: 0, tendered: 0, inTransit: 0, delivered: 0, revenue: 0, cost: 0, margin: 0 }
  );
}

function getUser(id) {
  return state.users.find((user) => user.id === id);
}

function formatUser(id, fallback = "-") {
  return getUser(id)?.name || cleanText(fallback) || "-";
}

function getAssignedUsers(record) {
  const ids = [...new Set([record.primaryUserId, ...(record.assignedUserIds || [])].filter(Boolean))];
  return ids.map((id) => getUser(id)?.name || id).join(", ") || "-";
}

function getOrderReference(type, id) {
  const record = getOrderOptions(type).find((option) => option.id === id);
  return record?.label || id || "-";
}

function getOrderOptions(type) {
  if (type === "receipt") {
    return state.receipts.map((row) => ({
      id: row.id,
      label: `${row.reference || row.id} - ${row.sku} inbound`,
      warehouseId: row.warehouseId,
      customerId: row.customerId,
    }));
  }
  if (type === "shipment") {
    return state.shipments.map((row) => ({
      id: row.id,
      label: `${row.reference || row.id} - ${row.sku} outbound`,
      warehouseId: row.warehouseId,
      customerId: row.customerId,
    }));
  }
  if (type === "pick") {
    return state.pickRequests.map((row) => ({
      id: row.id,
      label: `${row.reference || row.id} - ${getPickStatusLabel(row.status)}`,
      warehouseId: row.warehouseId,
      customerId: row.customerId,
    }));
  }
  if (type === "kit") {
    return state.kitOrders.map((row) => ({
      id: row.id,
      label: `${row.reference || row.id} - ${row.status}`,
      warehouseId: row.warehouseId,
      customerId: row.customerId,
    }));
  }
  if (type === "document") {
    return state.documentStages.map((row) => ({
      id: row.id,
      label: `${row.reference || row.id} - ${getDocumentStatusLabel(row.status)}`,
      warehouseId: row.warehouseId,
      customerId: row.customerId,
    }));
  }
  return [];
}

function getBalance(sku, bayCode, warehouseId = getActiveWarehouseId() || DEFAULT_WAREHOUSE_ID) {
  return state.inventory.find((row) => row.sku === sku && row.bayCode === bayCode && row.warehouseId === warehouseId);
}

function getOrCreateBalance(sku, bayCode, warehouseId = getActiveWarehouseId() || DEFAULT_WAREHOUSE_ID) {
  let balance = getBalance(sku, bayCode, warehouseId);
  if (!balance) {
    balance = { warehouseId, sku, bayCode, units: 0, pallets: 0 };
    state.inventory.push(balance);
  }
  return balance;
}

function getBayUsage(code, warehouseId = getActiveWarehouseId()) {
  return state.inventory
    .filter((row) => row.bayCode === code && (!warehouseId || row.warehouseId === warehouseId))
    .reduce(
      (usage, row) => {
        const sku = getSku(row.sku);
        usage.units += row.units || 0;
        usage.pallets += row.pallets || 0;
        usage.weight += (row.units || 0) * (sku?.weight || 0);
        return usage;
      },
      { units: 0, pallets: 0, weight: 0 }
    );
}

function capacityStatus(bay, usage = getBayUsage(bay.code, bay.warehouseId)) {
  const palletRatio = bay.maxPallets ? usage.pallets / bay.maxPallets : 0;
  const weightRatio = bay.maxWeight ? usage.weight / bay.maxWeight : 0;
  const ratio = Math.max(palletRatio, weightRatio);
  if (ratio > 1) return { label: "Over Capacity", className: "over" };
  if (ratio >= 0.85) return { label: "Near Capacity", className: "warn" };
  return { label: "Available", className: "ok" };
}

function showToast(message, type = "success") {
  clearTimeout(toastTimer);
  const toast = $("#toast");
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  toastTimer = setTimeout(() => {
    toast.className = "toast";
  }, 3200);
}

function emptyRow(message, colspan) {
  return `<tr class="empty-row"><td colspan="${colspan}">${message}</td></tr>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setOptions(select, records, valueKey, labelKey, placeholder) {
  if (!select) return;
  const current = select.value;
  select.innerHTML = `<option value="">${placeholder}</option>${records
    .map((record) => {
      const value = typeof valueKey === "function" ? valueKey(record) : record[valueKey];
      const label = typeof labelKey === "function" ? labelKey(record) : record[labelKey];
      return `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
    })
    .join("")}`;
  if ([...select.options].some((option) => option.value === current)) {
    select.value = current;
  }
}

function renderAll() {
  renderSelects();
  renderDashboard();
  renderGlobalSearch();
  renderWarehouses();
  renderSkuTable();
  renderBayTable();
  renderInventory();
  renderReceipts();
  renderShipments();
  renderReports();
  renderCustomReports();
  renderCustomers();
  renderLeases();
  renderUsersAndLabor();
  renderDocuments();
  renderPicks();
  renderKitting();
  renderTms();
  renderCustomerPortal();
  renderAdminFinance();
  renderRouteSelectors();
  renderSettings();
  renderInvoicePreview();
  renderAvailableStock();
}

function renderSelects() {
  const sortedWarehouses = [...state.warehouses].sort((a, b) => a.code.localeCompare(b.code));
  const sortedSkus = [...state.skus].sort((a, b) => a.sku.localeCompare(b.sku));
  const sortedBays = [...state.bays].sort((a, b) => `${a.warehouseId}${a.code}`.localeCompare(`${b.warehouseId}${b.code}`));
  const sortedCustomers = [...state.customers].sort((a, b) => a.name.localeCompare(b.name));
  const sortedUsers = [...state.users].sort((a, b) => a.name.localeCompare(b.name));
  const sortedTmsCarriers = [...state.tmsCarriers].sort((a, b) => a.name.localeCompare(b.name));
  const sortedTmsCarrierRates = [...state.tmsCarrierRates].sort((a, b) => a.laneName.localeCompare(b.laneName));
  const sortedTmsClientRates = [...state.tmsClientRates].sort((a, b) => a.name.localeCompare(b.name));
  const sortedTmsLoads = [...state.tmsLoads].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const skuLabel = (sku) => `${sku.sku} - ${sku.name}`;
  const warehouseLabel = (warehouse) => `${warehouse.code} - ${warehouse.name}`;
  const bayLabel = (bay) => `${getWarehouse(bay.warehouseId)?.code || "WH"} / ${bay.code} - ${bay.zone}`;
  const customerLabel = (customer) => `${customer.code} - ${customer.name}`;
  const tmsCarrierRateLabel = (rate) => `${getTmsCarrier(rate.carrierId)?.name || "Carrier"} / ${rate.laneName}`;
  const tmsClientRateLabel = (rate) => `${getCustomer(rate.customerId)?.code || "Customer"} / ${rate.name}`;
  const tmsLoadLabel = (load) => `${load.reference} - ${getCustomer(load.customerId)?.name || "Customer"}`;
  const activeWarehouse = getActiveWarehouseId();
  const receiveWarehouse = $("#receiveWarehouse")?.value || activeWarehouse || state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID;
  const outboundWarehouse = $("#outboundWarehouse")?.value || activeWarehouse || state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID;
  const kitWarehouse = $("#kitOrderWarehouse")?.value || activeWarehouse || state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID;
  const bayWarehouse = $("#bayWarehouse")?.value || activeWarehouse || state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID;
  const leaseWarehouse = $("#leaseWarehouse")?.value || activeWarehouse || state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID;

  ["#topWarehouseFilter", "#inventoryWarehouseFilter", "#reportWarehouse", "#customReportWarehouse", "#adminWarehouseFilter"].forEach(
    (selector) => setOptions($(selector), sortedWarehouses, "id", warehouseLabel, "All warehouses")
  );
  ["#bayWarehouse", "#receiveWarehouse", "#outboundWarehouse", "#kitTemplateWarehouse", "#kitOrderWarehouse", "#leaseWarehouse", "#pickWarehouse"].forEach(
    (selector) => setOptions($(selector), sortedWarehouses, "id", warehouseLabel, "Select warehouse")
  );
  if ($("#topWarehouseFilter")) $("#topWarehouseFilter").value = activeWarehouse;
  if ($("#bayWarehouse") && !$("#bayWarehouse").value) $("#bayWarehouse").value = bayWarehouse;
  if ($("#receiveWarehouse") && !$("#receiveWarehouse").value) $("#receiveWarehouse").value = receiveWarehouse;
  if ($("#outboundWarehouse") && !$("#outboundWarehouse").value) $("#outboundWarehouse").value = outboundWarehouse;
  if ($("#kitTemplateWarehouse") && !$("#kitTemplateWarehouse").value) $("#kitTemplateWarehouse").value = kitWarehouse;
  if ($("#kitOrderWarehouse") && !$("#kitOrderWarehouse").value) $("#kitOrderWarehouse").value = kitWarehouse;
  if ($("#leaseWarehouse") && !$("#leaseWarehouse").value) $("#leaseWarehouse").value = leaseWarehouse;
  if ($("#pickWarehouse") && !$("#pickWarehouse").value) $("#pickWarehouse").value = activeWarehouse || state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID;

  ["#receiveSku", "#outboundSku"].forEach((selector) =>
    setOptions($(selector), sortedSkus, "sku", skuLabel, "Select SKU")
  );
  setOptions($("#receiveBay"), sortedBays.filter((bay) => bay.warehouseId === ($("#receiveWarehouse")?.value || receiveWarehouse)), "code", bayLabel, "Select bay");
  setOptions($("#outboundBay"), sortedBays.filter((bay) => bay.warehouseId === ($("#outboundWarehouse")?.value || outboundWarehouse)), "code", bayLabel, "Select bay");
  ["#inventorySkuFilter", "#reportSku", "#customReportSku"].forEach((selector) =>
    setOptions($(selector), sortedSkus, "sku", skuLabel, "All SKUs")
  );
  ["#inventoryBayFilter", "#reportBay", "#customReportBay"].forEach((selector) =>
    setOptions($(selector), sortedBays, "code", bayLabel, "All bays")
  );
  ["#receiveCustomer", "#outboundCustomer", "#kitTemplateCustomer", "#kitOrderCustomer", "#leaseCustomer", "#adminCustomerFilter", "#pickCustomer", "#pickPortalCustomer", "#pickQueueCustomer"].forEach((selector) =>
    setOptions($(selector), sortedCustomers, "id", customerLabel, "Select customer")
  );
  ["#tmsOrderCustomer", "#tmsLoadCustomer", "#tmsLoadFilterCustomer", "#tmsClientRateCustomer", "#tmsReportCustomer", "#portalCustomerSelect"].forEach((selector) =>
    setOptions($(selector), sortedCustomers, "id", customerLabel, selector.includes("Filter") || selector.includes("Report") ? "All customers" : "Select customer")
  );
  ["#tmsOrderWarehouse", "#tmsLoadWarehouse", "#portalWarehouseSelect"].forEach((selector) =>
    setOptions($(selector), sortedWarehouses, "id", warehouseLabel, selector === "#portalWarehouseSelect" ? "All warehouses" : "Select warehouse")
  );
  ["#tmsLoadCarrier", "#tmsCarrierRateCarrier"].forEach((selector) =>
    setOptions($(selector), sortedTmsCarriers, "id", (carrier) => `${carrier.name} - ${carrier.scac || "No SCAC"}`, "Select carrier")
  );
  ["#tmsLoadCarrierRate", "#tmsClientRateCarrierRate"].forEach((selector) =>
    setOptions($(selector), sortedTmsCarrierRates, "id", tmsCarrierRateLabel, "Select carrier rate")
  );
  setOptions($("#tmsLoadClientRate"), sortedTmsClientRates, "id", tmsClientRateLabel, "Select client rate");
  ["#tmsOrderShipment", "#tmsLoadShipment"].forEach((selector) =>
    setOptions($(selector), state.shipments.map(normalizeShipment), "id", (shipment) => `${shipment.reference || shipment.id} - ${shipment.sku}`, "No WMS shipment")
  );
  setOptions($("#tmsBolLoadSelect"), sortedTmsLoads, "id", tmsLoadLabel, "Select load");
  ["#receiveAssignedUser", "#outboundAssignedUser", "#pickAssignedUser", "#laborUser", "#laborFilterUser", "#documentAssignedUser"].forEach((selector) =>
    setOptions($(selector), sortedUsers, "id", (user) => `${user.name} - ${user.role}`, "Select user")
  );
  if ($("#laborFilterUser")) $("#laborFilterUser").options[0].textContent = "All users";
  setOptions($("#userWarehouseLinks"), sortedWarehouses, "id", warehouseLabel, "No warehouses");
  ["#documentCustomer"].forEach((selector) => setOptions($(selector), sortedCustomers, "id", customerLabel, "Select customer"));
  ["#documentWarehouse", "#documentFilterWarehouse"].forEach((selector) =>
    setOptions($(selector), sortedWarehouses, "id", warehouseLabel, selector === "#documentFilterWarehouse" ? "All warehouses" : "Select warehouse")
  );
  if ($("#adminCustomerFilter")) $("#adminCustomerFilter").options[0].textContent = "All customers";
  if ($("#pickQueueCustomer")) $("#pickQueueCustomer").options[0].textContent = "All customers";
  ["#pickPortalWarehouse", "#pickQueueWarehouse"].forEach((selector) =>
    setOptions($(selector), sortedWarehouses, "id", warehouseLabel, "All warehouses")
  );
  setOptions($("#skuWarehouseLinks"), sortedWarehouses, "id", warehouseLabel, "No warehouses");
  setOptions($("#customerWarehouseLinks"), sortedWarehouses, "id", warehouseLabel, "No warehouses");
  setOptions($("#customerSkuLinks"), sortedSkus, "sku", skuLabel, "No SKUs");
  setOptions($("#customerBayLinks"), sortedBays, (bay) => bayKey(bay.warehouseId, bay.code), bayLabel, "No bays");
  setOptions($("#leaseBayLinks"), sortedBays.filter((bay) => bay.warehouseId === ($("#leaseWarehouse")?.value || leaseWarehouse)), (bay) => bayKey(bay.warehouseId, bay.code), bayLabel, "No bays");
  renderKitTemplateOptions();
  renderPickStatusOptions();
  renderLaborTaskOptions();
  renderDocumentStatusOptions();
  renderTmsOptions();
  renderOrderSelects();
  setCarrierOptions();
}

function setCarrierOptions() {
  const carrierSelect = $("#outboundCarrier");
  const serviceSelect = $("#outboundService");
  if (!carrierSelect || !serviceSelect) return;
  const currentCarrier = carrierSelect.value || state.carrierSettings?.defaultCarrier || "ups";
  carrierSelect.innerHTML = Object.entries(CARRIER_CATALOG)
    .map(([code, carrier]) => `<option value="${code}">${escapeHtml(carrier.name)}</option>`)
    .join("");
  carrierSelect.value = CARRIER_CATALOG[currentCarrier] ? currentCarrier : "ups";
  setServiceOptions();
}

function setServiceOptions() {
  const carrierCode = $("#outboundCarrier")?.value || "ups";
  const serviceSelect = $("#outboundService");
  if (!serviceSelect) return;
  const currentService = serviceSelect.value;
  const carrier = CARRIER_CATALOG[carrierCode] || CARRIER_CATALOG.ups;
  serviceSelect.innerHTML = carrier.services
    .map((service) => `<option value="${escapeHtml(service.code)}">${escapeHtml(service.label)}</option>`)
    .join("");
  serviceSelect.value = carrier.services.some((service) => service.code === currentService)
    ? currentService
    : carrier.services[0].code;
}

function renderPickStatusOptions() {
  const statusSelect = $("#pickQueueStatus");
  if (!statusSelect) return;
  const current = statusSelect.value;
  statusSelect.innerHTML = `<option value="">All statuses</option>${Object.entries(PICK_STATUSES)
    .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
    .join("")}`;
  if ([...statusSelect.options].some((option) => option.value === current)) statusSelect.value = current;
}

function renderLaborTaskOptions() {
  const selects = ["#laborTaskType", "#laborFilterTask"];
  selects.forEach((selector) => {
    const select = $(selector);
    if (!select) return;
    const current = select.value;
    const placeholder = selector === "#laborFilterTask" ? "All tasks" : "Select task";
    select.innerHTML = `<option value="">${placeholder}</option>${Object.entries(LABOR_TASK_TYPES)
      .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
      .join("")}`;
    if ([...select.options].some((option) => option.value === current)) select.value = current;
  });
  ["#laborOrderType", "#documentOrderType"].forEach((selector) => {
    const select = $(selector);
    if (!select) return;
    const current = select.value;
    select.innerHTML = Object.entries(ORDER_TYPES)
      .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
      .join("");
    if ([...select.options].some((option) => option.value === current)) select.value = current;
    else select.value = selector === "#documentOrderType" ? "shipment" : "pick";
  });
}

function renderDocumentStatusOptions() {
  const select = $("#documentFilterStatus");
  if (!select) return;
  const current = select.value;
  select.innerHTML = `<option value="">All statuses</option>${Object.entries(DOCUMENT_STATUSES)
    .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
    .join("")}`;
  if ([...select.options].some((option) => option.value === current)) select.value = current;
}

function renderTmsOptions() {
  ["#tmsOrderMode", "#tmsLoadMode", "#tmsCarrierRateMode", "#tmsClientRateMode", "#tmsReportMode"].forEach((selector) => {
    const select = $(selector);
    if (!select) return;
    const current = select.value;
    const placeholder = selector === "#tmsReportMode" ? `<option value="">All modes</option>` : "";
    select.innerHTML = `${placeholder}${Object.entries(TMS_MODES)
      .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
      .join("")}`;
    if ([...select.options].some((option) => option.value === current)) select.value = current;
  });
  ["#tmsLoadStatus", "#tmsLoadFilterStatus", "#tmsReportStatus"].forEach((selector) => {
    const select = $(selector);
    if (!select) return;
    const current = select.value;
    const placeholder = selector === "#tmsLoadStatus" ? "" : `<option value="">All statuses</option>`;
    select.innerHTML = `${placeholder}${Object.entries(TMS_LOAD_STATUSES)
      .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
      .join("")}`;
    if ([...select.options].some((option) => option.value === current)) select.value = current;
  });
  ["#tmsLoadClass", "#tmsCarrierRateClass"].forEach((selector) => {
    const select = $(selector);
    if (!select) return;
    const current = select.value;
    select.innerHTML = FREIGHT_CLASSES.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
    select.value = FREIGHT_CLASSES.includes(current) ? current : "70";
  });
  const modeGrid = $("#tmsCarrierModes");
  if (modeGrid && !modeGrid.children.length) {
    modeGrid.innerHTML = Object.entries(TMS_MODES)
      .map(([value, label]) => `<label class="checkbox-option"><input type="checkbox" value="${escapeHtml(value)}" ${value === "ltl" ? "checked" : ""} /><span>${escapeHtml(label)}</span></label>`)
      .join("");
  }
}

function renderOrderSelects() {
  [
    ["#laborOrderType", "#laborOrderId"],
    ["#documentOrderType", "#documentOrderId"],
  ].forEach(([typeSelector, orderSelector]) => {
    const type = $(typeSelector)?.value || "pick";
    const select = $(orderSelector);
    if (!select) return;
    const current = select.value;
    const options = getOrderOptions(type);
    select.innerHTML = `<option value="">Manual / not attached</option>${options
      .map((option) => `<option value="${escapeHtml(option.id)}">${escapeHtml(option.label)}</option>`)
      .join("")}`;
    if ([...select.options].some((option) => option.value === current)) select.value = current;
  });
}

function renderDashboard() {
  const activeWarehouse = getActiveWarehouseId();
  const inventoryRows = state.inventory.filter((row) => warehouseMatches(row, activeWarehouse));
  const bayRows = state.bays.filter((bay) => warehouseMatches(bay, activeWarehouse));
  const shipmentRows = state.shipments.filter((shipment) => warehouseMatches(shipment, activeWarehouse));
  const totals = inventoryRows.reduce(
    (summary, row) => {
      const sku = getSku(row.sku);
      summary.units += row.units || 0;
      summary.pallets += row.pallets || 0;
      summary.weight += (row.units || 0) * (sku?.weight || 0);
      return summary;
    },
    { units: 0, pallets: 0, weight: 0 }
  );
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const outbound30 = shipmentRows.filter((shipment) => new Date(shipment.date) >= since).length;

  $("#metricSkuCount").textContent = state.skus.filter((sku) => !activeWarehouse || sku.warehouseIds?.includes(activeWarehouse)).length;
  $("#metricBayCount").textContent = bayRows.length;
  $("#metricUnits").textContent = formatNumber(totals.units);
  $("#metricPallets").textContent = formatNumber(totals.pallets);
  $("#metricWeight").textContent = formatWeight(totals.weight);
  $("#metricOutbound").textContent = outbound30;
  $("#inventoryHealth").textContent = totals.units ? "Inventory Active" : "No Inventory";

  $("#dashboardBayTable").innerHTML =
    bayRows
      .map((bay) => {
        const usage = getBayUsage(bay.code, bay.warehouseId);
        const status = capacityStatus(bay, usage);
        return `
          <tr>
            <td><strong>${escapeHtml(bay.code)}</strong><br><span class="subtle">${escapeHtml(getWarehouse(bay.warehouseId)?.code || "")}</span></td>
            <td>${escapeHtml(bay.zone || "-")}</td>
            <td>${formatNumber(usage.pallets)} / ${formatNumber(bay.maxPallets)}</td>
            <td>${formatWeight(usage.weight)} / ${formatWeight(bay.maxWeight)}</td>
            <td><span class="mini-pill ${status.className}">${status.label}</span></td>
          </tr>
        `;
      })
      .join("") || emptyRow("No bays yet", 5);

  $("#dashboardOutboundTable").innerHTML =
    [...shipmentRows]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8)
      .map(
        (shipment) => `
          <tr>
            <td>${escapeHtml(shipment.date)}</td>
            <td><strong>${escapeHtml(shipment.sku)}</strong></td>
            <td>${escapeHtml(shipment.bayCode)}</td>
            <td>${formatNumber(shipment.units)}</td>
            <td>${formatWeight(shipment.totalWeight)}</td>
          </tr>
        `
      )
      .join("") || emptyRow("No outbound shipments yet", 5);
}

function renderGlobalSearch() {
  const query = cleanText($("#globalSearch")?.value).toLowerCase();
  const type = $("#globalSearchType")?.value || "";
  const activeWarehouse = getActiveWarehouseId();
  const rows = [];
  const addRow = (recordType, warehouseId, customerId, record, details, searchable) => {
    if (type && type !== recordType) return;
    if (activeWarehouse && warehouseId && warehouseId !== activeWarehouse) return;
    const haystack = `${recordType} ${formatWarehouse(warehouseId)} ${getCustomer(customerId)?.name || ""} ${record} ${details} ${searchable || ""}`.toLowerCase();
    if (query && !haystack.includes(query)) return;
    rows.push({ recordType, warehouseId, customerId, record, details });
  };

  state.inventory.forEach((row) => {
    const sku = getSku(row.sku);
    addRow("inventory", row.warehouseId, "", row.sku, `${row.bayCode}, ${formatNumber(row.units)} units`, sku?.name);
  });
  state.bays.forEach((bay) => addRow("bay", bay.warehouseId, "", bay.code, `${bay.zone}, ${formatNumber(bay.maxPallets)} pallet cap`, bay.notes));
  state.receipts.forEach((receipt) => addRow("receipt", receipt.warehouseId, receipt.customerId, receipt.reference || receipt.id, `${receipt.sku} into ${receipt.bayCode}`, receipt.origin));
  state.shipments.forEach((shipment) => addRow("shipment", shipment.warehouseId, shipment.customerId, shipment.reference || shipment.id, `${shipment.sku} to ${shipment.destination || "-"}`, shipment.trackingNumber));
  state.customers.forEach((customer) => {
    const warehouses = customer.warehouseIds?.length ? customer.warehouseIds : [""];
    warehouses.forEach((warehouseId) => addRow("customer", warehouseId, customer.id, customer.code, customer.name, `${customer.email} ${customer.phone}`));
  });
  state.users.forEach((user) => {
    const warehouses = user.warehouseIds?.length ? user.warehouseIds : [""];
    warehouses.forEach((warehouseId) => addRow("user", warehouseId, "", user.name, `${user.role}, ${user.status}`, `${user.authUserId} ${user.contact}`));
  });
  state.laborEntries.forEach((entry) =>
    addRow("labor", entry.warehouseId, entry.customerId, formatUser(entry.userId), `${LABOR_TASK_TYPES[entry.taskType] || entry.taskType}, ${formatNumber(entry.hours)} hours`, getOrderReference(entry.orderType, entry.orderId))
  );
  state.documentStages.forEach((stage) =>
    addRow("document", stage.warehouseId, stage.customerId, stage.reference || stage.id, `${getDocumentStatusLabel(stage.status)}, ${stage.requiredDocs.join(", ") || "No checklist"}`, stage.receivedDocs.join(", "))
  );
  state.pickRequests.forEach((request) => addRow("pick", request.warehouseId, request.customerId, request.reference || request.id, `${getPickStatusLabel(request.status)}, ${getPickTotals(request).quantity} units`, request.destination));
  state.kitOrders.forEach((order) => addRow("kit", order.warehouseId, order.customerId, order.reference, `${order.status}, ${order.lines.length} lines`, ""));
  state.customerLeases.forEach((lease) => {
    const charge = calculateLeaseCharge(lease);
    addRow("lease", lease.warehouseId, lease.customerId, lease.id, `${formatCurrency(charge.total)} monthly billing`, lease.status);
  });
  state.tmsLoads.forEach((load) => {
    const pricing = calculateTmsLoadPricing(load);
    addRow("tms-load", load.warehouseId, load.customerId, load.reference, `${TMS_LOAD_STATUSES[load.status] || load.status}, ${formatCurrency(pricing.clientCharge)}`, `${load.origin} ${load.destination} ${load.proNumber}`);
  });
  state.tmsCarriers.forEach((carrier) =>
    addRow("tms-carrier", "", "", carrier.name, `${carrier.scac || "No SCAC"}, ${carrier.modes.map((mode) => TMS_MODES[mode]).join(", ")}`, `${carrier.serviceAreas} ${carrier.notes}`)
  );

  $("#globalSearchTable").innerHTML =
    rows
      .slice(0, 40)
      .map(
        (row) => `
          <tr>
            <td><span class="mini-pill">${escapeHtml(row.recordType)}</span></td>
            <td>${escapeHtml(row.warehouseId ? formatWarehouse(row.warehouseId) : "All warehouses")}</td>
            <td>${escapeHtml(getCustomer(row.customerId)?.name || "-")}</td>
            <td><strong>${escapeHtml(row.record)}</strong></td>
            <td>${escapeHtml(row.details || "-")}</td>
          </tr>
        `
      )
      .join("") || emptyRow("No records match this search", 5);
}

function renderWarehouses() {
  const query = cleanText($("#warehouseSearch")?.value).toLowerCase();
  const records = state.warehouses
    .filter((warehouse) => {
      const haystack = `${warehouse.code} ${warehouse.name} ${warehouse.city} ${warehouse.state} ${warehouse.notes}`.toLowerCase();
      return !query || haystack.includes(query);
    })
    .sort((a, b) => a.code.localeCompare(b.code));

  $("#warehouseTable").innerHTML =
    records
      .map((warehouse) => {
        const skuCount = state.skus.filter((sku) => sku.warehouseIds?.includes(warehouse.id)).length;
        const bayCount = state.bays.filter((bay) => bay.warehouseId === warehouse.id).length;
        const inventory = state.inventory
          .filter((row) => row.warehouseId === warehouse.id)
          .reduce((sum, row) => sum + (row.units || 0), 0);
        const leaseTotal = state.customerLeases
          .filter((lease) => lease.warehouseId === warehouse.id && lease.status === "active")
          .reduce((sum, lease) => sum + calculateLeaseCharge(lease).total, 0);
        return `
          <tr>
            <td><strong>${escapeHtml(warehouse.code)}</strong><br>${escapeHtml(warehouse.name)}</td>
            <td>${escapeHtml([warehouse.city, warehouse.state].filter(Boolean).join(", ") || warehouse.address || "-")}</td>
            <td><span class="mini-pill ${warehouse.status === "active" ? "ok" : "warn"}">${escapeHtml(warehouse.status)}</span></td>
            <td>${formatNumber(skuCount)}</td>
            <td>${formatNumber(bayCount)}</td>
            <td>${formatNumber(inventory)} units</td>
            <td>${formatCurrency(leaseTotal)}</td>
            <td>
              <div class="table-actions">
                <button class="table-action" type="button" data-edit-warehouse="${escapeHtml(warehouse.id)}">Edit</button>
                <button class="table-action danger" type="button" data-delete-warehouse="${escapeHtml(warehouse.id)}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("") || emptyRow("No warehouses yet", 8);
}

function renderSkuTable() {
  const query = cleanText($("#skuSearch").value).toLowerCase();
  const activeWarehouse = getActiveWarehouseId();
  const records = state.skus
    .filter((sku) => {
      const warehouses = (sku.warehouseIds || []).map(formatWarehouse).join(" ");
      const haystack = `${sku.sku} ${sku.name} ${sku.notes} ${warehouses}`.toLowerCase();
      return !query || haystack.includes(query);
    })
    .filter((sku) => !activeWarehouse || sku.warehouseIds?.includes(activeWarehouse))
    .sort((a, b) => a.sku.localeCompare(b.sku));

  $("#skuTable").innerHTML =
    records
      .map(
        (sku) => `
          <tr>
            <td><strong>${escapeHtml(sku.sku)}</strong></td>
            <td>${escapeHtml(sku.name)}</td>
            <td>${formatDimensions(sku)}</td>
            <td>${formatWeight(sku.weight)}</td>
            <td>${escapeHtml((sku.warehouseIds || []).map((id) => getWarehouse(id)?.code || id).join(", ") || "-")}</td>
            <td>${escapeHtml(sku.notes || "-")}</td>
            <td>
              <div class="table-actions">
                <button class="table-action" type="button" data-edit-sku="${escapeHtml(sku.sku)}">Edit</button>
                <button class="table-action danger" type="button" data-delete-sku="${escapeHtml(sku.sku)}">Delete</button>
              </div>
            </td>
          </tr>
        `
      )
      .join("") || emptyRow("No SKUs yet", 7);
}

function renderBayTable() {
  const query = cleanText($("#baySearch").value).toLowerCase();
  const activeWarehouse = getActiveWarehouseId();
  const records = state.bays
    .filter((bay) => {
      const haystack = `${bay.code} ${bay.zone} ${bay.notes} ${formatWarehouse(bay.warehouseId)}`.toLowerCase();
      return !query || haystack.includes(query);
    })
    .filter((bay) => warehouseMatches(bay, activeWarehouse))
    .sort((a, b) => `${a.warehouseId}${a.code}`.localeCompare(`${b.warehouseId}${b.code}`));

  $("#bayTable").innerHTML =
    records
      .map((bay) => {
        const usage = getBayUsage(bay.code, bay.warehouseId);
        const status = capacityStatus(bay, usage);
        return `
          <tr>
            <td><strong>${escapeHtml(bay.code)}</strong></td>
            <td>${escapeHtml(getWarehouse(bay.warehouseId)?.code || "-")}</td>
            <td>${escapeHtml(bay.zone || "-")}</td>
            <td>${formatNumber(bay.maxPallets)}</td>
            <td>${formatWeight(bay.maxWeight)}</td>
            <td>${formatDimensions(bay)}</td>
            <td><span class="mini-pill ${status.className}">${status.label}</span></td>
            <td>
              <div class="table-actions">
                <button class="table-action" type="button" data-edit-bay="${escapeHtml(bayKey(bay.warehouseId, bay.code))}">Edit</button>
                <button class="table-action danger" type="button" data-delete-bay="${escapeHtml(bayKey(bay.warehouseId, bay.code))}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("") || emptyRow("No bays yet", 8);
}

function renderInventory() {
  const query = cleanText($("#inventorySearch").value).toLowerCase();
  const skuFilter = $("#inventorySkuFilter").value;
  const bayFilter = $("#inventoryBayFilter").value;
  const warehouseFilter = $("#inventoryWarehouseFilter").value || getActiveWarehouseId();

  const rows = state.inventory
    .filter((row) => (row.units || 0) > 0 || (row.pallets || 0) > 0)
    .filter((row) => !warehouseFilter || row.warehouseId === warehouseFilter)
    .filter((row) => !skuFilter || row.sku === skuFilter)
    .filter((row) => !bayFilter || row.bayCode === bayFilter)
    .filter((row) => {
      const sku = getSku(row.sku);
      const bay = getBay(row.bayCode, row.warehouseId);
      const haystack = `${row.sku} ${sku?.name || ""} ${row.bayCode} ${bay?.zone || ""} ${formatWarehouse(row.warehouseId)}`.toLowerCase();
      return !query || haystack.includes(query);
    })
    .sort((a, b) => `${a.warehouseId}${a.bayCode}${a.sku}`.localeCompare(`${b.warehouseId}${b.bayCode}${b.sku}`));

  $("#inventoryTable").innerHTML =
    rows
      .map((row) => {
        const sku = getSku(row.sku);
        const bay = getBay(row.bayCode, row.warehouseId);
        const usage = bay ? getBayUsage(bay.code, bay.warehouseId) : { weight: 0, pallets: 0 };
        const status = bay ? capacityStatus(bay, usage) : { label: "Missing bay", className: "warn" };
        return `
          <tr>
            <td><strong>${escapeHtml(row.sku)}</strong></td>
            <td>${escapeHtml(getWarehouse(row.warehouseId)?.code || "-")}</td>
            <td>${escapeHtml(sku?.name || "Missing SKU")}</td>
            <td>${escapeHtml(row.bayCode)}</td>
            <td>${escapeHtml(bay?.zone || "-")}</td>
            <td>${formatNumber(row.units)}</td>
            <td>${formatNumber(row.pallets)}</td>
            <td>${formatWeight((row.units || 0) * (sku?.weight || 0))}</td>
            <td><span class="mini-pill ${status.className}">${status.label}</span></td>
          </tr>
        `;
      })
      .join("") || emptyRow("No inventory balances match", 9);
}

function renderReceipts() {
  const activeWarehouse = getActiveWarehouseId();
  $("#receiptTable").innerHTML =
    [...state.receipts]
      .filter((receipt) => warehouseMatches(receipt, activeWarehouse))
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(
        (receipt) => `
          <tr>
            <td>${escapeHtml(receipt.date)}</td>
            <td>${escapeHtml(receipt.reference || "-")}</td>
            <td>${escapeHtml(getWarehouse(receipt.warehouseId)?.code || "-")}</td>
            <td><strong>${escapeHtml(receipt.sku)}</strong></td>
            <td>${escapeHtml(receipt.bayCode)}</td>
            <td>${formatNumber(receipt.units)}</td>
            <td>${formatNumber(receipt.pallets)}</td>
            <td>${escapeHtml(getAssignedUsers(receipt))}</td>
          </tr>
        `
      )
      .join("") || emptyRow("No receipts yet", 8);
}

function renderShipments() {
  const activeWarehouse = getActiveWarehouseId();
  $("#shipmentTable").innerHTML =
    [...state.shipments]
      .filter((shipment) => warehouseMatches(shipment, activeWarehouse))
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((shipment) => {
        const normalized = normalizeShipment(shipment);
        return `
          <tr>
            <td>${escapeHtml(normalized.date)}</td>
            <td>${escapeHtml(normalized.reference || "-")}</td>
            <td>${escapeHtml(getWarehouse(normalized.warehouseId)?.code || "-")}</td>
            <td>${escapeHtml(normalized.origin || "-")}</td>
            <td>${escapeHtml(normalized.destination || "-")}</td>
            <td><strong>${escapeHtml(normalized.sku)}</strong></td>
            <td>${escapeHtml(normalized.bayCode)}</td>
            <td>${formatNumber(normalized.units)}</td>
            <td>${formatNumber(normalized.pallets)}</td>
            <td>${formatWeight(normalized.totalWeight)}</td>
            <td>${escapeHtml(getCarrierLabel(normalized.carrier, normalized.service))}</td>
            <td><span class="mini-pill ${getCarrierStatusClass(normalized.carrierStatus)}">${escapeHtml(normalized.carrierStatus)}</span></td>
            <td>${normalized.trackingNumber ? `<a href="${escapeHtml(getTrackingLink(normalized))}" target="_blank" rel="noreferrer">${escapeHtml(normalized.trackingNumber)}</a>` : "-"}</td>
            <td>${escapeHtml(getAssignedUsers(normalized))}</td>
            <td>
              <button class="table-action" type="button" data-invoice-shipment="${escapeHtml(normalized.id)}">
                ${formatCurrency(normalized.invoiceTotal)}
              </button>
            </td>
            <td>
              <button class="table-action" type="button" data-send-carrier="${escapeHtml(normalized.id)}">
                ${normalized.carrierStatus === "Submitted" ? "Resend" : "Send"}
              </button>
            </td>
          </tr>
        `;
      })
      .join("") || emptyRow("No shipments yet", 16);
}

function getFilteredShipments() {
  const from = $("#reportFrom").value;
  const to = $("#reportTo").value;
  const sku = $("#reportSku").value;
  const bay = $("#reportBay").value;
  const warehouse = $("#reportWarehouse").value || getActiveWarehouseId();
  return state.shipments
    .filter((shipment) => !from || shipment.date >= from)
    .filter((shipment) => !to || shipment.date <= to)
    .filter((shipment) => !warehouse || shipment.warehouseId === warehouse)
    .filter((shipment) => !sku || shipment.sku === sku)
    .filter((shipment) => !bay || shipment.bayCode === bay)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function renderReports() {
  const shipments = getFilteredShipments();
  const totals = shipments.reduce(
    (summary, shipment) => {
      summary.units += shipment.units || 0;
      summary.pallets += shipment.pallets || 0;
      summary.weight += shipment.totalWeight || 0;
      summary.charges += normalizeShipment(shipment).invoiceTotal || 0;
      return summary;
    },
    { units: 0, pallets: 0, weight: 0, charges: 0 }
  );

  $("#reportShipments").textContent = shipments.length;
  $("#reportUnits").textContent = formatNumber(totals.units);
  $("#reportPallets").textContent = formatNumber(totals.pallets);
  $("#reportWeight").textContent = formatWeight(totals.weight);
  $("#reportCharges").textContent = formatCurrency(totals.charges);

  $("#reportTable").innerHTML =
    shipments
      .map((shipment) => {
        const normalized = normalizeShipment(shipment);
        const sku = getSku(shipment.sku);
        return `
          <tr>
            <td>${escapeHtml(normalized.date)}</td>
            <td>${escapeHtml(normalized.reference || "-")}</td>
            <td>${escapeHtml(getWarehouse(normalized.warehouseId)?.code || "-")}</td>
            <td>${escapeHtml(normalized.destination || "-")}</td>
            <td><strong>${escapeHtml(normalized.sku)}</strong></td>
            <td>${escapeHtml(sku?.name || "-")}</td>
            <td>${escapeHtml(normalized.bayCode)}</td>
            <td>${escapeHtml(getCarrierLabel(normalized.carrier, normalized.service))}</td>
            <td>${normalized.trackingNumber ? `<a href="${escapeHtml(getTrackingLink(normalized))}" target="_blank" rel="noreferrer">${escapeHtml(normalized.trackingNumber)}</a>` : "-"}</td>
            <td>${formatNumber(normalized.units)}</td>
            <td>${formatNumber(normalized.pallets)}</td>
            <td>${formatWeight(normalized.totalWeight)}</td>
            <td>${formatCurrency(normalized.invoiceTotal)}</td>
          </tr>
        `;
      })
      .join("") || emptyRow("No outbound activity matches", 13);
}

function renderAvailableStock() {
  const sku = $("#outboundSku").value;
  const bay = $("#outboundBay").value;
  const warehouseId = $("#outboundWarehouse").value || getActiveWarehouseId() || DEFAULT_WAREHOUSE_ID;
  const balance = sku && bay ? getBalance(sku, bay, warehouseId) : null;
  $("#availableStockPill").textContent = balance
    ? `${formatNumber(balance.units)} units, ${formatNumber(balance.pallets)} pallets available`
    : "Select stock";
}

function renderInvoicePreview() {
  const panel = $("#invoicePanel");
  const preview = $("#invoicePreview");
  const shipment = selectedInvoiceId
    ? normalizeShipment(state.shipments.find((item) => item.id === selectedInvoiceId) || {})
    : null;

  if (!shipment?.id) {
    panel.classList.add("muted-panel");
    preview.innerHTML = `<p class="empty-invoice">Select an invoice amount in Shipment History after recording outbound freight.</p>`;
    return;
  }

  panel.classList.remove("muted-panel");
  const sku = getSku(shipment.sku);
  const accessorials = normalizeAccessorials(shipment.accessorials);
  const accessorialRows =
    accessorials
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.name)}</td>
            <td>${formatCurrency(item.amount)}</td>
          </tr>
        `
      )
      .join("") || `<tr><td>Accessorials</td><td>${formatCurrency(0)}</td></tr>`;

  preview.innerHTML = `
    <div class="invoice-header">
      <div>
        <p class="eyebrow">Invoice</p>
        <h3>${escapeHtml(shipment.reference || shipment.id)}</h3>
      </div>
      <div>
        <span>Date</span>
        <strong>${escapeHtml(shipment.date || todayISO())}</strong>
      </div>
    </div>
    <div class="invoice-grid">
      <div>
        <span>Warehouse</span>
        <strong>${escapeHtml(formatWarehouse(shipment.warehouseId))}</strong>
      </div>
      <div>
        <span>Start Location</span>
        <strong>${escapeHtml(shipment.origin || "-")}</strong>
      </div>
      <div>
        <span>Destination</span>
        <strong>${escapeHtml(shipment.destination || "-")}</strong>
      </div>
      <div>
        <span>Miles</span>
        <strong>${formatNumber(shipment.miles)}</strong>
      </div>
      <div>
        <span>Carrier</span>
        <strong>${escapeHtml(getCarrierLabel(shipment.carrier, shipment.service))}</strong>
      </div>
      <div>
        <span>Status</span>
        <strong>${escapeHtml(shipment.carrierStatus || "Draft")}</strong>
      </div>
      <div>
        <span>Tracking</span>
        <strong>${shipment.trackingNumber ? `<a href="${escapeHtml(getTrackingLink(shipment))}" target="_blank" rel="noreferrer">${escapeHtml(shipment.trackingNumber)}</a>` : "-"}</strong>
      </div>
      <div>
        <span>SKU / Weight</span>
        <strong>${escapeHtml(shipment.sku)} ${sku?.name ? `- ${escapeHtml(sku.name)}` : ""} / ${formatWeight(shipment.totalWeight)}</strong>
      </div>
    </div>
    <table class="invoice-table">
      <tbody>
        <tr>
          <td>Freight Charge</td>
          <td>${formatCurrency(shipment.freightCharge)}</td>
        </tr>
        <tr>
          <td>Fuel Charge</td>
          <td>${formatCurrency(shipment.fuelCharge)}</td>
        </tr>
        ${accessorialRows}
      </tbody>
      <tfoot>
        <tr>
          <th>Total Due</th>
          <th>${formatCurrency(shipment.invoiceTotal)}</th>
        </tr>
      </tfoot>
    </table>
  `;
}

function renderCustomFieldOptions() {
  const source = $("#customReportSource").value || "shipments";
  const selectedFields = new Set(DEFAULT_REPORT_FIELDS[source] || []);
  $("#customReportFields").innerHTML = (REPORT_COLUMNS[source] || [])
    .map(
      (field) => `
        <label class="checkbox-option">
          <input type="checkbox" value="${escapeHtml(field.key)}" ${selectedFields.has(field.key) ? "checked" : ""} />
          <span>${escapeHtml(field.label)}</span>
        </label>
      `
    )
    .join("");
}

function getReportDefinitionFromForm() {
  const source = $("#customReportSource").value || "shipments";
  const checkedFields = [...$("#customReportFields").querySelectorAll("input:checked")].map(
    (input) => input.value
  );
  return {
    id: uid("RPT"),
    name: cleanText($("#customReportName").value) || "Custom Report",
    source,
    filters: {
      warehouse: $("#customReportWarehouse").value,
      sku: $("#customReportSku").value,
      bay: $("#customReportBay").value,
      from: $("#customReportFrom").value,
      to: $("#customReportTo").value,
    },
    fields: checkedFields.length ? checkedFields : DEFAULT_REPORT_FIELDS[source],
    createdAt: todayISO(),
  };
}

function getCustomReportRows(report) {
  if (!report) return [];
  const filters = report.filters || {};
  const source = report.source || "shipments";
  const rows =
    source === "inventory"
      ? state.inventory.filter((row) => (row.units || 0) > 0 || (row.pallets || 0) > 0)
      : source === "receipts"
        ? state.receipts
        : source === "tmsLoads" || source === "tmsCustomerLoads"
          ? state.tmsLoads.map(normalizeTmsLoad)
        : source === "tmsCarrierRates"
          ? state.tmsCarrierRates.map(normalizeTmsCarrierRate)
        : source === "tmsClientRates"
          ? state.tmsClientRates.map(normalizeTmsClientRate)
        : source === "leases"
          ? state.customerLeases
          : source === "labor"
            ? state.laborEntries.map(normalizeLaborEntry)
          : source === "documents"
            ? state.documentStages.map(normalizeDocumentStage)
          : source === "users"
            ? state.users.map(normalizeUserProfile)
          : source === "picks"
            ? state.pickRequests.map(normalizePickRequest)
          : state.shipments.map(normalizeShipment);

  return rows
    .filter((row) => !filters.warehouse || row.warehouseId === filters.warehouse)
    .filter((row) => !filters.sku || !("sku" in row) || row.sku === filters.sku)
    .filter((row) => !filters.bay || !("bayCode" in row) || row.bayCode === filters.bay)
    .filter((row) => source !== "tmsCustomerLoads" || !filters.customer || row.customerId === filters.customer)
    .filter((row) => source === "inventory" || source === "leases" || source === "users" || source === "tmsCarrierRates" || source === "tmsClientRates" || !filters.from || (row.date || row.shipDate || row.createdAt || row.endTime || "") >= filters.from)
    .filter((row) => source === "inventory" || source === "leases" || source === "users" || source === "tmsCarrierRates" || source === "tmsClientRates" || !filters.to || (row.date || row.shipDate || row.createdAt || row.endTime || "") <= filters.to)
    .sort((a, b) => {
      if (source === "inventory") return `${a.bayCode}${a.sku}`.localeCompare(`${b.bayCode}${b.sku}`);
      return String(b.date || "").localeCompare(String(a.date || ""));
    });
}

function renderCustomReports() {
  renderCustomFieldOptions();
  $("#savedReportsTable").innerHTML =
    state.customReports
      .map((report) => {
        const rows = getCustomReportRows(report);
        return `
          <tr>
            <td><strong>${escapeHtml(report.name)}</strong></td>
            <td>${escapeHtml(report.source || "shipments")}</td>
            <td>${formatNumber(rows.length)}</td>
            <td>
              <div class="table-actions">
                <button class="table-action" type="button" data-run-report="${escapeHtml(report.id)}">Run</button>
                <button class="table-action danger" type="button" data-delete-report="${escapeHtml(report.id)}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("") || emptyRow("No saved reports yet", 4);

  renderCustomReportOutput(activeCustomReport);
}

function renderCustomReportOutput(report) {
  const head = $("#customReportHead");
  const body = $("#customReportBody");
  const source = report?.source || "shipments";
  const fieldMap = new Map((REPORT_COLUMNS[source] || []).map((field) => [field.key, field]));
  const fields = (report?.fields || DEFAULT_REPORT_FIELDS[source] || []).map((key) => fieldMap.get(key)).filter(Boolean);
  const rows = getCustomReportRows(report);
  const totals = rows.reduce(
    (summary, row) => {
      summary.units += row.units || 0;
      summary.pallets += row.pallets || 0;
      summary.value += source === "shipments"
        ? normalizeShipment(row).invoiceTotal || 0
        : source === "tmsLoads" || source === "tmsCustomerLoads"
          ? calculateTmsLoadPricing(row).clientCharge
        : source === "leases"
          ? calculateLeaseCharge(row).total
          : source === "labor"
            ? row.billable ? (row.hours || 0) * (row.rate || 0) : 0
          : source === "picks"
            ? getPickBilling(row).total
          : 0;
      return summary;
    },
    { units: 0, pallets: 0, value: 0 }
  );

  $("#activeCustomReportName").textContent = report?.name || "No report selected";
  $("#customReportRows").textContent = formatNumber(rows.length);
  $("#customReportUnits").textContent = formatNumber(totals.units);
  $("#customReportPallets").textContent = formatNumber(totals.pallets);
  $("#customReportValue").textContent = formatCurrency(totals.value);

  if (!report) {
    head.innerHTML = "";
    body.innerHTML = emptyRow("Build or run a custom report to see results", 1);
    return;
  }

  head.innerHTML = `
    <tr>
      ${fields.map((field) => `<th>${escapeHtml(field.label)}</th>`).join("")}
    </tr>
  `;
  body.innerHTML =
    rows
      .map(
        (row) => `
          <tr>
            ${fields.map((field) => `<td>${escapeHtml(field.value(row))}</td>`).join("")}
          </tr>
        `
      )
      .join("") || emptyRow("No rows match this custom report", fields.length || 1);
}

function renderCustomers() {
  $("#customerTable").innerHTML =
    state.customers
      .map((customer) => {
        const openKits = state.kitOrders.filter(
          (order) => order.customerId === customer.id && !["completed", "canceled", "rejected"].includes(order.status)
        ).length;
        return `
          <tr>
            <td><strong>${escapeHtml(customer.code)}</strong><br>${escapeHtml(customer.name)}</td>
            <td>${escapeHtml(customer.contact || "-")}<br>${escapeHtml(customer.email || customer.phone || "")}</td>
            <td>${escapeHtml((customer.warehouseIds || []).map((id) => getWarehouse(id)?.code || id).join(", ") || "-")}</td>
            <td>${formatNumber(customer.skuLinks.length)}</td>
            <td>${formatNumber(customer.bayLinks.length)}</td>
            <td>${formatNumber(openKits)}</td>
            <td>
              <div class="table-actions">
                <button class="table-action" type="button" data-edit-customer="${escapeHtml(customer.id)}">Edit</button>
                <button class="table-action danger" type="button" data-delete-customer="${escapeHtml(customer.id)}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("") || emptyRow("No customers yet", 7);
}

function renderLeases() {
  const activeWarehouse = getActiveWarehouseId();
  const leases = state.customerLeases
    .filter((lease) => warehouseMatches(lease, activeWarehouse))
    .sort((a, b) => `${a.customerId}${a.warehouseId}`.localeCompare(`${b.customerId}${b.warehouseId}`));

  $("#leaseTable").innerHTML =
    leases
      .map((lease) => {
        const customer = getCustomer(lease.customerId);
        const charge = calculateLeaseCharge(lease);
        return `
          <tr>
            <td><strong>${escapeHtml(customer?.name || "-")}</strong></td>
            <td>${escapeHtml(getWarehouse(lease.warehouseId)?.code || "-")}</td>
            <td>${escapeHtml(lease.bayKeys.map(formatBayKey).join(", ") || "-")}</td>
            <td>${formatCurrency(lease.monthlyRate)}</td>
            <td>${formatNumber(charge.usage.pallets)} pallets<br><span class="subtle">${formatNumber(charge.usage.sqft)} sq ft, ${formatWeight(charge.usage.weight)}</span></td>
            <td>${formatCurrency(charge.overageTotal)}</td>
            <td><span class="mini-pill ${lease.status === "active" ? "ok" : "warn"}">${escapeHtml(lease.status)}</span></td>
            <td>
              <div class="table-actions">
                <button class="table-action" type="button" data-edit-lease="${escapeHtml(lease.id)}">Edit</button>
                <button class="table-action danger" type="button" data-delete-lease="${escapeHtml(lease.id)}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("") || emptyRow("No leased space has been assigned", 8);
}

function getLaborSummary(entries = state.laborEntries) {
  return entries.reduce(
    (summary, entry) => {
      summary.hours += entry.hours || 0;
      if (entry.billable) summary.billable += (entry.hours || 0) * (entry.rate || 0);
      if (entry.hours) {
        summary.completed += 1;
        summary.totalMinutes += entry.hours * 60;
      }
      return summary;
    },
    { hours: 0, billable: 0, completed: 0, totalMinutes: 0 }
  );
}

function formatMinutes(value) {
  const minutes = Math.round(value || 0);
  if (minutes >= 60) return `${formatNumber(minutes / 60)} hr`;
  return `${formatNumber(minutes)} min`;
}

function renderUsersAndLabor() {
  const userFilter = $("#laborFilterUser")?.value || "";
  const taskFilter = $("#laborFilterTask")?.value || "";
  const laborRows = state.laborEntries
    .map(normalizeLaborEntry)
    .filter((entry) => !userFilter || entry.userId === userFilter)
    .filter((entry) => !taskFilter || entry.taskType === taskFilter)
    .sort((a, b) => String(b.endTime || b.createdAt).localeCompare(String(a.endTime || a.createdAt)));
  const summary = getLaborSummary(state.laborEntries);
  const avgMinutes = summary.completed ? summary.totalMinutes / summary.completed : 0;

  $("#laborActiveUsers").textContent = formatNumber(state.users.filter((user) => user.status === "active").length);
  $("#laborTotalHours").textContent = formatNumber(summary.hours);
  $("#laborBillableTotal").textContent = formatCurrency(summary.billable);
  $("#laborAvgCompletion").textContent = formatMinutes(avgMinutes);
  $("#laborHealthPill").textContent = summary.hours ? `${formatNumber(summary.hours)} hours tracked` : "Ready";

  $("#userTable").innerHTML =
    state.users
      .map((user) => {
        const assignmentCount = countUserAssignments(user.id);
        return `
          <tr>
            <td><strong>${escapeHtml(user.name)}</strong><br><span class="subtle">${escapeHtml(user.authUserId || "Manual staff")}</span></td>
            <td><span class="mini-pill">${escapeHtml(user.role)}</span></td>
            <td><span class="mini-pill ${user.status === "active" ? "ok" : "warn"}">${escapeHtml(user.status)}</span></td>
            <td>${escapeHtml(user.warehouseIds.map((id) => getWarehouse(id)?.code || id).join(", ") || "-")}</td>
            <td>${formatNumber(assignmentCount)}</td>
            <td>
              <div class="table-actions">
                <button class="table-action" type="button" data-edit-user="${escapeHtml(user.id)}">Edit</button>
                <button class="table-action danger" type="button" data-delete-user="${escapeHtml(user.id)}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("") || emptyRow("No staff users yet", 6);

  $("#laborTable").innerHTML =
    laborRows
      .map((entry) => `
        <tr>
          <td><strong>${escapeHtml(formatUser(entry.userId))}</strong></td>
          <td>${escapeHtml(LABOR_TASK_TYPES[entry.taskType] || entry.taskType)}</td>
          <td>${escapeHtml(getOrderReference(entry.orderType, entry.orderId))}</td>
          <td>${formatNumber(entry.hours)}</td>
          <td>${entry.billable ? formatCurrency((entry.hours || 0) * (entry.rate || 0)) : "-"}</td>
          <td>${escapeHtml(entry.endTime || entry.createdAt || "-")}</td>
        </tr>
      `)
      .join("") || emptyRow("No labor entries match this view", 6);
}

function countUserAssignments(userId) {
  return [
    ...state.receipts,
    ...state.shipments,
    ...state.pickRequests,
    ...state.kitOrders,
  ].filter((record) => record.primaryUserId === userId || record.assignedUserIds?.includes(userId)).length +
    state.documentStages.filter((stage) => stage.assignedUserId === userId).length;
}

function documentWaitDays(stage) {
  const created = Date.parse(stage.createdAt);
  const updated = Date.parse(stage.updatedAt || todayISO());
  if (!Number.isFinite(created)) return 0;
  const end = ["approved", "released"].includes(stage.status) && Number.isFinite(updated) ? updated : Date.now();
  return Math.max(0, Math.round((end - created) / 86_400_000));
}

function renderDocuments() {
  const statusFilter = $("#documentFilterStatus")?.value || "";
  const warehouseFilter = $("#documentFilterWarehouse")?.value || getActiveWarehouseId();
  const stages = state.documentStages
    .map(normalizeDocumentStage)
    .filter((stage) => !statusFilter || stage.status === statusFilter)
    .filter((stage) => !warehouseFilter || stage.warehouseId === warehouseFilter)
    .sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
  const waiting = state.documentStages.filter((stage) => ["waiting", "missing_docs"].includes(stage.status));
  const missing = state.documentStages.filter((stage) => stage.status === "missing_docs");
  const inReview = state.documentStages.filter((stage) => stage.status === "in_review");
  const avgWait = state.documentStages.length
    ? state.documentStages.reduce((sum, stage) => sum + documentWaitDays(stage), 0) / state.documentStages.length
    : 0;

  $("#docWaitingLoads").textContent = formatNumber(waiting.length);
  $("#docMissingLoads").textContent = formatNumber(missing.length);
  $("#docInReviewLoads").textContent = formatNumber(inReview.length);
  $("#docAvgWait").textContent = `${formatNumber(avgWait)} days`;
  $("#documentsHealthPill").textContent = missing.length ? "Docs missing" : waiting.length ? "Waiting docs" : "Docs clear";

  $("#documentStageTable").innerHTML =
    stages
      .map((stage) => `
        <tr>
          <td><strong>${escapeHtml(stage.reference || stage.id)}</strong><br><span class="subtle">${escapeHtml(ORDER_TYPES[stage.orderType] || stage.orderType)}</span></td>
          <td>${escapeHtml(getWarehouse(stage.warehouseId)?.code || "-")}</td>
          <td>${escapeHtml(getCustomer(stage.customerId)?.name || "-")}</td>
          <td><span class="mini-pill ${getDocumentStatusClass(stage.status)}">${escapeHtml(getDocumentStatusLabel(stage.status))}</span></td>
          <td>${escapeHtml(stage.requiredDocs.join(", ") || "-")}</td>
          <td>${escapeHtml(stage.receivedDocs.join(", ") || "-")}</td>
          <td>${escapeHtml(formatUser(stage.assignedUserId))}</td>
          <td>${formatNumber(documentWaitDays(stage))} days</td>
          <td>
            <div class="table-actions">
              <button class="table-action" type="button" data-document-status="${escapeHtml(stage.id)}" data-next-status="received">Received</button>
              <button class="table-action" type="button" data-document-status="${escapeHtml(stage.id)}" data-next-status="approved">Approve</button>
              <button class="table-action" type="button" data-document-status="${escapeHtml(stage.id)}" data-next-status="released">Release</button>
            </div>
          </td>
        </tr>
      `)
      .join("") || emptyRow("No staged document loads match this view", 9);
}

function renderPicks() {
  const activeWarehouse = getActiveWarehouseId();
  const statusFilter = $("#pickQueueStatus")?.value || "";
  const customerFilter = $("#pickQueueCustomer")?.value || "";
  const warehouseFilter = $("#pickQueueWarehouse")?.value || activeWarehouse;
  const portalCustomer = $("#pickPortalCustomer")?.value || "";
  const portalWarehouse = $("#pickPortalWarehouse")?.value || "";
  const requests = state.pickRequests.map(normalizePickRequest);
  const visibleRequests = requests
    .filter((request) => !warehouseFilter || request.warehouseId === warehouseFilter)
    .filter((request) => !customerFilter || request.customerId === customerFilter)
    .filter((request) => !statusFilter || request.status === statusFilter)
    .sort((a, b) => {
      const priorityOrder = { rush: 0, standard: 1, hold: 2 };
      return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1) || String(a.requestedShipDate).localeCompare(String(b.requestedShipDate));
    });
  const openRequests = requests.filter((request) => !["closed", "canceled"].includes(request.status));
  const reservedUnits = (state.pickReservations || [])
    .filter((reservation) => reservation.status === "reserved")
    .filter((reservation) => !activeWarehouse || reservation.warehouseId === activeWarehouse)
    .reduce((sum, reservation) => sum + (reservation.quantity || 0), 0);
  const readyToPack = requests.filter((request) => request.status === "picked").length;
  const exceptions = requests.filter((request) => request.status === "exception").length;

  $("#pickOpenRequests").textContent = formatNumber(openRequests.length);
  $("#pickReservedUnits").textContent = formatNumber(reservedUnits);
  $("#pickReadyToPack").textContent = formatNumber(readyToPack);
  $("#pickExceptions").textContent = formatNumber(exceptions);
  $("#pickHealthPill").textContent = exceptions ? "Exceptions Open" : openRequests.length ? "Work In Motion" : "Queue Clear";

  $("#pickQueueTable").innerHTML =
    visibleRequests
      .map((request) => {
        const customer = getCustomer(request.customerId);
        const totals = getPickTotals(request);
        const billing = getPickBilling(request);
        return `
          <tr>
            <td><button class="table-action" type="button" data-view-pick="${escapeHtml(request.id)}">${escapeHtml(request.reference)}</button></td>
            <td>${escapeHtml(customer?.name || "-")}</td>
            <td>${escapeHtml(getWarehouse(request.warehouseId)?.code || "-")}</td>
            <td><span class="mini-pill ${request.priority === "rush" ? "over" : request.priority === "hold" ? "warn" : "ok"}">${escapeHtml(request.priority)}</span></td>
            <td><span class="mini-pill ${getPickStatusClass(request.status)}">${escapeHtml(getPickStatusLabel(request.status))}</span></td>
            <td>${escapeHtml(request.assignedPicker || getAssignedUsers(request))}</td>
            <td>${formatNumber(totals.lines)} lines<br><span class="subtle">${formatNumber(totals.quantity)} units</span></td>
            <td>${formatNumber(totals.reserved)} / ${formatNumber(totals.quantity)}</td>
            <td>${formatCurrency(billing.total)}</td>
            <td>
              <div class="table-actions">
                <button class="table-action" type="button" data-approve-pick="${escapeHtml(request.id)}">Reserve</button>
                <button class="table-action" type="button" data-start-pick="${escapeHtml(request.id)}">Pick</button>
                <button class="table-action" type="button" data-exception-pick="${escapeHtml(request.id)}">Exception</button>
                <button class="table-action" type="button" data-pack-pick="${escapeHtml(request.id)}">Pack</button>
                <button class="table-action" type="button" data-ship-pick="${escapeHtml(request.id)}">Ship</button>
                <button class="table-action" type="button" data-close-pick="${escapeHtml(request.id)}">Close</button>
                <button class="table-action danger" type="button" data-cancel-pick="${escapeHtml(request.id)}">Cancel</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("") || emptyRow("No pick requests match this queue", 10);

  renderCustomerPortalPicks(portalCustomer, portalWarehouse || activeWarehouse);
  renderPickTicketPreview();
}

function renderCustomerPortalPicks(customerId, warehouseId) {
  const customer = customerId ? getCustomer(customerId) : state.customers[0];
  const selectedCustomerId = customer?.id || "";
  if ($("#pickPortalCustomer") && !$("#pickPortalCustomer").value && selectedCustomerId) $("#pickPortalCustomer").value = selectedCustomerId;
  const requests = state.pickRequests
    .map(normalizePickRequest)
    .filter((request) => !selectedCustomerId || request.customerId === selectedCustomerId)
    .filter((request) => !warehouseId || request.warehouseId === warehouseId)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const customerSkuCount = selectedCustomerId
    ? (customer?.skuLinks || []).length
    : state.skus.length;
  const reservedUnits = (state.pickReservations || [])
    .filter((reservation) => reservation.status === "reserved")
    .filter((reservation) => !selectedCustomerId || reservation.customerId === selectedCustomerId)
    .filter((reservation) => !warehouseId || reservation.warehouseId === warehouseId)
    .reduce((sum, reservation) => sum + (reservation.quantity || 0), 0);
  const documentCount = requests.reduce((sum, request) => sum + (request.attachments?.length || 0), 0);
  $("#portalSkuCount").textContent = formatNumber(customerSkuCount);
  $("#portalOpenPicks").textContent = formatNumber(requests.filter((request) => !["closed", "canceled"].includes(request.status)).length);
  $("#portalReservedUnits").textContent = formatNumber(reservedUnits);
  $("#portalDocumentCount").textContent = formatNumber(documentCount);
  $("#pickPortalTable").innerHTML =
    requests
      .map((request) => {
        const totals = getPickTotals(request);
        const billing = getPickBilling(request);
        const status = state.pickSettings?.showExceptionsToCustomers === false && request.status === "exception" ? "review" : request.status;
        return `
          <tr>
            <td><strong>${escapeHtml(request.reference)}</strong></td>
            <td>${escapeHtml(getWarehouse(request.warehouseId)?.code || "-")}</td>
            <td><span class="mini-pill ${getPickStatusClass(status)}">${escapeHtml(getPickStatusLabel(status))}</span></td>
            <td>${escapeHtml(request.requestedShipDate || "-")}</td>
            <td>${formatNumber(totals.lines)} lines / ${formatNumber(totals.quantity)} units</td>
            <td>${formatCurrency(billing.total)}</td>
          </tr>
        `;
      })
      .join("") || emptyRow("No customer pick requests yet", 6);
}

function renderPickTicketPreview(requestId = selectedPickRequestId) {
  const preview = $("#pickTicketPreview");
  const request = requestId ? getPickRequest(requestId) : state.pickRequests[0];
  selectedPickRequestId = request?.id || null;
  if (!request) {
    preview.innerHTML = `<p class="empty-invoice">Select a pick request to see the ticket.</p>`;
    return;
  }
  const normalized = normalizePickRequest(request);
  const customer = getCustomer(normalized.customerId);
  const totals = getPickTotals(normalized);
  preview.innerHTML = `
    <div class="invoice-header">
      <div>
        <p class="eyebrow">Pick Ticket</p>
        <h3>${escapeHtml(normalized.reference)}</h3>
      </div>
      <div>
        <span>Status</span>
        <strong>${escapeHtml(getPickStatusLabel(normalized.status))}</strong>
      </div>
    </div>
    <div class="invoice-grid">
      <div>
        <span>Customer</span>
        <strong>${escapeHtml(customer?.name || "-")}</strong>
      </div>
      <div>
        <span>Warehouse</span>
        <strong>${escapeHtml(formatWarehouse(normalized.warehouseId))}</strong>
      </div>
      <div>
        <span>Picker</span>
        <strong>${escapeHtml(normalized.assignedPicker || getAssignedUsers(normalized))}</strong>
      </div>
      <div>
        <span>Ship Date</span>
        <strong>${escapeHtml(normalized.requestedShipDate || "-")}</strong>
      </div>
      <div>
        <span>Destination</span>
        <strong>${escapeHtml(normalized.destination || "-")}</strong>
      </div>
      <div>
        <span>Units</span>
        <strong>${formatNumber(totals.quantity)}</strong>
      </div>
      <div>
        <span>Reserved</span>
        <strong>${formatNumber(totals.reserved)}</strong>
      </div>
      <div>
        <span>Weight</span>
        <strong>${formatWeight(totals.weight)}</strong>
      </div>
    </div>
    <table class="invoice-table">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Name</th>
          <th>Preferred Bay</th>
          <th>Qty</th>
          <th>Reserved</th>
          <th>Picked</th>
          <th>Short</th>
        </tr>
      </thead>
      <tbody>
        ${normalized.lines
          .map(
            (line) => `
              <tr>
                <td><strong>${escapeHtml(line.sku)}</strong></td>
                <td>${escapeHtml(getSku(line.sku)?.name || "-")}</td>
                <td>${escapeHtml(line.preferredBay || "-")}</td>
                <td>${formatNumber(line.quantity)}</td>
                <td>${formatNumber(line.reservedQuantity)}</td>
                <td>${formatNumber(line.pickedQuantity)}</td>
                <td>${formatNumber(line.shortQuantity)}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
    ${
      normalized.exceptions.length
        ? `<div class="exception-list">${normalized.exceptions
            .map((exception) => `<div class="route-event"><strong>${escapeHtml(exception.type)}</strong><span>${escapeHtml(exception.note || "-")} · ${escapeHtml(exception.date)}</span></div>`)
            .join("")}</div>`
        : ""
    }
  `;
}

function renderKitTemplateOptions() {
  const customerId = $("#kitOrderCustomer")?.value;
  const warehouseId = $("#kitOrderWarehouse")?.value || getActiveWarehouseId();
  const templates = state.kitTemplates
    .filter((template) => !customerId || template.customerId === customerId)
    .filter((template) => !warehouseId || template.warehouseId === warehouseId);
  if ($("#kitOrderTemplate")) {
    setOptions($("#kitOrderTemplate"), templates, "id", (template) => template.name, "Custom kit");
  }
}

function renderKitting() {
  const activeWarehouse = getActiveWarehouseId();
  renderKitTemplateOptions();
  $("#kitTemplateTable").innerHTML =
    state.kitTemplates
      .filter((template) => warehouseMatches(template, activeWarehouse))
      .map((template) => {
        const customer = getCustomer(template.customerId);
        return `
          <tr>
            <td>${escapeHtml(customer?.name || "-")}</td>
            <td>${escapeHtml(getWarehouse(template.warehouseId)?.code || "-")}</td>
            <td><strong>${escapeHtml(template.name)}</strong></td>
            <td>${escapeHtml(kitLinesText(template.lines)).replaceAll("\n", "<br>")}</td>
            <td>
              <div class="table-actions">
                <button class="table-action" type="button" data-edit-kit-template="${escapeHtml(template.id)}">Edit</button>
                <button class="table-action danger" type="button" data-delete-kit-template="${escapeHtml(template.id)}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("") || emptyRow("No standard kits yet", 5);

  $("#kitOrderTable").innerHTML =
    state.kitOrders
      .filter((order) => warehouseMatches(order, activeWarehouse))
      .map((order) => {
        const customer = getCustomer(order.customerId);
        return `
          <tr>
            <td><strong>${escapeHtml(order.reference)}</strong></td>
            <td>${escapeHtml(customer?.name || "-")}</td>
            <td>${escapeHtml(getWarehouse(order.warehouseId)?.code || "-")}</td>
            <td><span class="mini-pill ${kitStatusClass(order.status)}">${escapeHtml(order.status)}</span></td>
            <td>${formatNumber(order.reservations?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0)}</td>
            <td>
              <div class="table-actions">
                <button class="table-action" type="button" data-approve-kit="${escapeHtml(order.id)}">Approve</button>
                <button class="table-action" type="button" data-complete-kit="${escapeHtml(order.id)}">Complete</button>
                <button class="table-action danger" type="button" data-cancel-kit="${escapeHtml(order.id)}">Cancel</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("") || emptyRow("No kit orders yet", 6);
}

function kitStatusClass(status) {
  if (status === "completed") return "ok";
  if (status === "canceled" || status === "rejected") return "over";
  return "warn";
}

function getFinancialRows() {
  const warehouseFilter = $("#adminWarehouseFilter")?.value || getActiveWarehouseId();
  const customerFilter = $("#adminCustomerFilter")?.value || "";
  const from = $("#adminFrom")?.value || "";
  const to = $("#adminTo")?.value || "";
  const rows = [];

  state.customers
    .filter((customer) => !customerFilter || customer.id === customerFilter)
    .forEach((customer) => {
      state.warehouses
        .filter((warehouse) => !warehouseFilter || warehouse.id === warehouseFilter)
        .filter((warehouse) => !customer.warehouseIds?.length || customer.warehouseIds.includes(warehouse.id))
        .forEach((warehouse) => {
          const shipments = state.shipments
            .map(normalizeShipment)
            .filter((shipment) => shipment.customerId === customer.id && shipment.warehouseId === warehouse.id)
            .filter((shipment) => !from || shipment.date >= from)
            .filter((shipment) => !to || shipment.date <= to);
          const shipmentRevenue = shipments.reduce((sum, shipment) => sum + (shipment.invoiceTotal || 0), 0);
          const carrierCosts = shipments.reduce((sum, shipment) => sum + estimateCarrierCost(shipment), 0);
          const accessorials = shipments.reduce((sum, shipment) => sum + getAccessorialTotal(shipment.accessorials), 0);
          const completedKits = state.kitOrders.filter(
            (order) =>
              order.customerId === customer.id &&
              order.warehouseId === warehouse.id &&
              order.status === "completed" &&
              (!from || (order.completedAt || order.createdAt) >= from) &&
              (!to || (order.completedAt || order.createdAt) <= to)
          );
          const kitCharges = completedKits.length * (customer.kitFee || warehouse.handlingRate || 0);
          const billablePicks = state.pickRequests
            .map(normalizePickRequest)
            .filter((request) => request.customerId === customer.id && request.warehouseId === warehouse.id)
            .filter((request) => ["packed", "shipped", "closed"].includes(request.status))
            .filter((request) => !from || (request.closedAt || request.shippedAt || request.packedAt || request.createdAt) >= from)
            .filter((request) => !to || (request.closedAt || request.shippedAt || request.packedAt || request.createdAt) <= to);
          const pickCharges = billablePicks.reduce((sum, request) => sum + getPickBilling(request).total, 0);
          const laborRows = state.laborEntries
            .map(normalizeLaborEntry)
            .filter((entry) => entry.customerId === customer.id && entry.warehouseId === warehouse.id)
            .filter((entry) => !from || (entry.createdAt || entry.endTime || "") >= from)
            .filter((entry) => !to || (entry.createdAt || entry.endTime || "") <= to);
          const laborCharges = laborRows.reduce((sum, entry) => sum + (entry.billable ? (entry.hours || 0) * (entry.rate || 0) : 0), 0);
          const leases = state.customerLeases.filter(
            (lease) => lease.customerId === customer.id && lease.warehouseId === warehouse.id && lease.status === "active"
          );
          const leaseCharges = leases.reduce((sum, lease) => sum + calculateLeaseCharge(lease).total, 0);
          const openInvoices = shipments.length + leases.length + completedKits.length + billablePicks.length + laborRows.filter((entry) => entry.billable).length;
          const openAr = shipmentRevenue + kitCharges + pickCharges + leaseCharges + laborCharges;
          const revenue = shipmentRevenue + kitCharges + pickCharges + leaseCharges + laborCharges;
          if (revenue || carrierCosts || customerFilter || warehouseFilter) {
            rows.push({
              customer,
              warehouseId: warehouse.id,
              shipments: shipments.length,
              shipmentRevenue,
              carrierCosts,
              accessorials,
              kitCharges,
              pickCharges,
              laborCharges,
              leaseCharges,
              openInvoices,
              openAr,
              margin: revenue - carrierCosts,
            });
          }
        });
    });
  return rows.sort((a, b) => `${a.customer.name}${a.warehouseId}`.localeCompare(`${b.customer.name}${b.warehouseId}`));
}

function getKpiRows() {
  const warehouseFilter = $("#adminWarehouseFilter")?.value || getActiveWarehouseId();
  const customerFilter = $("#adminCustomerFilter")?.value || "";
  const from = $("#adminFrom")?.value || "";
  const to = $("#adminTo")?.value || "";
  const rows = [];
  const customers = [...state.customers, { id: "", name: "Unassigned / Internal", warehouseIds: [] }];
  customers
    .filter((customer) => !customerFilter || customer.id === customerFilter)
    .forEach((customer) => {
      state.warehouses
        .filter((warehouse) => !warehouseFilter || warehouse.id === warehouseFilter)
        .forEach((warehouse) => {
          const filterByDate = (record) => (!from || (record.date || record.createdAt || record.endTime || "") >= from) && (!to || (record.date || record.createdAt || record.endTime || "") <= to);
          const match = (record) => {
            const customerMatches = customer.id ? record.customerId === customer.id : !record.customerId;
            return record.warehouseId === warehouse.id && customerMatches && filterByDate(record);
          };
          const receipts = state.receipts.filter(match);
          const shipments = state.shipments.filter(match);
          const picks = state.pickRequests.filter(match);
          const docs = state.documentStages.filter(match);
          const laborRows = state.laborEntries.filter(match);
          const labor = getLaborSummary(laborRows);
          const finance = getFinancialRows().find((row) => row.customer.id === customer.id && row.warehouseId === warehouse.id);
          if (receipts.length || shipments.length || picks.length || docs.length || labor.hours || finance) {
            rows.push({
              customer,
              warehouse,
              receipts: receipts.length,
              shipments: shipments.length,
              picks: picks.length,
              stagedDocs: docs.filter((stage) => !["released", "approved"].includes(stage.status)).length,
              laborHours: labor.hours,
              avgMinutes: labor.completed ? labor.totalMinutes / labor.completed : 0,
              exceptions: picks.filter((pick) => pick.status === "exception").length + docs.filter((doc) => ["missing_docs", "rejected"].includes(doc.status)).length,
              margin: finance?.margin || 0,
            });
          }
        });
    });
  return rows;
}

function renderAdminFinance() {
  const isAdmin = state.currentUserRole === "admin";
  $("#adminLockedPanel").style.display = isAdmin ? "none" : "block";
  $("#adminFinanceContent").style.display = isAdmin ? "block" : "none";
  $("#adminAccessPill").textContent = isAdmin ? "Admin access" : "Locked";
  if (!isAdmin) return;

  const rows = getFinancialRows();
  const totals = rows.reduce(
    (summary, row) => {
      summary.revenue += row.shipmentRevenue + row.kitCharges + row.pickCharges + row.leaseCharges;
      summary.carrierCosts += row.carrierCosts;
      summary.kitCharges += row.kitCharges;
      summary.pickCharges += row.pickCharges;
      summary.laborCharges += row.laborCharges;
      summary.leaseCharges += row.leaseCharges;
      summary.accessorials += row.accessorials;
      summary.openInvoices += row.openInvoices;
      summary.margin += row.margin;
      return summary;
    },
    { revenue: 0, carrierCosts: 0, kitCharges: 0, pickCharges: 0, laborCharges: 0, leaseCharges: 0, accessorials: 0, openInvoices: 0, margin: 0 }
  );
  $("#adminRevenue").textContent = formatCurrency(totals.revenue);
  $("#adminCarrierCosts").textContent = formatCurrency(totals.carrierCosts);
  $("#adminKitCharges").textContent = formatCurrency(totals.kitCharges);
  $("#adminPickCharges").textContent = formatCurrency(totals.pickCharges);
  $("#adminLaborCharges").textContent = formatCurrency(totals.laborCharges);
  $("#adminLeaseCharges").textContent = formatCurrency(totals.leaseCharges);
  $("#adminAccessorials").textContent = formatCurrency(totals.accessorials);
  $("#adminOpenInvoices").textContent = formatNumber(totals.openInvoices);
  $("#adminMargin").textContent = formatCurrency(totals.margin);
  $("#adminFinanceTable").innerHTML =
    rows
      .map(
        (row) => `
          <tr>
            <td><strong>${escapeHtml(row.customer.name)}</strong></td>
            <td>${escapeHtml(getWarehouse(row.warehouseId)?.code || "-")}</td>
            <td>${formatNumber(row.shipments)}</td>
            <td>${formatCurrency(row.shipmentRevenue)}</td>
            <td>${formatCurrency(row.carrierCosts)}</td>
            <td>${formatCurrency(row.accessorials)}</td>
            <td>${formatCurrency(row.kitCharges)}</td>
            <td>${formatCurrency(row.pickCharges)}</td>
            <td>${formatCurrency(row.laborCharges)}</td>
            <td>${formatCurrency(row.leaseCharges)}</td>
            <td>${formatCurrency(row.openAr)}</td>
            <td>${formatCurrency(row.margin)}</td>
          </tr>
        `
      )
      .join("") || emptyRow("No customer billing yet", 12);
  renderAdminTabs();
  renderAdminKpis();
  renderAdminLabor();
  renderAdminDocuments();
  renderAdminAudit();
}

function renderAdminTabs() {
  $$(".admin-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.adminTab === activeAdminTab);
  });
  $$(".admin-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.adminPanel === activeAdminTab);
  });
}

function renderAdminKpis() {
  const rows = getKpiRows();
  const totals = rows.reduce(
    (summary, row) => {
      summary.inbound += row.receipts;
      summary.outbound += row.shipments;
      summary.picks += row.picks;
      summary.docs += row.stagedDocs;
      summary.laborHours += row.laborHours;
      summary.exceptionEvents += row.exceptions;
      summary.workEvents += row.receipts + row.shipments + row.picks + row.stagedDocs;
      summary.minutes += row.avgMinutes && row.laborHours ? row.avgMinutes : 0;
      summary.minuteRows += row.avgMinutes ? 1 : 0;
      return summary;
    },
    { inbound: 0, outbound: 0, picks: 0, docs: 0, laborHours: 0, exceptionEvents: 0, workEvents: 0, minutes: 0, minuteRows: 0 }
  );
  $("#kpiInboundLoads").textContent = formatNumber(totals.inbound);
  $("#kpiOutboundLoads").textContent = formatNumber(totals.outbound);
  $("#kpiOpenPicks").textContent = formatNumber(state.pickRequests.filter((request) => !["closed", "canceled"].includes(request.status)).length);
  $("#kpiStagedLoads").textContent = formatNumber(totals.docs);
  $("#kpiLaborHours").textContent = formatNumber(totals.laborHours);
  $("#kpiAvgCompletion").textContent = formatMinutes(totals.minuteRows ? totals.minutes / totals.minuteRows : 0);
  $("#kpiShipmentsPerHour").textContent = formatNumber(totals.laborHours ? totals.outbound / totals.laborHours : 0);
  $("#kpiExceptionRate").textContent = `${formatNumber(totals.workEvents ? (totals.exceptionEvents / totals.workEvents) * 100 : 0)}%`;
  $("#adminKpiTable").innerHTML =
    rows
      .map((row) => `
        <tr>
          <td><strong>${escapeHtml(row.customer.name || "Unassigned")}</strong></td>
          <td>${escapeHtml(row.warehouse.code)}</td>
          <td>${formatNumber(row.receipts)}</td>
          <td>${formatNumber(row.shipments)}</td>
          <td>${formatNumber(row.picks)}</td>
          <td>${formatNumber(row.stagedDocs)}</td>
          <td>${formatNumber(row.laborHours)}</td>
          <td>${formatMinutes(row.avgMinutes)}</td>
          <td>${formatCurrency(row.margin)}</td>
        </tr>
      `)
      .join("") || emptyRow("No KPI activity for these filters", 9);
}

function renderAdminLabor() {
  $("#adminLaborTable").innerHTML =
    state.laborEntries
      .map(normalizeLaborEntry)
      .sort((a, b) => String(b.endTime || b.createdAt).localeCompare(String(a.endTime || a.createdAt)))
      .map((entry) => {
        const user = getUser(entry.userId);
        const cost = entry.billable ? (entry.hours || 0) * (entry.rate || 0) : 0;
        return `
          <tr>
            <td><strong>${escapeHtml(user?.name || "-")}</strong></td>
            <td>${escapeHtml(user?.role || "-")}</td>
            <td>${escapeHtml(LABOR_TASK_TYPES[entry.taskType] || entry.taskType)}</td>
            <td>${escapeHtml(getOrderReference(entry.orderType, entry.orderId))}</td>
            <td>${formatNumber(entry.hours)}</td>
            <td>${entry.billable ? "Yes" : "No"}</td>
            <td>${formatCurrency(cost)}</td>
            <td>${escapeHtml(entry.notes || "-")}</td>
          </tr>
        `;
      })
      .join("") || emptyRow("No labor detail yet", 8);
}

function renderAdminDocuments() {
  $("#adminDocumentsTable").innerHTML =
    state.documentStages
      .map(normalizeDocumentStage)
      .sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)))
      .map((stage) => `
        <tr>
          <td><strong>${escapeHtml(stage.reference || stage.id)}</strong></td>
          <td>${escapeHtml(getCustomer(stage.customerId)?.name || "-")}</td>
          <td>${escapeHtml(getWarehouse(stage.warehouseId)?.code || "-")}</td>
          <td><span class="mini-pill ${getDocumentStatusClass(stage.status)}">${escapeHtml(getDocumentStatusLabel(stage.status))}</span></td>
          <td>${escapeHtml(stage.requiredDocs.join(", ") || "-")}</td>
          <td>${escapeHtml(stage.receivedDocs.join(", ") || "-")}</td>
          <td>${escapeHtml(formatUser(stage.assignedUserId))}</td>
          <td>${formatNumber(documentWaitDays(stage))} days</td>
        </tr>
      `)
      .join("") || emptyRow("No staged documents yet", 8);
}

function renderAdminAudit() {
  $("#adminAuditTable").innerHTML =
    [...state.auditLog]
      .reverse()
      .slice(0, 100)
      .map((entry) => `
        <tr>
          <td>${escapeHtml(entry.date || "-")}</td>
          <td>${escapeHtml(entry.role || "-")}</td>
          <td><strong>${escapeHtml(entry.action || "-")}</strong></td>
          <td>${escapeHtml(entry.detail || "-")}</td>
        </tr>
      `)
      .join("") || emptyRow("No audit events yet", 4);
}

function getFilteredTmsLoads() {
  const customer = $("#tmsLoadFilterCustomer")?.value || $("#tmsReportCustomer")?.value || "";
  const status = $("#tmsLoadFilterStatus")?.value || $("#tmsReportStatus")?.value || "";
  const mode = $("#tmsReportMode")?.value || "";
  return state.tmsLoads
    .map(normalizeTmsLoad)
    .filter((load) => !customer || load.customerId === customer)
    .filter((load) => !status || load.status === status)
    .filter((load) => !mode || load.mode === mode)
    .sort((a, b) => `${b.shipDate}${b.reference}`.localeCompare(`${a.shipDate}${a.reference}`));
}

function renderTms() {
  renderTmsDashboard();
  renderTmsOrders();
  renderTmsLoads();
  renderTmsCarriers();
  renderTmsCarrierRates();
  renderTmsClientRates();
  renderTmsDocuments();
  renderTmsReports();
}

function renderTmsDashboard() {
  const totals = getTmsTotals(state.tmsLoads);
  $("#tmsOpenLoads").textContent = formatNumber(totals.open);
  $("#tmsQuotedLoads").textContent = formatNumber(totals.quoted);
  $("#tmsTenderedLoads").textContent = formatNumber(totals.tendered);
  $("#tmsTransitLoads").textContent = formatNumber(totals.inTransit);
  $("#tmsRevenue").textContent = formatCurrency(totals.revenue);
  $("#tmsMargin").textContent = formatCurrency(totals.margin);
  $("#tmsHealthPill").textContent = totals.loads ? `${formatNumber(totals.loads)} transportation loads` : "No loads";

  const lanes = new Map();
  state.tmsLoads.map(normalizeTmsLoad).forEach((load) => {
    const lane = `${load.origin || "-"} -> ${load.destination || "-"}`;
    const pricing = calculateTmsLoadPricing(load);
    const row = lanes.get(lane) || { lane, loads: 0, revenue: 0, margin: 0 };
    row.loads += 1;
    row.revenue += pricing.clientCharge;
    row.margin += pricing.margin;
    lanes.set(lane, row);
  });
  $("#tmsTopLaneTable").innerHTML =
    [...lanes.values()]
      .sort((a, b) => b.loads - a.loads)
      .slice(0, 6)
      .map((row) => `<tr><td>${escapeHtml(row.lane)}</td><td>${formatNumber(row.loads)}</td><td>${formatCurrency(row.revenue)}</td><td>${formatCurrency(row.margin)}</td></tr>`)
      .join("") || emptyRow("No TMS lanes yet", 4);

  $("#tmsActiveLoadTable").innerHTML =
    state.tmsLoads
      .map(normalizeTmsLoad)
      .filter((load) => !["closed", "canceled"].includes(load.status))
      .slice(0, 8)
      .map((load) => {
        const pricing = calculateTmsLoadPricing(load);
        return `<tr><td><strong>${escapeHtml(load.reference)}</strong></td><td>${escapeHtml(getCustomer(load.customerId)?.name || "-")}</td><td>${escapeHtml(TMS_LOAD_STATUSES[load.status] || load.status)}</td><td>${escapeHtml(TMS_MODES[load.mode] || load.mode)}</td><td>${formatCurrency(pricing.clientCharge)}</td></tr>`;
      })
      .join("") || emptyRow("No active transportation loads", 5);
}

function renderTmsOrders() {
  $("#tmsOrderTable").innerHTML =
    state.tmsLoads
      .map(normalizeTmsLoad)
      .map((load) => {
        const pricing = calculateTmsLoadPricing(load);
        return `
          <tr>
            <td><strong>${escapeHtml(load.reference)}</strong></td>
            <td>${load.orderType === "external" ? "External" : "WMS-linked"}</td>
            <td>${escapeHtml(getCustomer(load.customerId)?.name || "-")}</td>
            <td>${escapeHtml(formatWarehouse(load.warehouseId))}</td>
            <td><span class="status-pill ${load.status === "exception" ? "over" : "ok"}">${escapeHtml(TMS_LOAD_STATUSES[load.status] || load.status)}</span></td>
            <td>${escapeHtml(load.origin || "-")} -> ${escapeHtml(load.destination || "-")}</td>
            <td>${formatCurrency(pricing.clientCharge)}</td>
            <td><div class="table-actions"><button class="table-action" type="button" data-edit-tms-load="${escapeHtml(load.id)}">Open</button><button class="table-action" type="button" data-bol-load="${escapeHtml(load.id)}">BOL</button></div></td>
          </tr>
        `;
      })
      .join("") || emptyRow("No transportation orders yet", 8);
}

function renderTmsLoads() {
  const loads = getFilteredTmsLoads();
  $("#tmsLoadTable").innerHTML =
    loads
      .map((load) => {
        const pricing = calculateTmsLoadPricing(load);
        return `
          <tr>
            <td><strong>${escapeHtml(load.reference)}</strong><div class="subtle">${load.orderType === "external" ? "External" : "WMS-linked"}</div></td>
            <td>${escapeHtml(getCustomer(load.customerId)?.name || "-")}</td>
            <td>${escapeHtml(TMS_MODES[load.mode] || load.mode)}</td>
            <td><span class="status-pill ${load.status === "exception" ? "over" : "ok"}">${escapeHtml(TMS_LOAD_STATUSES[load.status] || load.status)}</span></td>
            <td>${escapeHtml(getTmsCarrier(load.carrierId)?.name || "-")}</td>
            <td>${escapeHtml(load.origin || "-")} -> ${escapeHtml(load.destination || "-")}</td>
            <td>${escapeHtml(load.freightClass)}</td>
            <td>${formatWeight(load.weight)}</td>
            <td>${formatCurrency(pricing.carrierCost)}</td>
            <td>${formatCurrency(pricing.clientCharge)}</td>
            <td>${formatCurrency(pricing.margin)}</td>
            <td><div class="table-actions"><button class="table-action" type="button" data-edit-tms-load="${escapeHtml(load.id)}">Edit</button><button class="table-action" type="button" data-bol-load="${escapeHtml(load.id)}">BOL</button><button class="table-action danger" type="button" data-delete-tms-load="${escapeHtml(load.id)}">Delete</button></div></td>
          </tr>
        `;
      })
      .join("") || emptyRow("No TMS loads match", 12);
}

function renderTmsCarriers() {
  $("#tmsCarrierTable").innerHTML =
    state.tmsCarriers
      .map(normalizeTmsCarrier)
      .map((carrier) => `
        <tr>
          <td><strong>${escapeHtml(carrier.name)}</strong><div class="subtle">${escapeHtml(carrier.notes || "")}</div></td>
          <td>${escapeHtml(carrier.scac || "-")}</td>
          <td>${carrier.modes.map((mode) => TMS_MODES[mode]).join(", ")}</td>
          <td>${escapeHtml(carrier.serviceAreas || "-")}</td>
          <td><span class="status-pill ${carrier.status === "active" ? "ok" : "warn"}">${escapeHtml(carrier.status)}</span></td>
          <td>${escapeHtml(carrier.contact || "-")}<div class="subtle">${escapeHtml(carrier.email || carrier.phone || "")}</div></td>
          <td><div class="table-actions"><button class="table-action" type="button" data-edit-tms-carrier="${escapeHtml(carrier.id)}">Edit</button><button class="table-action danger" type="button" data-delete-tms-carrier="${escapeHtml(carrier.id)}">Delete</button></div></td>
        </tr>
      `)
      .join("") || emptyRow("No TMS carriers yet", 7);
}

function renderTmsCarrierRates() {
  $("#tmsCarrierRateTable").innerHTML =
    state.tmsCarrierRates
      .map(normalizeTmsCarrierRate)
      .map((rate) => `
        <tr>
          <td>${escapeHtml(getTmsCarrier(rate.carrierId)?.name || "-")}</td>
          <td><strong>${escapeHtml(rate.laneName)}</strong><div class="subtle">${escapeHtml(rate.originRegion || "-")} -> ${escapeHtml(rate.destinationRegion || "-")}</div></td>
          <td>${escapeHtml(TMS_MODES[rate.mode] || rate.mode)}</td>
          <td>${escapeHtml(rate.freightClass)}</td>
          <td>${formatNumber(rate.minWeight)}-${rate.maxWeight ? formatNumber(rate.maxWeight) : "up"} lb</td>
          <td>${formatCurrency(rate.minimumCharge)}</td>
          <td>${formatCurrency(rate.linehaul)}</td>
          <td>${formatNumber(rate.fuelPct)}%</td>
          <td><div class="table-actions"><button class="table-action" type="button" data-edit-tms-rate="${escapeHtml(rate.id)}">Edit</button><button class="table-action danger" type="button" data-delete-tms-rate="${escapeHtml(rate.id)}">Delete</button></div></td>
        </tr>
      `)
      .join("") || emptyRow("No carrier rate cards yet", 9);
}

function renderTmsClientRates() {
  $("#tmsClientRateTable").innerHTML =
    state.tmsClientRates
      .map(normalizeTmsClientRate)
      .map((rate) => `
        <tr>
          <td>${escapeHtml(getCustomer(rate.customerId)?.name || "-")}</td>
          <td><strong>${escapeHtml(rate.name)}</strong></td>
          <td>${escapeHtml(TMS_MODES[rate.mode] || rate.mode)}</td>
          <td>${escapeHtml(getTmsCarrierRate(rate.rateId)?.laneName || "-")}</td>
          <td>${formatNumber(rate.percentMarkup)}% + ${formatCurrency(rate.flatMarkup)}</td>
          <td>${formatNumber(rate.fuelMarkupPct)}%</td>
          <td>${formatNumber(rate.accessorialMarkupPct)}%</td>
          <td>${formatCurrency(rate.minimumMargin)}</td>
          <td><div class="table-actions"><button class="table-action" type="button" data-edit-tms-client-rate="${escapeHtml(rate.id)}">Edit</button><button class="table-action danger" type="button" data-delete-tms-client-rate="${escapeHtml(rate.id)}">Delete</button></div></td>
        </tr>
      `)
      .join("") || emptyRow("No client rate profiles yet", 9);
}

function renderTmsDocuments() {
  const loadId = $("#tmsBolLoadSelect")?.value || state.tmsLoads[0]?.id || "";
  if ($("#tmsBolLoadSelect") && loadId) $("#tmsBolLoadSelect").value = loadId;
  const load = state.tmsLoads.map(normalizeTmsLoad).find((item) => item.id === loadId);
  $("#tmsBolPreview").innerHTML = load ? buildBolHtml(load, false) : `<p class="empty-invoice">Select a TMS load to generate a BOL or shipment summary.</p>`;
}

function renderTmsReports() {
  const loads = getFilteredTmsLoads();
  const totals = getTmsTotals(loads);
  $("#tmsReportLoads").textContent = formatNumber(loads.length);
  $("#tmsReportCost").textContent = formatCurrency(totals.cost);
  $("#tmsReportRevenue").textContent = formatCurrency(totals.revenue);
  $("#tmsReportMargin").textContent = formatCurrency(totals.margin);
  $("#tmsReportTable").innerHTML =
    loads
      .map((load) => {
        const pricing = calculateTmsLoadPricing(load);
        return `<tr><td><strong>${escapeHtml(load.reference)}</strong></td><td>${escapeHtml(getCustomer(load.customerId)?.name || "-")}</td><td>${escapeHtml(getTmsCarrier(load.carrierId)?.name || "-")}</td><td>${escapeHtml(load.origin || "-")} -> ${escapeHtml(load.destination || "-")}</td><td>${escapeHtml(TMS_MODES[load.mode] || load.mode)}</td><td>${escapeHtml(TMS_LOAD_STATUSES[load.status] || load.status)}</td><td>${escapeHtml(load.freightClass)}</td><td>${formatCurrency(pricing.carrierCost)}</td><td>${formatCurrency(pricing.clientCharge)}</td><td>${formatCurrency(pricing.margin)}</td></tr>`;
      })
      .join("") || emptyRow("No TMS report rows match", 10);
}

function renderCustomerPortal() {
  const customerId = $("#portalCustomerSelect")?.value || state.customers[0]?.id || "";
  const warehouseId = $("#portalWarehouseSelect")?.value || "";
  if ($("#portalCustomerSelect") && customerId) $("#portalCustomerSelect").value = customerId;
  const loads = state.tmsLoads
    .map(normalizeTmsLoad)
    .filter((load) => !customerId || load.customerId === customerId)
    .filter((load) => !warehouseId || load.warehouseId === warehouseId);
  const totals = getTmsTotals(loads);
  const clientRates = state.tmsClientRates.map(normalizeTmsClientRate).filter((rate) => !customerId || rate.customerId === customerId);
  $("#portalTmsLoads").textContent = formatNumber(loads.length);
  $("#portalTmsOpen").textContent = formatNumber(totals.open);
  $("#portalTmsCharges").textContent = formatCurrency(totals.revenue);
  $("#portalTmsRates").textContent = formatNumber(clientRates.length);
  $("#portalTmsLoadTable").innerHTML =
    loads
      .map((load) => {
        const pricing = calculateTmsLoadPricing(load);
        return `<tr><td><strong>${escapeHtml(load.reference)}</strong></td><td>${escapeHtml(TMS_LOAD_STATUSES[load.status] || load.status)}</td><td>${escapeHtml(TMS_MODES[load.mode] || load.mode)}</td><td>${escapeHtml(getTmsCarrier(load.carrierId)?.name || "-")}</td><td>${escapeHtml(load.origin || "-")} -> ${escapeHtml(load.destination || "-")}</td><td>${escapeHtml(load.freightClass)}</td><td>${formatCurrency(pricing.clientCharge)}</td></tr>`;
      })
      .join("") || emptyRow("No loads available for this customer", 7);
  $("#portalTmsRateTable").innerHTML =
    clientRates
      .map((rate) => {
        const carrierRate = getTmsCarrierRate(rate.rateId);
        return `<tr><td><strong>${escapeHtml(rate.name)}</strong></td><td>${escapeHtml(TMS_MODES[rate.mode] || rate.mode)}</td><td>${escapeHtml(carrierRate?.laneName || "-")}</td><td>${escapeHtml(carrierRate?.serviceLevel || "-")}</td><td>Customer-facing schedule on file</td></tr>`;
      })
      .join("") || emptyRow("No customer-facing rates available", 5);
}

function renderRouteSelectors() {
  const activeWarehouse = getActiveWarehouseId();
  setOptions(
    $("#inboundRouteSelect"),
    [...state.receipts].filter((receipt) => warehouseMatches(receipt, activeWarehouse)).reverse(),
    "id",
    (receipt) => `${receipt.reference || receipt.id || receipt.date} - ${receipt.origin || "Origin"}`,
    "Select receipt"
  );
  setOptions(
    $("#outboundRouteSelect"),
    [...state.shipments].filter((shipment) => warehouseMatches(shipment, activeWarehouse)).reverse(),
    "id",
    (shipment) => `${shipment.reference || shipment.id || shipment.date} - ${shipment.destination || "Destination"}`,
    "Select shipment"
  );
  if (!$("#inboundRouteSelect").value && state.receipts[0]) $("#inboundRouteSelect").value = state.receipts[state.receipts.length - 1].id;
  if (!$("#outboundRouteSelect").value && state.shipments[0]) $("#outboundRouteSelect").value = state.shipments[state.shipments.length - 1].id;
  renderSelectedRoutes();
}

function renderSelectedRoutes() {
  const receipt = state.receipts.find((item) => item.id === $("#inboundRouteSelect").value) || state.receipts[state.receipts.length - 1];
  const shipment = state.shipments.find((item) => item.id === $("#outboundRouteSelect").value) || state.shipments[state.shipments.length - 1];
  renderRouteMap($("#inboundRouteMap"), $("#inboundRouteEvents"), receipt?.routeEvents || [], "Inbound");
  renderRouteMap($("#outboundRouteMap"), $("#outboundRouteEvents"), shipment ? normalizeShipment(shipment).routeEvents || [] : [], "Outbound");
}

function renderRouteMap(mapNode, eventsNode, events, label) {
  const points = events.map(normalizeRouteEvent);
  if (!points.length) {
    mapNode.innerHTML = `<div class="empty-map">No ${escapeHtml(label.toLowerCase())} route selected</div>`;
    eventsNode.innerHTML = "";
    return;
  }
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const project = (point) => {
    const x = 40 + ((point.lng - minLng) / Math.max(0.01, maxLng - minLng)) * 520;
    const y = 260 - ((point.lat - minLat) / Math.max(0.01, maxLat - minLat)) * 220;
    return { x, y };
  };
  const projected = points.map(project);
  const polyline = projected.map((point) => `${point.x},${point.y}`).join(" ");
  mapNode.innerHTML = `
    <svg viewBox="0 0 600 320" role="img" aria-label="${escapeHtml(label)} route map">
      <rect x="0" y="0" width="600" height="320" rx="8" class="map-bg"></rect>
      <polyline points="${polyline}" class="route-line"></polyline>
      ${projected
        .map(
          (point, index) => `
            <g class="route-point" tabindex="0">
              <circle cx="${point.x}" cy="${point.y}" r="${index === 0 || index === projected.length - 1 ? 9 : 7}"></circle>
              <text x="${point.x + 12}" y="${point.y - 10}">${escapeHtml(points[index].label)}</text>
            </g>
          `
        )
        .join("")}
    </svg>
  `;
  eventsNode.innerHTML = points
    .map(
      (point) => `
        <div class="route-event">
          <strong>${escapeHtml(point.label)}</strong>
          <span>${escapeHtml(point.location)} · ${escapeHtml(point.timestamp)}</span>
        </div>
      `
    )
    .join("");
}

function renderSettings() {
  const carrierSettings = normalizeCarrierSettings(state.carrierSettings);
  state.carrierSettings = carrierSettings;
  $("#currentUserRole").value = state.currentUserRole || "admin";
  $("#carrierMode").value = carrierSettings.mode;
  $("#carrierBackendUrl").value = carrierSettings.backendUrl || "";
  $("#upsAccount").value = carrierSettings.accounts.ups || "";
  $("#fedexAccount").value = carrierSettings.accounts.fedex || "";
  $("#uspsAccount").value = carrierSettings.accounts.usps || "";

  const appearance = normalizeAppearance(state.appearance);
  state.appearance = appearance;
  $("#appearanceAppName").value = appearance.appName;
  $("#appearanceInitials").value = appearance.initials;
  $("#appearancePrimary").value = appearance.primaryColor;
  $("#appearanceNav").value = appearance.navColor;
  $("#appearanceAccent").value = appearance.accentColor;
  $("#appearancePage").value = appearance.pageColor;
  $("#appearanceDensity").value = appearance.density;
  const pickSettings = normalizePickSettings(state.pickSettings);
  state.pickSettings = pickSettings;
  $("#pickSettingDefaultFee").value = pickSettings.defaultFee || "";
  $("#pickSettingLaborRate").value = pickSettings.laborRate || "";
  $("#pickSettingRushMultiplier").value = pickSettings.rushMultiplier || "";
  $("#pickSettingRequireApproval").checked = pickSettings.requireApproval;
  $("#pickSettingShowExceptions").checked = pickSettings.showExceptionsToCustomers;
  renderRoadmap();
  applyAppearance();
}

function renderRoadmap() {
  const grid = $("#roadmapGrid");
  if (!grid) return;
  grid.innerHTML = ROADMAP_ITEMS.map((item) => `<span class="roadmap-pill">${escapeHtml(item)}</span>`).join("");
}

function applyAppearance() {
  const appearance = normalizeAppearance(state.appearance);
  document.documentElement.style.setProperty("--blue", appearance.primaryColor);
  document.documentElement.style.setProperty("--nav", appearance.navColor);
  document.documentElement.style.setProperty("--nav-2", appearance.navColor);
  document.documentElement.style.setProperty("--accent", appearance.accentColor);
  document.documentElement.style.setProperty("--page", appearance.pageColor);
  document.body.classList.toggle("compact-density", appearance.density === "compact");
  $("#brandName").textContent = appearance.appName;
  $("#brandInitials").textContent = appearance.initials || "WMS";
  document.title = appearance.appName;
}

function updateAppearanceFromForm() {
  state.appearance = {
    appName: cleanText($("#appearanceAppName").value) || "BayLine Command Center",
    initials: cleanText($("#appearanceInitials").value).slice(0, 4).toUpperCase() || "BL",
    primaryColor: $("#appearancePrimary").value || "#2364aa",
    navColor: $("#appearanceNav").value || "#111827",
    accentColor: $("#appearanceAccent").value || "#f2b84b",
    pageColor: $("#appearancePage").value || "#f4f6f8",
    density: $("#appearanceDensity").value || "comfortable",
  };
  applyAppearance();
}

function setActiveView(viewId) {
  if (viewId === "admin" && state.currentUserRole !== "admin") {
    showToast("Admin role required for the financial snapshot.", "error");
  }
  const navButton = $(`.nav-item[data-view-target="${viewId}"]`);
  activeArm = navButton?.dataset.arm || activeArm || "wms";
  activeView = viewId;
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
  $$(".nav-item").forEach((button) =>
    button.classList.toggle("active", button.dataset.viewTarget === viewId)
  );
  $$(".nav-item").forEach((button) => {
    button.hidden = button.dataset.arm !== activeArm;
  });
  $$(".arm-button").forEach((button) => button.classList.toggle("active", button.dataset.armTarget === activeArm));
  $("#activeArmLabel").textContent = `${activeArm.toUpperCase()} Arm`;
  $("#viewTitle").textContent =
    $(`.nav-item[data-view-target="${viewId}"]`)?.textContent || "BayLine Command Center";
}

function setActiveArm(arm) {
  activeArm = arm;
  const firstView = $(`.nav-item[data-arm="${arm}"]`)?.dataset.viewTarget || "dashboard";
  setActiveView(firstView);
}

function resetSkuForm() {
  $("#skuForm").reset();
  $("#skuOriginal").value = "";
  $("#skuSubmitButton").textContent = "Add SKU";
  setSelectedOptions($("#skuWarehouseLinks"), [state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID]);
}

function resetWarehouseForm() {
  $("#warehouseForm").reset();
  $("#warehouseOriginal").value = "";
  $("#warehouseStatus").value = "active";
  $("#warehouseSubmitButton").textContent = "Save Warehouse";
}

function resetBayForm() {
  $("#bayForm").reset();
  $("#bayOriginal").value = "";
  $("#bayOriginalWarehouse").value = "";
  $("#bayWarehouse").value = getActiveWarehouseId() || state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID;
  $("#baySubmitButton").textContent = "Add Bay";
}

function resetOutboundForm() {
  $("#outboundForm").reset();
  $("#outboundDate").value = todayISO();
  $("#rateEstimatePill").textContent = "No rate estimate";
  setCarrierOptions();
}

function resetCustomerForm() {
  $("#customerForm").reset();
  $("#customerOriginal").value = "";
  $("#customerSubmitButton").textContent = "Save Customer";
  setSelectedOptions($("#customerWarehouseLinks"), [state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID]);
  setSelectedOptions($("#customerSkuLinks"), []);
  setSelectedOptions($("#customerBayLinks"), []);
}

function resetUserForm() {
  $("#userForm").reset();
  $("#userOriginal").value = "";
  $("#userRole").value = "operator";
  $("#userStatus").value = "active";
  $("#userSubmitButton").textContent = "Save User";
  setSelectedOptions($("#userWarehouseLinks"), [state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID]);
}

function resetLeaseForm() {
  $("#leaseForm").reset();
  $("#leaseOriginal").value = "";
  $("#leaseWarehouse").value = getActiveWarehouseId() || state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID;
  $("#leaseStatus").value = "active";
  $("#leaseSubmitButton").textContent = "Save Lease";
  setSelectedOptions($("#leaseBayLinks"), []);
}

function resetTmsLoadForm() {
  $("#tmsLoadForm").reset();
  $("#tmsLoadOriginal").value = "";
  $("#tmsLoadStatus").value = "draft";
  $("#tmsLoadMode").value = "ltl";
  $("#tmsLoadClass").value = "70";
  $("#tmsLoadShipDate").value = todayISO();
  $("#tmsLoadStackable").checked = true;
  $("#tmsLoadSubmitButton").textContent = "Save Load";
}

function resetTmsCarrierForm() {
  $("#tmsCarrierForm").reset();
  $("#tmsCarrierOriginal").value = "";
  $("#tmsCarrierStatus").value = "active";
  [...$("#tmsCarrierModes").querySelectorAll("input")].forEach((input) => {
    input.checked = input.value === "ltl";
  });
  $("#tmsCarrierSubmitButton").textContent = "Save Carrier";
}

function resetTmsCarrierRateForm() {
  $("#tmsCarrierRateForm").reset();
  $("#tmsCarrierRateOriginal").value = "";
  $("#tmsCarrierRateMode").value = "ltl";
  $("#tmsCarrierRateClass").value = "70";
  $("#tmsCarrierRateFrom").value = todayISO();
  $("#tmsCarrierRateSubmitButton").textContent = "Save Carrier Rate";
}

function resetTmsClientRateForm() {
  $("#tmsClientRateForm").reset();
  $("#tmsClientRateOriginal").value = "";
  $("#tmsClientRateMode").value = "ltl";
  $("#tmsClientRateFrom").value = todayISO();
  $("#tmsClientRateSubmitButton").textContent = "Save Client Rate";
}

function setSelectedOptions(select, values) {
  const selected = new Set(values);
  [...select.options].forEach((option) => {
    option.selected = selected.has(option.value);
  });
}

function getSelectedValues(select) {
  return [...select.selectedOptions].map((option) => option.value).filter(Boolean);
}

function logAudit(action, detail) {
  state.auditLog = [
    ...(state.auditLog || []),
    {
      id: uid("AUDIT"),
      date: todayISO(),
      role: state.currentUserRole || "admin",
      action,
      detail: cleanText(detail),
    },
  ].slice(-250);
}

function parseAccessorialText(text) {
  return cleanText(text)
    .split(",")
    .map((entry) => {
      const [name, amount] = entry.split(":").map(cleanText);
      return { name, amount: toNumber(amount) };
    })
    .filter((item) => item.name || item.amount);
}

function accessorialsText(accessorials) {
  return normalizeAccessorials(accessorials)
    .map((item) => `${item.name}:${item.amount}`)
    .join(", ");
}

function buildBolHtml(load, customerFacing = false) {
  const pricing = calculateTmsLoadPricing(load);
  const carrier = getTmsCarrier(load.carrierId);
  const customer = getCustomer(load.customerId);
  const accessorialRows =
    normalizeAccessorials(load.accessorials)
      .map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${customerFacing ? "-" : formatCurrency(item.amount)}</td></tr>`)
      .join("") || `<tr><td>None</td><td>-</td></tr>`;
  return `
    <div class="bol-document">
      <div class="invoice-header">
        <div>
          <p class="eyebrow">Bill of Lading</p>
          <h3>${escapeHtml(load.reference)}</h3>
        </div>
        <div>
          <span>Status</span>
          <strong>${escapeHtml(TMS_LOAD_STATUSES[load.status] || load.status)}</strong>
        </div>
      </div>
      <div class="invoice-grid">
        <div><span>Customer</span><strong>${escapeHtml(customer?.name || "-")}</strong></div>
        <div><span>Carrier</span><strong>${escapeHtml(carrier?.name || "-")}</strong></div>
        <div><span>SCAC</span><strong>${escapeHtml(carrier?.scac || "-")}</strong></div>
        <div><span>PRO / Tracking</span><strong>${escapeHtml(load.proNumber || "-")}</strong></div>
        <div><span>Mode</span><strong>${escapeHtml(TMS_MODES[load.mode] || load.mode)}</strong></div>
        <div><span>Service</span><strong>${escapeHtml(load.serviceLevel || "-")}</strong></div>
        <div><span>Ship Date</span><strong>${escapeHtml(load.shipDate || "-")}</strong></div>
        <div><span>Delivery Date</span><strong>${escapeHtml(load.deliveryDate || "-")}</strong></div>
      </div>
      <div class="invoice-grid">
        <div><span>Shipper</span><strong>${escapeHtml(load.shipper || formatWarehouse(load.warehouseId))}</strong><p>${escapeHtml(load.origin || "-")}</p></div>
        <div><span>Consignee</span><strong>${escapeHtml(load.consignee || "-")}</strong><p>${escapeHtml(load.destination || "-")}</p></div>
        <div><span>Bill To</span><strong>${escapeHtml(load.billTo || customer?.name || "-")}</strong></div>
      </div>
      <table class="invoice-table">
        <thead>
          <tr><th>HU</th><th>Pieces</th><th>Pallets</th><th>Class</th><th>NMFC</th><th>Weight</th><th>Dimensions</th><th>Flags</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>${formatNumber(load.handlingUnits)}</td>
            <td>${formatNumber(load.pieces)}</td>
            <td>${formatNumber(load.pallets)}</td>
            <td>${escapeHtml(load.freightClass)}</td>
            <td>${escapeHtml(load.nmfc || "-")}</td>
            <td>${formatWeight(load.weight)}</td>
            <td>${formatNumber(load.length)} x ${formatNumber(load.width)} x ${formatNumber(load.height)}</td>
            <td>${load.hazmat ? "Hazmat" : "Non-hazmat"} / ${load.stackable ? "Stackable" : "Do not stack"}</td>
          </tr>
        </tbody>
      </table>
      <div class="content-grid two-column bol-detail-grid">
        <section>
          <h4>Accessorials</h4>
          <table class="invoice-table"><tbody>${accessorialRows}</tbody></table>
        </section>
        <section>
          <h4>Shipment Summary</h4>
          <table class="invoice-table">
            <tbody>
              ${customerFacing ? "" : `<tr><td>Carrier Cost</td><td>${formatCurrency(pricing.carrierCost)}</td></tr>`}
              <tr><td>Customer Charge</td><td>${formatCurrency(pricing.clientCharge)}</td></tr>
              ${customerFacing ? "" : `<tr><td>Margin</td><td>${formatCurrency(pricing.margin)}</td></tr>`}
            </tbody>
          </table>
        </section>
      </div>
      <div class="signature-grid">
        <div><span>Shipper Signature</span></div>
        <div><span>Carrier Signature</span></div>
        <div><span>Consignee Signature</span></div>
      </div>
      <p class="subtle">${escapeHtml(load.notes || "")}</p>
    </div>
  `;
}

function handleTmsOrderSubmit(event) {
  event.preventDefault();
  const warehouse = getWarehouse($("#tmsOrderWarehouse").value);
  const load = normalizeTmsLoad({
    id: uid("TMSL"),
    reference: $("#tmsOrderReference").value,
    orderType: $("#tmsOrderType").value,
    shipmentId: $("#tmsOrderShipment").value,
    customerId: $("#tmsOrderCustomer").value,
    warehouseId: $("#tmsOrderWarehouse").value,
    mode: $("#tmsOrderMode").value,
    status: "draft",
    shipper: warehouse?.name || "",
    origin: $("#tmsOrderOrigin").value || `${warehouse?.city || ""}, ${warehouse?.state || ""}`,
    consignee: getCustomer($("#tmsOrderCustomer").value)?.name || "",
    destination: $("#tmsOrderDestination").value,
    billTo: getCustomer($("#tmsOrderCustomer").value)?.name || "",
    freightClass: "70",
    weight: 1,
    pieces: 1,
    handlingUnits: 1,
  });
  if (!load.reference || !load.customerId) {
    showToast("Add a reference and customer before creating the TMS order.", "error");
    return;
  }
  state.tmsLoads.push(load);
  logAudit("tms.order.create", load.reference);
  saveState();
  renderAll();
  showToast("Transportation order created.");
}

function buildTmsLoadFromForm() {
  return normalizeTmsLoad({
    id: $("#tmsLoadOriginal").value || uid("TMSL"),
    reference: $("#tmsLoadReference").value,
    orderType: $("#tmsLoadOrderType").value,
    shipmentId: $("#tmsLoadShipment").value,
    customerId: $("#tmsLoadCustomer").value,
    warehouseId: $("#tmsLoadWarehouse").value,
    carrierId: $("#tmsLoadCarrier").value,
    carrierRateId: $("#tmsLoadCarrierRate").value,
    clientRateId: $("#tmsLoadClientRate").value,
    mode: $("#tmsLoadMode").value,
    status: $("#tmsLoadStatus").value,
    serviceLevel: $("#tmsLoadServiceLevel").value,
    shipDate: $("#tmsLoadShipDate").value,
    deliveryDate: $("#tmsLoadDeliveryDate").value,
    proNumber: $("#tmsLoadPro").value,
    shipper: $("#tmsLoadShipper").value,
    origin: $("#tmsLoadOrigin").value,
    consignee: $("#tmsLoadConsignee").value,
    destination: $("#tmsLoadDestination").value,
    billTo: $("#tmsLoadBillTo").value,
    freightClass: $("#tmsLoadClass").value,
    nmfc: $("#tmsLoadNmfc").value,
    handlingUnits: $("#tmsLoadHandlingUnits").value,
    pieces: $("#tmsLoadPieces").value,
    pallets: $("#tmsLoadPallets").value,
    weight: $("#tmsLoadWeight").value,
    length: $("#tmsLoadLength").value,
    width: $("#tmsLoadWidth").value,
    height: $("#tmsLoadHeight").value,
    hazmat: $("#tmsLoadHazmat").checked,
    stackable: $("#tmsLoadStackable").checked,
    accessorials: parseAccessorialText($("#tmsLoadAccessorials").value),
    declaredValue: $("#tmsLoadDeclaredValue").value,
    carrierCost: $("#tmsLoadCarrierCost").value,
    clientCharge: $("#tmsLoadClientCharge").value,
    notes: $("#tmsLoadNotes").value,
    internalNotes: $("#tmsLoadInternalNotes").value,
    createdAt: state.tmsLoads.find((load) => load.id === $("#tmsLoadOriginal").value)?.createdAt || todayISO(),
  });
}

function handleTmsLoadSubmit(event) {
  event.preventDefault();
  const load = buildTmsLoadFromForm();
  if (!load.reference || !load.customerId || !load.carrierId) {
    showToast("Load reference, customer, and carrier are required.", "error");
    return;
  }
  const index = state.tmsLoads.findIndex((item) => item.id === load.id);
  if (index >= 0) state.tmsLoads[index] = load;
  else state.tmsLoads.push(load);
  logAudit(index >= 0 ? "tms.load.update" : "tms.load.create", load.reference);
  saveState();
  resetTmsLoadForm();
  renderAll();
  showToast("TMS load saved.");
}

function handleTmsCarrierSubmit(event) {
  event.preventDefault();
  const carrier = normalizeTmsCarrier({
    id: $("#tmsCarrierOriginal").value || uid("TMSC"),
    name: $("#tmsCarrierName").value,
    scac: $("#tmsCarrierScac").value,
    modes: [...$("#tmsCarrierModes").querySelectorAll("input:checked")].map((input) => input.value),
    status: $("#tmsCarrierStatus").value,
    contact: $("#tmsCarrierContact").value,
    email: $("#tmsCarrierEmail").value,
    phone: $("#tmsCarrierPhone").value,
    serviceAreas: $("#tmsCarrierAreas").value,
    insurance: $("#tmsCarrierInsurance").value,
    notes: $("#tmsCarrierNotes").value,
  });
  const index = state.tmsCarriers.findIndex((item) => item.id === carrier.id);
  if (index >= 0) state.tmsCarriers[index] = carrier;
  else state.tmsCarriers.push(carrier);
  logAudit("tms.carrier.save", carrier.name);
  saveState();
  resetTmsCarrierForm();
  renderAll();
  showToast("Carrier saved.");
}

function handleTmsCarrierRateSubmit(event) {
  event.preventDefault();
  const rate = normalizeTmsCarrierRate({
    id: $("#tmsCarrierRateOriginal").value || uid("TMSR"),
    carrierId: $("#tmsCarrierRateCarrier").value,
    laneName: $("#tmsCarrierRateLane").value,
    originRegion: $("#tmsCarrierRateOrigin").value,
    destinationRegion: $("#tmsCarrierRateDestination").value,
    mode: $("#tmsCarrierRateMode").value,
    serviceLevel: $("#tmsCarrierRateService").value,
    freightClass: $("#tmsCarrierRateClass").value,
    minWeight: $("#tmsCarrierRateMinWeight").value,
    maxWeight: $("#tmsCarrierRateMaxWeight").value,
    minimumCharge: $("#tmsCarrierRateMinimum").value,
    linehaul: $("#tmsCarrierRateLinehaul").value,
    fuelPct: $("#tmsCarrierRateFuel").value,
    accessorialFlat: $("#tmsCarrierRateAccessorial").value,
    effectiveFrom: $("#tmsCarrierRateFrom").value,
    effectiveTo: $("#tmsCarrierRateTo").value,
    notes: $("#tmsCarrierRateNotes").value,
  });
  if (!rate.carrierId || !rate.laneName) {
    showToast("Carrier and lane are required for rate cards.", "error");
    return;
  }
  const index = state.tmsCarrierRates.findIndex((item) => item.id === rate.id);
  if (index >= 0) state.tmsCarrierRates[index] = rate;
  else state.tmsCarrierRates.push(rate);
  logAudit("tms.carrierRate.save", rate.laneName);
  saveState();
  resetTmsCarrierRateForm();
  renderAll();
  showToast("Carrier rate saved.");
}

function handleTmsClientRateSubmit(event) {
  event.preventDefault();
  const rate = normalizeTmsClientRate({
    id: $("#tmsClientRateOriginal").value || uid("TMSCR"),
    customerId: $("#tmsClientRateCustomer").value,
    name: $("#tmsClientRateName").value,
    mode: $("#tmsClientRateMode").value,
    rateId: $("#tmsClientRateCarrierRate").value,
    percentMarkup: $("#tmsClientRatePercent").value,
    flatMarkup: $("#tmsClientRateFlat").value,
    fuelMarkupPct: $("#tmsClientRateFuelMarkup").value,
    accessorialMarkupPct: $("#tmsClientRateAccessorialMarkup").value,
    minimumMargin: $("#tmsClientRateMinimumMargin").value,
    effectiveFrom: $("#tmsClientRateFrom").value,
    effectiveTo: $("#tmsClientRateTo").value,
    notes: $("#tmsClientRateNotes").value,
  });
  if (!rate.customerId || !rate.name) {
    showToast("Customer and profile name are required.", "error");
    return;
  }
  const index = state.tmsClientRates.findIndex((item) => item.id === rate.id);
  if (index >= 0) state.tmsClientRates[index] = rate;
  else state.tmsClientRates.push(rate);
  logAudit("tms.clientRate.save", rate.name);
  saveState();
  resetTmsClientRateForm();
  renderAll();
  showToast("Client rate profile saved.");
}

function handleWarehouseSubmit(event) {
  event.preventDefault();
  const original = $("#warehouseOriginal").value;
  const warehouse = normalizeWarehouse({
    id: original || `WH-${normalizeCode($("#warehouseCode").value) || Date.now()}`,
    code: $("#warehouseCode").value,
    name: $("#warehouseName").value,
    address: $("#warehouseAddress").value,
    city: $("#warehouseCity").value,
    state: $("#warehouseState").value,
    postalCode: $("#warehousePostal").value,
    lat: $("#warehouseLat").value,
    lng: $("#warehouseLng").value,
    status: $("#warehouseStatus").value,
    storageRate: $("#warehouseStorageRate").value,
    handlingRate: $("#warehouseHandlingRate").value,
    notes: $("#warehouseNotes").value,
  });
  if (!warehouse.code || !warehouse.name) {
    showToast("Warehouse code and name are required.", "error");
    return;
  }
  if (state.warehouses.some((item) => item.code === warehouse.code && item.id !== original)) {
    showToast(`Warehouse ${warehouse.code} already exists.`, "error");
    return;
  }
  const index = state.warehouses.findIndex((item) => item.id === original);
  if (index >= 0) state.warehouses[index] = warehouse;
  else state.warehouses.push(warehouse);
  logAudit("warehouse.save", warehouse.code);
  resetWarehouseForm();
  saveState();
  renderAll();
  showToast(`Warehouse ${warehouse.code} saved.`);
}

function handleSkuSubmit(event) {
  event.preventDefault();
  const original = normalizeCode($("#skuOriginal").value);
  const sku = normalizeCode($("#skuNumber").value);
  const name = cleanText($("#skuName").value);

  if (!sku || !name) {
    showToast("SKU number and name are required.", "error");
    return;
  }
  if (state.skus.some((item) => item.sku === sku && item.sku !== original)) {
    showToast(`SKU ${sku} already exists.`, "error");
    return;
  }

  const record = {
    sku,
    name,
    length: toNumber($("#skuLength").value),
    width: toNumber($("#skuWidth").value),
    height: toNumber($("#skuHeight").value),
    weight: toNumber($("#skuWeight").value),
    warehouseIds: getSelectedValues($("#skuWarehouseLinks")).length
      ? getSelectedValues($("#skuWarehouseLinks"))
      : [state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID],
    notes: cleanText($("#skuNotes").value),
  };

  if (original) {
    const index = state.skus.findIndex((item) => item.sku === original);
    state.skus[index] = record;
    if (original !== sku) {
      [...state.inventory, ...state.receipts, ...state.shipments].forEach((row) => {
        if (row.sku === original) row.sku = sku;
      });
      state.customers.forEach((customer) => {
        customer.skuLinks = customer.skuLinks.map((link) => (link === original ? sku : link));
      });
    }
    showToast(`SKU ${sku} updated.`);
  } else {
    state.skus.push(record);
    showToast(`SKU ${sku} added.`);
  }

  resetSkuForm();
  logAudit("sku.save", sku);
  saveState();
  renderAll();
}

function handleBaySubmit(event) {
  event.preventDefault();
  const original = normalizeCode($("#bayOriginal").value);
  const originalWarehouse = $("#bayOriginalWarehouse").value;
  const warehouseId = $("#bayWarehouse").value || getActiveWarehouseId() || state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID;
  const code = normalizeCode($("#bayCode").value);
  const zone = cleanText($("#bayZone").value);

  if (!code || !zone) {
    showToast("Bay code and zone are required.", "error");
    return;
  }
  if (state.bays.some((bay) => bay.warehouseId === warehouseId && bay.code === code && !(bay.code === original && bay.warehouseId === originalWarehouse))) {
    showToast(`Bay ${code} already exists in ${getWarehouse(warehouseId)?.code || "that warehouse"}.`, "error");
    return;
  }

  const record = {
    warehouseId,
    code,
    zone,
    maxPallets: toInteger($("#bayMaxPallets").value),
    maxWeight: toNumber($("#bayMaxWeight").value),
    length: toNumber($("#bayLength").value),
    width: toNumber($("#bayWidth").value),
    height: toNumber($("#bayHeight").value),
    notes: cleanText($("#bayNotes").value),
  };

  if (original) {
    const index = state.bays.findIndex((bay) => bay.code === original && bay.warehouseId === originalWarehouse);
    state.bays[index] = record;
    if (original !== code || originalWarehouse !== warehouseId) {
      [...state.inventory, ...state.receipts, ...state.shipments].forEach((row) => {
        if (row.bayCode === original && row.warehouseId === originalWarehouse) {
          row.bayCode = code;
          row.warehouseId = warehouseId;
        }
      });
      state.customers.forEach((customer) => {
        customer.bayLinks = customer.bayLinks.map((link) =>
          link === bayKey(originalWarehouse, original) ? bayKey(warehouseId, code) : link
        );
      });
    }
    showToast(`Bay ${code} updated.`);
  } else {
    state.bays.push(record);
    showToast(`Bay ${code} added.`);
  }

  resetBayForm();
  logAudit("bay.save", `${getWarehouse(warehouseId)?.code || warehouseId}/${code}`);
  saveState();
  renderAll();
}

function handleReceive(event) {
  event.preventDefault();
  const warehouseId = $("#receiveWarehouse").value || getActiveWarehouseId() || state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID;
  const sku = $("#receiveSku").value;
  const bayCode = $("#receiveBay").value;
  const units = toInteger($("#receiveUnits").value);
  const pallets = toInteger($("#receivePallets").value);

  if (!sku || !bayCode) {
    showToast("Select a SKU and bay before receiving.", "error");
    return;
  }
  if (!units && !pallets) {
    showToast("Enter units, pallets, or both.", "error");
    return;
  }

  const receipt = {
    id: uid("REC"),
    date: $("#receiveDate").value || todayISO(),
    warehouseId,
    sku,
    bayCode,
    units,
    pallets,
    customerId: $("#receiveCustomer").value,
    primaryUserId: $("#receiveAssignedUser").value,
    assignedUserIds: $("#receiveAssignedUser").value ? [$("#receiveAssignedUser").value] : [],
    origin: cleanText($("#receiveOrigin").value) || "Supplier Origin",
    originLat: Number($("#receiveOriginLat").value),
    originLng: Number($("#receiveOriginLng").value),
    reference: cleanText($("#receiveReference").value),
    notes: cleanText($("#receiveNotes").value),
  };
  receipt.routeEvents = makeRouteEvents(
    receipt.origin,
    getWarehouse(warehouseId)?.name || "Main Warehouse",
    "Inbound",
    {
      name: receipt.origin,
      lat: receipt.originLat,
      lng: receipt.originLng,
    },
    getWarehouseLocation(warehouseId)
  );

  const balance = getOrCreateBalance(sku, bayCode, warehouseId);
  balance.units += units;
  balance.pallets += pallets;
  state.receipts.push(receipt);

  const bay = getBay(bayCode, warehouseId);
  const status = bay ? capacityStatus(bay) : null;
  $("#receiveForm").reset();
  $("#receiveDate").value = todayISO();
  $("#receiveWarehouse").value = warehouseId;
  $("#receiveAssignedUser").value = receipt.primaryUserId || "";
  logAudit("receipt.create", receipt.reference || receipt.id);
  saveState();
  renderAll();

  if (status?.className === "over") {
    showToast(`Received stock, but bay ${bayCode} is over capacity.`, "error");
  } else {
    showToast(`Received ${formatNumber(units)} units into ${bayCode}.`);
  }
}

function handleOutbound(event) {
  event.preventDefault();
  const warehouseId = $("#outboundWarehouse").value || getActiveWarehouseId() || state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID;
  const sku = $("#outboundSku").value;
  const bayCode = $("#outboundBay").value;
  const units = toInteger($("#outboundUnits").value);
  const pallets = toInteger($("#outboundPallets").value);
  const balance = getBalance(sku, bayCode, warehouseId);

  if (!sku || !bayCode) {
    showToast("Select a SKU and bay before shipping.", "error");
    return;
  }
  if (!units && !pallets) {
    showToast("Enter units, pallets, or both.", "error");
    return;
  }
  if (!balance || balance.units < units || balance.pallets < pallets) {
    showToast("Shipment exceeds available inventory for that SKU and bay.", "error");
    return;
  }

  const skuRecord = getSku(sku);
  const carrier = $("#outboundCarrier").value || "ups";
  const service = $("#outboundService").value || CARRIER_CATALOG[carrier]?.services[0]?.code || "";
  const packageCount = toInteger($("#outboundPackageCount").value) || 1;
  const rate = estimateOutboundRate();
  const freightCharge = toNumber($("#outboundFreightCharge").value) || rate.freight;
  const fuelCharge = toNumber($("#outboundFuelCharge").value) || rate.fuel;
  const accessorials = [];
  if ($("#accessorialLiftgate").checked || toNumber($("#accessorialLiftgateCharge").value)) {
    accessorials.push({ name: "Liftgate", amount: toNumber($("#accessorialLiftgateCharge").value) });
  }
  if ($("#accessorialResidential").checked || toNumber($("#accessorialResidentialCharge").value)) {
    accessorials.push({ name: "Residential", amount: toNumber($("#accessorialResidentialCharge").value) });
  }
  if ($("#accessorialOther").checked || cleanText($("#accessorialOtherName").value) || toNumber($("#accessorialOtherCharge").value)) {
    accessorials.push({
      name: cleanText($("#accessorialOtherName").value) || "Other Accessorial",
      amount: toNumber($("#accessorialOtherCharge").value),
    });
  }

  const shipment = {
    id: uid("SHP"),
    date: $("#outboundDate").value || todayISO(),
    warehouseId,
    sku,
    bayCode,
    units,
    pallets,
    reference: cleanText($("#outboundReference").value),
    primaryUserId: $("#outboundAssignedUser").value,
    assignedUserIds: $("#outboundAssignedUser").value ? [$("#outboundAssignedUser").value] : [],
    origin: cleanText($("#outboundOrigin").value) || getWarehouse(warehouseId)?.name || "Main Warehouse",
    destination: cleanText($("#outboundDestination").value),
    miles: toNumber($("#outboundMiles").value),
    carrier,
    service,
    packageCount,
    package: {
      length: toNumber($("#outboundPackageLength").value),
      width: toNumber($("#outboundPackageWidth").value),
      height: toNumber($("#outboundPackageHeight").value),
    },
    shipTo: {
      name: cleanText($("#outboundShipToName").value),
      address: cleanText($("#outboundShipToAddress").value),
      city: cleanText($("#outboundShipToCity").value),
      state: cleanText($("#outboundShipToState").value).toUpperCase(),
      postalCode: cleanText($("#outboundShipToPostal").value),
    },
    declaredValue: toNumber($("#outboundDeclaredValue").value),
    rateEstimate: rate.total,
    carrierStatus: "Draft",
    trackingNumber: "",
    carrierSubmittedAt: "",
    freightCharge,
    fuelCharge,
    accessorials,
    notes: cleanText($("#outboundNotes").value),
    totalWeight: units * (skuRecord?.weight || 0),
  };
  shipment.routeEvents = makeRouteEvents(shipment.origin || "Main Warehouse", shipment.destination || "Destination", "Outbound", getWarehouseLocation(warehouseId));
  shipment.invoiceTotal = calculateInvoiceTotal(shipment);

  balance.units -= units;
  balance.pallets -= pallets;
  state.shipments.push(shipment);
  selectedInvoiceId = shipment.id;
  resetOutboundForm();
  $("#outboundWarehouse").value = warehouseId;
  logAudit("shipment.create", shipment.reference || shipment.id);
  saveState();
  renderAll();
  showToast(`Shipment ${shipment.reference || shipment.id} recorded.`);
}

function handleCustomerSubmit(event) {
  event.preventDefault();
  const original = $("#customerOriginal").value;
  const customer = normalizeCustomer({
    id: original || uid("CUST"),
    code: $("#customerCode").value,
    name: $("#customerName").value,
    contact: $("#customerContact").value,
    email: $("#customerEmail").value,
    phone: $("#customerPhone").value,
    kitFee: $("#customerKitFee").value,
    storageRate: $("#customerStorageRate").value,
    warehouseIds: getSelectedValues($("#customerWarehouseLinks")),
    skuLinks: getSelectedValues($("#customerSkuLinks")),
    bayLinks: getSelectedValues($("#customerBayLinks")),
  });
  if (!customer.code || !customer.name) {
    showToast("Customer code and name are required.", "error");
    return;
  }
  if (state.customers.some((item) => item.code === customer.code && item.id !== original)) {
    showToast(`Customer ${customer.code} already exists.`, "error");
    return;
  }
  const index = state.customers.findIndex((item) => item.id === original);
  if (index >= 0) state.customers[index] = customer;
  else state.customers.push(customer);
  logAudit("customer.save", customer.code);
  resetCustomerForm();
  saveState();
  renderAll();
  showToast(`Customer ${customer.name} saved.`);
}

function handleUserSubmit(event) {
  event.preventDefault();
  const original = $("#userOriginal").value;
  const user = normalizeUserProfile({
    id: original || uid("USER"),
    name: $("#userName").value,
    authUserId: $("#userAuthId").value,
    role: $("#userRole").value,
    status: $("#userStatus").value,
    warehouseIds: getSelectedValues($("#userWarehouseLinks")),
    contact: $("#userContact").value,
  });
  if (!user.name) {
    showToast("User name is required.", "error");
    return;
  }
  const index = state.users.findIndex((item) => item.id === original);
  if (index >= 0) state.users[index] = user;
  else state.users.push(user);
  resetUserForm();
  logAudit("user.save", user.name);
  saveState();
  renderAll();
  showToast(`User ${user.name} saved.`);
}

function handleLaborSubmit(event) {
  event.preventDefault();
  const orderType = $("#laborOrderType").value || "admin";
  const orderId = $("#laborOrderId").value;
  const order = getOrderOptions(orderType).find((item) => item.id === orderId);
  const entry = normalizeLaborEntry({
    id: uid("LAB"),
    userId: $("#laborUser").value,
    warehouseId: order?.warehouseId || getActiveWarehouseId() || state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID,
    customerId: order?.customerId || "",
    orderType,
    orderId,
    taskType: $("#laborTaskType").value || "admin",
    startTime: $("#laborStart").value,
    endTime: $("#laborEnd").value,
    hours: $("#laborHours").value,
    billable: $("#laborBillable").checked,
    rate: $("#laborRate").value || state.pickSettings?.laborRate || 0,
    notes: $("#laborNotes").value,
  });
  if (!entry.userId) {
    showToast("Select a user before logging labor.", "error");
    return;
  }
  if (!entry.hours) {
    showToast("Enter labor hours or a valid start and end time.", "error");
    return;
  }
  state.laborEntries.push(entry);
  attachLaborToOrder(entry);
  $("#laborForm").reset();
  $("#laborBillable").checked = true;
  $("#laborRate").value = state.pickSettings?.laborRate || "";
  logAudit("labor.create", `${formatUser(entry.userId)} ${entry.hours} hours`);
  saveState();
  renderAll();
  showToast(`Logged ${formatNumber(entry.hours)} labor hours.`);
}

function handleDocumentStageSubmit(event) {
  event.preventDefault();
  const orderType = $("#documentOrderType").value || "shipment";
  const orderId = $("#documentOrderId").value;
  const order = getOrderOptions(orderType).find((item) => item.id === orderId);
  const stage = normalizeDocumentStage({
    id: uid("DOC"),
    warehouseId: $("#documentWarehouse").value || order?.warehouseId || state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID,
    customerId: $("#documentCustomer").value || order?.customerId || "",
    orderType,
    orderId,
    reference: order?.label?.split(" - ")[0] || orderId || `LOAD-${state.documentStages.length + 1}`,
    status: $("#documentStatus").value,
    assignedUserId: $("#documentAssignedUser").value,
    requiredDocs: $("#documentRequiredDocs").value,
    receivedDocs: $("#documentReceivedDocs").value,
    notes: $("#documentNotes").value,
  });
  state.documentStages.push(stage);
  attachDocumentToOrder(stage);
  $("#documentStageForm").reset();
  $("#documentStatus").value = "waiting";
  logAudit("document.stage", `${stage.reference} ${getDocumentStatusLabel(stage.status)}`);
  saveState();
  renderAll();
  showToast(`Load ${stage.reference} added to document staging.`);
}

function findOrderRecord(type, id) {
  if (!id) return null;
  if (type === "receipt") return state.receipts.find((row) => row.id === id);
  if (type === "shipment") return state.shipments.find((row) => row.id === id);
  if (type === "pick") return state.pickRequests.find((row) => row.id === id);
  if (type === "kit") return state.kitOrders.find((row) => row.id === id);
  if (type === "document") return state.documentStages.find((row) => row.id === id);
  return null;
}

function attachLaborToOrder(entry) {
  const record = findOrderRecord(entry.orderType, entry.orderId);
  if (!record) return;
  record.laborEntryIds = [...new Set([...(record.laborEntryIds || []), entry.id])];
  if (!record.primaryUserId) record.primaryUserId = entry.userId;
  record.assignedUserIds = [...new Set([...(record.assignedUserIds || []), entry.userId].filter(Boolean))];
  record.averageCompletionMinutes = getOrderAverageMinutes(entry.orderType, entry.orderId);
}

function attachDocumentToOrder(stage) {
  const record = findOrderRecord(stage.orderType, stage.orderId);
  if (!record) return;
  record.documentStageId = stage.id;
  if (stage.assignedUserId) {
    record.assignedUserIds = [...new Set([...(record.assignedUserIds || []), stage.assignedUserId])];
    if (!record.primaryUserId) record.primaryUserId = stage.assignedUserId;
  }
}

function getOrderAverageMinutes(orderType, orderId) {
  const entries = state.laborEntries.filter((entry) => entry.orderType === orderType && entry.orderId === orderId && entry.hours);
  if (!entries.length) return 0;
  return entries.reduce((sum, entry) => sum + entry.hours * 60, 0) / entries.length;
}

function handleLeaseSubmit(event) {
  event.preventDefault();
  const original = $("#leaseOriginal").value;
  const lease = normalizeLease({
    id: original || uid("LEASE"),
    customerId: $("#leaseCustomer").value,
    warehouseId: $("#leaseWarehouse").value,
    bayKeys: getSelectedValues($("#leaseBayLinks")),
    startDate: $("#leaseStartDate").value,
    endDate: $("#leaseEndDate").value,
    monthlyRate: $("#leaseMonthlyRate").value,
    palletAllowance: $("#leasePalletAllowance").value,
    sqftAllowance: $("#leaseSqftAllowance").value,
    weightAllowance: $("#leaseWeightAllowance").value,
    palletOverageRate: $("#leasePalletOverageRate").value,
    sqftOverageRate: $("#leaseSqftOverageRate").value,
    weightOverageRate: $("#leaseWeightOverageRate").value,
    status: $("#leaseStatus").value,
    notes: $("#leaseNotes").value,
  });
  if (!lease.customerId || !lease.warehouseId) {
    showToast("Select a customer and warehouse for the lease.", "error");
    return;
  }
  const index = state.customerLeases.findIndex((item) => item.id === original);
  if (index >= 0) state.customerLeases[index] = lease;
  else state.customerLeases.push(lease);
  logAudit("lease.save", `${getCustomer(lease.customerId)?.code || lease.customerId} ${getWarehouse(lease.warehouseId)?.code || ""}`);
  resetLeaseForm();
  saveState();
  renderAll();
  showToast("Leased space saved.");
}

function handlePickRequestSubmit(event) {
  event.preventDefault();
  const settings = normalizePickSettings(state.pickSettings);
  const customerId = $("#pickCustomer").value;
  const warehouseId = $("#pickWarehouse").value;
  const customer = getCustomer(customerId);
  const lines = parsePickLines($("#pickLines").value);
  if (!customerId || !warehouseId) {
    showToast("Select a customer and warehouse for the pick request.", "error");
    return;
  }
  if (customer?.warehouseIds?.length && !customer.warehouseIds.includes(warehouseId)) {
    showToast("That customer is not assigned to this warehouse.", "error");
    return;
  }
  if (!lines.length) {
    showToast("Add at least one pick line.", "error");
    return;
  }
  const invalidSku = lines.find((line) => !getSku(line.sku));
  if (invalidSku) {
    showToast(`SKU ${invalidSku.sku} is not in the catalog.`, "error");
    return;
  }
  const request = normalizePickRequest({
    id: uid("PICK"),
    reference: `PICK-${state.pickRequests.length + 1}`,
    source: $("#pickSource").value,
    customerId,
    warehouseId,
    priority: $("#pickPriority").value,
    requestedShipDate: $("#pickRequestedShipDate").value,
    destination: $("#pickDestination").value,
    carrierPreference: $("#pickCarrierPreference").value,
    assignedPicker: $("#pickAssignedPicker").value,
    primaryUserId: $("#pickAssignedUser").value,
    assignedUserIds: $("#pickAssignedUser").value ? [$("#pickAssignedUser").value] : [],
    status: settings.requireApproval ? "review" : "requested",
    pickFee: toNumber($("#pickFee").value) || settings.defaultFee,
    laborCharge: toNumber($("#pickLaborCharge").value),
    notes: $("#pickNotes").value,
    attachments: $("#pickAttachments").value,
    createdAt: todayISO(),
    lines,
  });
  state.pickRequests.push(request);
  selectedPickRequestId = request.id;
  logAudit("pick.request.create", request.reference);
  $("#pickRequestForm").reset();
  $("#pickRequestedShipDate").value = todayISO();
  saveState();
  renderAll();
  showToast(`Pick request ${request.reference} submitted.`);
}

function buildPickReservations(request) {
  const customer = getCustomer(request.customerId);
  const reservations = [];
  const normalized = normalizePickRequest(request);
  for (const line of normalized.lines) {
    let remaining = line.quantity;
    const balances = state.inventory
      .filter((row) => row.warehouseId === normalized.warehouseId && row.sku === line.sku && (row.units || 0) > 0)
      .filter((row) => !line.preferredBay || row.bayCode === line.preferredBay)
      .filter((row) => !customer?.bayLinks.length || customer.bayLinks.includes(bayKey(row.warehouseId, row.bayCode)))
      .sort((a, b) => a.bayCode.localeCompare(b.bayCode));
    const fallbackBalances = line.preferredBay
      ? state.inventory
          .filter((row) => row.warehouseId === normalized.warehouseId && row.sku === line.sku && row.bayCode !== line.preferredBay && (row.units || 0) > 0)
          .filter((row) => !customer?.bayLinks.length || customer.bayLinks.includes(bayKey(row.warehouseId, row.bayCode)))
          .sort((a, b) => a.bayCode.localeCompare(b.bayCode))
      : [];
    for (const balance of [...balances, ...fallbackBalances]) {
      const available = getAvailableUnits(balance, normalized.id);
      const quantity = Math.min(available, remaining);
      if (quantity > 0) {
        reservations.push({
          id: uid("PRES"),
          pickRequestId: normalized.id,
          lineId: line.id,
          customerId: normalized.customerId,
          warehouseId: normalized.warehouseId,
          sku: line.sku,
          bayCode: balance.bayCode,
          quantity,
          status: "reserved",
        });
        remaining -= quantity;
      }
      if (!remaining) break;
    }
    if (remaining) {
      showToast(`Not enough available stock to reserve ${line.sku}.`, "error");
      return null;
    }
  }
  return reservations;
}

function reservePickRequest(id) {
  const request = getPickRequest(id);
  if (!request || ["closed", "canceled", "shipped"].includes(request.status)) return;
  const reservations = buildPickReservations(request);
  if (!reservations) return;
  request.status = "reserved";
  request.approvedAt = todayISO();
  request.lines = request.lines.map((line) => ({
    ...line,
    reservedQuantity: reservations
      .filter((reservation) => reservation.lineId === line.id)
      .reduce((sum, reservation) => sum + reservation.quantity, 0),
    status: "reserved",
  }));
  state.pickReservations = state.pickReservations
    .filter((reservation) => reservation.pickRequestId !== request.id)
    .concat(reservations);
  selectedPickRequestId = id;
  logAudit("pick.reserve", request.reference);
  saveState();
  renderAll();
  showToast(`Pick ${request.reference} reserved.`);
}

function startPickRequest(id) {
  const request = getPickRequest(id);
  if (!request) return;
  if (request.status === "reserved") {
    request.status = "picking";
    logAudit("pick.start", request.reference);
    showToast(`Pick ${request.reference} assigned to the floor.`);
  } else if (request.status === "picking") {
    for (const reservation of state.pickReservations.filter((item) => item.pickRequestId === request.id && item.status === "reserved")) {
      const balance = getBalance(reservation.sku, reservation.bayCode, reservation.warehouseId);
      if (!balance || balance.units < reservation.quantity) {
        showToast(`Inventory changed before picking ${reservation.sku}.`, "error");
        return;
      }
    }
    state.pickReservations
      .filter((item) => item.pickRequestId === request.id && item.status === "reserved")
      .forEach((reservation) => {
        const balance = getBalance(reservation.sku, reservation.bayCode, reservation.warehouseId);
        if (balance) balance.units = Math.max(0, balance.units - reservation.quantity);
        reservation.status = "picked";
      });
    request.lines = request.lines.map((line) => ({
      ...line,
      pickedQuantity: line.reservedQuantity,
      shortQuantity: Math.max(0, (line.quantity || 0) - (line.reservedQuantity || 0)),
      status: "picked",
    }));
    request.status = "picked";
    logAudit("pick.complete", request.reference);
    showToast(`Pick ${request.reference} marked picked.`);
  } else {
    showToast("Reserve the request before picking.", "error");
    return;
  }
  selectedPickRequestId = id;
  saveState();
  renderAll();
}

function reportPickException(id) {
  const request = getPickRequest(id);
  if (!request || ["closed", "canceled"].includes(request.status)) return;
  const note = "Short pick or substitution requires supervisor review.";
  request.status = "exception";
  request.exceptions = [
    ...(request.exceptions || []),
    normalizePickException({
      type: "Pick exception",
      note,
      visibleToCustomer: state.pickSettings?.showExceptionsToCustomers !== false,
    }),
  ];
  request.lines = request.lines.map((line) => ({
    ...line,
    shortQuantity: Math.max(0, (line.quantity || 0) - (line.reservedQuantity || 0)),
    status: "exception",
  }));
  selectedPickRequestId = id;
  logAudit("pick.exception", request.reference);
  saveState();
  renderAll();
  showToast(`Exception added to ${request.reference}.`);
}

function packPickRequest(id) {
  const request = getPickRequest(id);
  if (!request) return;
  if (!["picked", "exception"].includes(request.status)) {
    showToast("Pick the request before packing.", "error");
    return;
  }
  const cartons = Math.max(1, Math.ceil(getPickTotals(request).units / 24));
  request.status = "packed";
  request.packedAt = todayISO();
  request.packingRecord = normalizePackingRecord({
    cartons,
    packedBy: request.assignedPicker || "Warehouse team",
    weight: getPickTotals(request).weight,
    notes: "Packed from pick workflow",
  });
  selectedPickRequestId = id;
  logAudit("pick.pack", request.reference);
  saveState();
  renderAll();
  showToast(`Pick ${request.reference} packed.`);
}

function shipPickRequest(id) {
  const request = getPickRequest(id);
  if (!request) return;
  if (request.status !== "packed") {
    showToast("Pack the request before shipping.", "error");
    return;
  }
  const customer = getCustomer(request.customerId);
  const billing = getPickBilling(request);
  const pickedLines = request.lines.filter((line) => (line.pickedQuantity || 0) > 0);
  pickedLines.forEach((line, index) => {
    const skuRecord = getSku(line.sku);
    const shipment = normalizeShipment({
      id: uid("SHP"),
      date: todayISO(),
      warehouseId: request.warehouseId,
      sku: line.sku,
      bayCode: line.preferredBay || state.pickReservations.find((reservation) => reservation.lineId === line.id)?.bayCode || "",
      units: line.pickedQuantity,
      pallets: 0,
      reference: `${request.reference}-${line.sku}`,
      customerId: request.customerId,
      origin: getWarehouse(request.warehouseId)?.name || "Warehouse",
      destination: request.destination || customer?.name || "Customer Destination",
      miles: 0,
      carrier: CARRIER_CATALOG[request.carrierPreference] ? request.carrierPreference : "ups",
      service: CARRIER_CATALOG[request.carrierPreference]?.services[0]?.code || "ground",
      packageCount: request.packingRecord?.cartons || 1,
      shipTo: { name: customer?.name || "", address: request.destination || "", city: "", state: "", postalCode: "" },
      carrierStatus: "Draft",
      freightCharge: index === 0 ? billing.total : 0,
      fuelCharge: 0,
      accessorials: index === 0 ? [{ name: "Pick Fulfillment", amount: 0 }] : [],
      notes: `Converted from ${request.reference}`,
      totalWeight: (line.pickedQuantity || 0) * (skuRecord?.weight || 0),
      routeEvents: makeRouteEvents(getWarehouse(request.warehouseId)?.name || "Warehouse", request.destination || "Customer Destination", "Outbound", getWarehouseLocation(request.warehouseId)),
    });
    shipment.invoiceTotal = calculateInvoiceTotal(shipment);
    state.shipments.push(shipment);
    if (index === 0) request.shipmentId = shipment.id;
  });
  request.status = "shipped";
  request.shippedAt = todayISO();
  selectedPickRequestId = id;
  selectedInvoiceId = request.shipmentId || selectedInvoiceId;
  logAudit("pick.ship", request.reference);
  saveState();
  renderAll();
  showToast(`Pick ${request.reference} converted to shipment.`);
}

function closePickRequest(id) {
  const request = getPickRequest(id);
  if (!request) return;
  if (!["shipped", "packed"].includes(request.status)) {
    showToast("Ship or pack the request before closing.", "error");
    return;
  }
  request.status = "closed";
  request.closedAt = todayISO();
  state.pickReservations = state.pickReservations.map((reservation) =>
    reservation.pickRequestId === request.id ? { ...reservation, status: "consumed" } : reservation
  );
  selectedPickRequestId = id;
  logAudit("pick.close", request.reference);
  saveState();
  renderAll();
  showToast(`Pick ${request.reference} closed.`);
}

function cancelPickRequest(id) {
  const request = getPickRequest(id);
  if (!request || ["closed", "shipped"].includes(request.status)) {
    showToast("Closed or shipped picks cannot be canceled.", "error");
    return;
  }
  request.status = "canceled";
  request.closedAt = todayISO();
  request.lines = request.lines.map((line) => ({
    ...line,
    status: "canceled",
  }));
  state.pickReservations = state.pickReservations.map((reservation) =>
    reservation.pickRequestId === request.id && reservation.status === "reserved" ? { ...reservation, status: "released" } : reservation
  );
  selectedPickRequestId = id;
  logAudit("pick.cancel", request.reference);
  saveState();
  renderAll();
  showToast(`Pick ${request.reference} canceled and reservations released.`);
}

function handleKitTemplateSubmit(event) {
  event.preventDefault();
  const original = $("#kitTemplateOriginal").value;
  const template = normalizeKitTemplate({
    id: original || uid("KIT"),
    warehouseId: $("#kitTemplateWarehouse").value || getActiveWarehouseId() || state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID,
    customerId: $("#kitTemplateCustomer").value,
    name: $("#kitTemplateName").value,
    lines: parseKitLines($("#kitTemplateLines").value),
  });
  if (!template.customerId || !template.lines.length) {
    showToast("Select a customer and add at least one kit SKU.", "error");
    return;
  }
  const index = state.kitTemplates.findIndex((item) => item.id === original);
  if (index >= 0) state.kitTemplates[index] = template;
  else state.kitTemplates.push(template);
  logAudit("kit.template.save", template.name);
  $("#kitTemplateForm").reset();
  $("#kitTemplateOriginal").value = "";
  saveState();
  renderAll();
  showToast(`Standard kit ${template.name} saved.`);
}

function handleKitOrderSubmit(event) {
  event.preventDefault();
  const template = state.kitTemplates.find((item) => item.id === $("#kitOrderTemplate").value);
  const lines = parseKitLines($("#kitOrderLines").value);
  const order = normalizeKitOrder({
    id: uid("KO"),
    warehouseId: $("#kitOrderWarehouse").value || template?.warehouseId || getActiveWarehouseId() || state.warehouses[0]?.id || DEFAULT_WAREHOUSE_ID,
    customerId: $("#kitOrderCustomer").value || template?.customerId || "",
    templateId: template?.id || "",
    reference: $("#kitOrderReference").value || `KIT-${state.kitOrders.length + 1}`,
    status: "review",
    lines: lines.length ? lines : template?.lines || [],
    reservations: [],
    createdAt: todayISO(),
  });
  if (!order.customerId || !order.lines.length) {
    showToast("Select a customer and add kit lines before submitting.", "error");
    return;
  }
  state.kitOrders.push(order);
  logAudit("kit.order.create", order.reference);
  $("#kitOrderForm").reset();
  saveState();
  renderAll();
  showToast(`Kit request ${order.reference} submitted for review.`);
}

function editCustomer(id) {
  const customer = getCustomer(id);
  if (!customer) return;
  $("#customerOriginal").value = customer.id;
  $("#customerCode").value = customer.code;
  $("#customerName").value = customer.name;
  $("#customerContact").value = customer.contact || "";
  $("#customerEmail").value = customer.email || "";
  $("#customerPhone").value = customer.phone || "";
  $("#customerKitFee").value = customer.kitFee || "";
  $("#customerStorageRate").value = customer.storageRate || "";
  setSelectedOptions($("#customerWarehouseLinks"), customer.warehouseIds || []);
  setSelectedOptions($("#customerSkuLinks"), customer.skuLinks);
  setSelectedOptions($("#customerBayLinks"), customer.bayLinks);
  $("#customerSubmitButton").textContent = "Update Customer";
  setActiveView("customers");
}

function editUser(id) {
  const user = getUser(id);
  if (!user) return;
  $("#userOriginal").value = user.id;
  $("#userName").value = user.name;
  $("#userAuthId").value = user.authUserId || "";
  $("#userRole").value = user.role || "operator";
  $("#userStatus").value = user.status || "active";
  $("#userContact").value = user.contact || "";
  setSelectedOptions($("#userWarehouseLinks"), user.warehouseIds || []);
  $("#userSubmitButton").textContent = "Update User";
  setActiveView("labor");
}

function deleteUser(id) {
  if (countUserAssignments(id) || state.laborEntries.some((entry) => entry.userId === id)) {
    showToast("Users with assignments or labor cannot be deleted.", "error");
    return;
  }
  const user = getUser(id);
  state.users = state.users.filter((item) => item.id !== id);
  logAudit("user.delete", user?.name || id);
  saveState();
  renderAll();
  showToast("User deleted.");
}

function editTmsLoad(id) {
  const load = state.tmsLoads.map(normalizeTmsLoad).find((item) => item.id === id);
  if (!load) return;
  $("#tmsLoadOriginal").value = load.id;
  $("#tmsLoadReference").value = load.reference;
  $("#tmsLoadOrderType").value = load.orderType;
  $("#tmsLoadCustomer").value = load.customerId;
  $("#tmsLoadWarehouse").value = load.warehouseId;
  $("#tmsLoadShipment").value = load.shipmentId;
  $("#tmsLoadCarrier").value = load.carrierId;
  $("#tmsLoadCarrierRate").value = load.carrierRateId;
  $("#tmsLoadClientRate").value = load.clientRateId;
  $("#tmsLoadMode").value = load.mode;
  $("#tmsLoadStatus").value = load.status;
  $("#tmsLoadServiceLevel").value = load.serviceLevel;
  $("#tmsLoadShipDate").value = load.shipDate;
  $("#tmsLoadDeliveryDate").value = load.deliveryDate;
  $("#tmsLoadPro").value = load.proNumber;
  $("#tmsLoadShipper").value = load.shipper;
  $("#tmsLoadOrigin").value = load.origin;
  $("#tmsLoadConsignee").value = load.consignee;
  $("#tmsLoadDestination").value = load.destination;
  $("#tmsLoadBillTo").value = load.billTo;
  $("#tmsLoadClass").value = load.freightClass;
  $("#tmsLoadNmfc").value = load.nmfc;
  $("#tmsLoadHandlingUnits").value = load.handlingUnits || "";
  $("#tmsLoadPieces").value = load.pieces || "";
  $("#tmsLoadPallets").value = load.pallets || "";
  $("#tmsLoadWeight").value = load.weight || "";
  $("#tmsLoadLength").value = load.length || "";
  $("#tmsLoadWidth").value = load.width || "";
  $("#tmsLoadHeight").value = load.height || "";
  $("#tmsLoadHazmat").checked = load.hazmat;
  $("#tmsLoadStackable").checked = load.stackable;
  $("#tmsLoadAccessorials").value = accessorialsText(load.accessorials);
  $("#tmsLoadDeclaredValue").value = load.declaredValue || "";
  $("#tmsLoadCarrierCost").value = load.carrierCost || "";
  $("#tmsLoadClientCharge").value = load.clientCharge || "";
  $("#tmsLoadNotes").value = load.notes || "";
  $("#tmsLoadInternalNotes").value = load.internalNotes || "";
  $("#tmsLoadSubmitButton").textContent = "Update Load";
  setActiveView("tms-loads");
}

function editTmsCarrier(id) {
  const carrier = getTmsCarrier(id);
  if (!carrier) return;
  $("#tmsCarrierOriginal").value = carrier.id;
  $("#tmsCarrierName").value = carrier.name;
  $("#tmsCarrierScac").value = carrier.scac || "";
  $("#tmsCarrierStatus").value = carrier.status || "active";
  [...$("#tmsCarrierModes").querySelectorAll("input")].forEach((input) => {
    input.checked = carrier.modes.includes(input.value);
  });
  $("#tmsCarrierContact").value = carrier.contact || "";
  $("#tmsCarrierEmail").value = carrier.email || "";
  $("#tmsCarrierPhone").value = carrier.phone || "";
  $("#tmsCarrierAreas").value = carrier.serviceAreas || "";
  $("#tmsCarrierInsurance").value = carrier.insurance || "";
  $("#tmsCarrierNotes").value = carrier.notes || "";
  $("#tmsCarrierSubmitButton").textContent = "Update Carrier";
  setActiveView("tms-carriers");
}

function editTmsCarrierRate(id) {
  const rate = getTmsCarrierRate(id);
  if (!rate) return;
  $("#tmsCarrierRateOriginal").value = rate.id;
  $("#tmsCarrierRateCarrier").value = rate.carrierId;
  $("#tmsCarrierRateLane").value = rate.laneName;
  $("#tmsCarrierRateOrigin").value = rate.originRegion || "";
  $("#tmsCarrierRateDestination").value = rate.destinationRegion || "";
  $("#tmsCarrierRateMode").value = rate.mode;
  $("#tmsCarrierRateService").value = rate.serviceLevel || "";
  $("#tmsCarrierRateClass").value = rate.freightClass;
  $("#tmsCarrierRateMinWeight").value = rate.minWeight || "";
  $("#tmsCarrierRateMaxWeight").value = rate.maxWeight || "";
  $("#tmsCarrierRateMinimum").value = rate.minimumCharge || "";
  $("#tmsCarrierRateLinehaul").value = rate.linehaul || "";
  $("#tmsCarrierRateFuel").value = rate.fuelPct || "";
  $("#tmsCarrierRateAccessorial").value = rate.accessorialFlat || "";
  $("#tmsCarrierRateFrom").value = rate.effectiveFrom || "";
  $("#tmsCarrierRateTo").value = rate.effectiveTo || "";
  $("#tmsCarrierRateNotes").value = rate.notes || "";
  $("#tmsCarrierRateSubmitButton").textContent = "Update Carrier Rate";
  setActiveView("tms-carrier-rates");
}

function editTmsClientRate(id) {
  const rate = getTmsClientRate(id);
  if (!rate) return;
  $("#tmsClientRateOriginal").value = rate.id;
  $("#tmsClientRateCustomer").value = rate.customerId;
  $("#tmsClientRateName").value = rate.name;
  $("#tmsClientRateMode").value = rate.mode;
  $("#tmsClientRateCarrierRate").value = rate.rateId;
  $("#tmsClientRatePercent").value = rate.percentMarkup || "";
  $("#tmsClientRateFlat").value = rate.flatMarkup || "";
  $("#tmsClientRateFuelMarkup").value = rate.fuelMarkupPct || "";
  $("#tmsClientRateAccessorialMarkup").value = rate.accessorialMarkupPct || "";
  $("#tmsClientRateMinimumMargin").value = rate.minimumMargin || "";
  $("#tmsClientRateFrom").value = rate.effectiveFrom || "";
  $("#tmsClientRateTo").value = rate.effectiveTo || "";
  $("#tmsClientRateNotes").value = rate.notes || "";
  $("#tmsClientRateSubmitButton").textContent = "Update Client Rate";
  setActiveView("tms-client-rates");
}

function selectBolLoad(id) {
  if ($("#tmsBolLoadSelect")) $("#tmsBolLoadSelect").value = id;
  setActiveView("tms-documents");
  renderTmsDocuments();
}

function updateDocumentStatus(id, status) {
  const stage = state.documentStages.find((item) => item.id === id);
  if (!stage || !DOCUMENT_STATUSES[status]) return;
  stage.status = status;
  stage.updatedAt = todayISO();
  attachDocumentToOrder(stage);
  logAudit("document.status", `${stage.reference} ${getDocumentStatusLabel(status)}`);
  saveState();
  renderAll();
  showToast(`${stage.reference} marked ${getDocumentStatusLabel(status)}.`);
}

function editKitTemplate(id) {
  const template = state.kitTemplates.find((item) => item.id === id);
  if (!template) return;
  $("#kitTemplateOriginal").value = template.id;
  $("#kitTemplateWarehouse").value = template.warehouseId;
  $("#kitTemplateCustomer").value = template.customerId;
  $("#kitTemplateName").value = template.name;
  $("#kitTemplateLines").value = kitLinesText(template.lines);
  setActiveView("kitting");
}

function approveKitOrder(id) {
  const order = state.kitOrders.find((item) => item.id === id);
  if (!order || ["completed", "canceled"].includes(order.status)) return;
  const reservations = buildReservations(order);
  if (!reservations) return;
  order.status = "reserved";
  order.reservations = reservations;
  state.reservations = state.reservations.filter((reservation) => reservation.orderId !== order.id).concat(reservations);
  logAudit("kit.reserve", order.reference);
  saveState();
  renderAll();
  showToast(`Kit ${order.reference} approved and reserved.`);
}

function buildReservations(order) {
  const customer = getCustomer(order.customerId);
  const reservations = [];
  for (const line of order.lines) {
    let remaining = line.quantity;
    const balances = state.inventory
      .filter((row) => row.warehouseId === order.warehouseId && row.sku === line.sku && (row.units || 0) > 0)
      .filter((row) => !customer?.bayLinks.length || customer.bayLinks.includes(bayKey(row.warehouseId, row.bayCode)))
      .sort((a, b) => a.bayCode.localeCompare(b.bayCode));
    for (const balance of balances) {
      const alreadyReserved = state.reservations
        .filter((reservation) => reservation.warehouseId === order.warehouseId && reservation.sku === line.sku && reservation.bayCode === balance.bayCode && reservation.status === "reserved")
        .reduce((sum, reservation) => sum + reservation.quantity, 0);
      const available = Math.max(0, (balance.units || 0) - alreadyReserved);
      const quantity = Math.min(available, remaining);
      if (quantity > 0) {
        reservations.push({
          id: uid("RES"),
          orderId: order.id,
          customerId: order.customerId,
          warehouseId: order.warehouseId,
          sku: line.sku,
          bayCode: balance.bayCode,
          quantity,
          status: "reserved",
        });
        remaining -= quantity;
      }
      if (!remaining) break;
    }
    if (remaining) {
      showToast(`Not enough available stock to reserve ${line.sku}.`, "error");
      return null;
    }
  }
  return reservations;
}

function completeKitOrder(id) {
  const order = state.kitOrders.find((item) => item.id === id);
  if (!order || order.status !== "reserved") {
    showToast("Reserve the kit before completing it.", "error");
    return;
  }
  for (const reservation of order.reservations) {
    const balance = getBalance(reservation.sku, reservation.bayCode, reservation.warehouseId || order.warehouseId);
    if (balance) balance.units = Math.max(0, balance.units - reservation.quantity);
  }
  order.status = "completed";
  order.completedAt = todayISO();
  state.reservations = state.reservations.map((reservation) =>
    reservation.orderId === order.id ? { ...reservation, status: "consumed" } : reservation
  );
  logAudit("kit.complete", order.reference);
  saveState();
  renderAll();
  showToast(`Kit ${order.reference} completed.`);
}

function cancelKitOrder(id) {
  const order = state.kitOrders.find((item) => item.id === id);
  if (!order || order.status === "completed") return;
  order.status = "canceled";
  order.reservations = [];
  state.reservations = state.reservations.filter((reservation) => reservation.orderId !== order.id);
  logAudit("kit.cancel", order.reference);
  saveState();
  renderAll();
  showToast(`Kit ${order.reference} canceled.`);
}

async function sendShipmentToCarrier(shipmentId) {
  const index = state.shipments.findIndex((shipment) => shipment.id === shipmentId);
  if (index < 0) return;
  const shipment = normalizeShipment(state.shipments[index]);
  if (!shipment.carrier) {
    showToast("Select a carrier before sending this shipment.", "error");
    return;
  }

  const settings = normalizeCarrierSettings(state.carrierSettings);
  try {
    if (settings.mode === "backend") {
      if (!settings.backendUrl) {
        showToast("Add a carrier backend URL in Settings before using live mode.", "error");
        return;
      }
      const response = await fetch(`${settings.backendUrl.replace(/\/$/, "")}/shipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipment,
          carrierAccount: settings.accounts[shipment.carrier] || "",
        }),
      });
      if (!response.ok) throw new Error(`Carrier backend returned ${response.status}`);
      const result = await response.json();
      state.shipments[index] = normalizeShipment({
        ...shipment,
        carrierStatus: "Submitted",
        trackingNumber: result.trackingNumber || shipment.trackingNumber || generateTrackingNumber(shipment.carrier),
        carrierSubmittedAt: result.submittedAt || todayISO(),
        labelUrl: result.labelUrl || shipment.labelUrl || "",
        freightCharge: toNumber(result.freightCharge) || shipment.freightCharge,
        fuelCharge: toNumber(result.fuelCharge) || shipment.fuelCharge,
        accessorials: result.accessorials || shipment.accessorials,
      });
    } else {
      state.shipments[index] = normalizeShipment({
        ...shipment,
        carrierStatus: "Submitted",
        trackingNumber: shipment.trackingNumber || generateTrackingNumber(shipment.carrier),
        carrierSubmittedAt: todayISO(),
        routeEvents: [
          ...(shipment.routeEvents || []),
          {
            label: "Carrier Accepted",
            location: shipment.origin || "Main Warehouse",
            lat: getWarehouseLocation(shipment.warehouseId).lat,
            lng: getWarehouseLocation(shipment.warehouseId).lng,
            timestamp: todayISO(),
          },
        ],
      });
    }

    selectedInvoiceId = shipmentId;
    logAudit("carrier.send", shipment.reference || shipment.id);
    saveState();
    renderAll();
    showToast(`${getCarrierLabel(shipment.carrier, shipment.service)} shipment submitted.`);
  } catch (error) {
    state.shipments[index] = normalizeShipment({ ...shipment, carrierStatus: "Failed" });
    saveState();
    renderAll();
    showToast(error.message || "Carrier submission failed.", "error");
  }
}

function editSku(code) {
  const sku = getSku(code);
  if (!sku) return;
  $("#skuOriginal").value = sku.sku;
  $("#skuNumber").value = sku.sku;
  $("#skuName").value = sku.name;
  $("#skuLength").value = sku.length || "";
  $("#skuWidth").value = sku.width || "";
  $("#skuHeight").value = sku.height || "";
  $("#skuWeight").value = sku.weight || "";
  setSelectedOptions($("#skuWarehouseLinks"), sku.warehouseIds || []);
  $("#skuNotes").value = sku.notes || "";
  $("#skuSubmitButton").textContent = "Update SKU";
  setActiveView("skus");
  $("#skuNumber").focus();
}

function editWarehouse(id) {
  const warehouse = getWarehouse(id);
  if (!warehouse) return;
  $("#warehouseOriginal").value = warehouse.id;
  $("#warehouseCode").value = warehouse.code;
  $("#warehouseName").value = warehouse.name;
  $("#warehouseAddress").value = warehouse.address || "";
  $("#warehouseCity").value = warehouse.city || "";
  $("#warehouseState").value = warehouse.state || "";
  $("#warehousePostal").value = warehouse.postalCode || "";
  $("#warehouseLat").value = warehouse.lat || "";
  $("#warehouseLng").value = warehouse.lng || "";
  $("#warehouseStatus").value = warehouse.status || "active";
  $("#warehouseStorageRate").value = warehouse.storageRate || "";
  $("#warehouseHandlingRate").value = warehouse.handlingRate || "";
  $("#warehouseNotes").value = warehouse.notes || "";
  $("#warehouseSubmitButton").textContent = "Update Warehouse";
  setActiveView("warehouses");
  $("#warehouseCode").focus();
}

function editBay(key) {
  const parsed = parseBayKey(key);
  const bay = getBay(parsed.code, parsed.warehouseId);
  if (!bay) return;
  $("#bayOriginal").value = bay.code;
  $("#bayOriginalWarehouse").value = bay.warehouseId;
  $("#bayWarehouse").value = bay.warehouseId;
  $("#bayCode").value = bay.code;
  $("#bayZone").value = bay.zone;
  $("#bayMaxPallets").value = bay.maxPallets || "";
  $("#bayMaxWeight").value = bay.maxWeight || "";
  $("#bayLength").value = bay.length || "";
  $("#bayWidth").value = bay.width || "";
  $("#bayHeight").value = bay.height || "";
  $("#bayNotes").value = bay.notes || "";
  $("#baySubmitButton").textContent = "Update Bay";
  setActiveView("bays");
  $("#bayCode").focus();
}

function editLease(id) {
  const lease = state.customerLeases.find((item) => item.id === id);
  if (!lease) return;
  $("#leaseOriginal").value = lease.id;
  $("#leaseCustomer").value = lease.customerId;
  $("#leaseWarehouse").value = lease.warehouseId;
  renderSelects();
  $("#leaseCustomer").value = lease.customerId;
  $("#leaseWarehouse").value = lease.warehouseId;
  setSelectedOptions($("#leaseBayLinks"), lease.bayKeys);
  $("#leaseStartDate").value = lease.startDate || "";
  $("#leaseEndDate").value = lease.endDate || "";
  $("#leaseMonthlyRate").value = lease.monthlyRate || "";
  $("#leasePalletAllowance").value = lease.palletAllowance || "";
  $("#leaseSqftAllowance").value = lease.sqftAllowance || "";
  $("#leaseWeightAllowance").value = lease.weightAllowance || "";
  $("#leasePalletOverageRate").value = lease.palletOverageRate || "";
  $("#leaseSqftOverageRate").value = lease.sqftOverageRate || "";
  $("#leaseWeightOverageRate").value = lease.weightOverageRate || "";
  $("#leaseStatus").value = lease.status || "active";
  $("#leaseNotes").value = lease.notes || "";
  $("#leaseSubmitButton").textContent = "Update Lease";
  setActiveView("customers");
}

function deleteSku(code) {
  const linked =
    state.inventory.some((row) => row.sku === code && ((row.units || 0) > 0 || (row.pallets || 0) > 0)) ||
    state.receipts.some((row) => row.sku === code) ||
    state.shipments.some((row) => row.sku === code);
  if (linked) {
    showToast("SKUs with inventory or activity cannot be deleted.", "error");
    return;
  }
  state.skus = state.skus.filter((item) => item.sku !== code);
  state.customers.forEach((customer) => {
    customer.skuLinks = customer.skuLinks.filter((link) => link !== code);
  });
  logAudit("sku.delete", code);
  saveState();
  renderAll();
  showToast(`SKU ${code} deleted.`);
}

function deleteBay(key) {
  const parsed = parseBayKey(key);
  const code = parsed.code;
  const warehouseId = parsed.warehouseId;
  const linked =
    state.inventory.some((row) => row.warehouseId === warehouseId && row.bayCode === code && ((row.units || 0) > 0 || (row.pallets || 0) > 0)) ||
    state.receipts.some((row) => row.warehouseId === warehouseId && row.bayCode === code) ||
    state.shipments.some((row) => row.warehouseId === warehouseId && row.bayCode === code);
  if (linked) {
    showToast("Bays with inventory or activity cannot be deleted.", "error");
    return;
  }
  state.bays = state.bays.filter((bay) => !(bay.warehouseId === warehouseId && bay.code === code));
  state.customers.forEach((customer) => {
    customer.bayLinks = customer.bayLinks.filter((link) => link !== bayKey(warehouseId, code));
  });
  state.customerLeases.forEach((lease) => {
    lease.bayKeys = lease.bayKeys.filter((link) => link !== bayKey(warehouseId, code));
  });
  logAudit("bay.delete", `${getWarehouse(warehouseId)?.code || warehouseId}/${code}`);
  saveState();
  renderAll();
  showToast(`Bay ${code} deleted.`);
}

function deleteWarehouse(id) {
  if (state.warehouses.length <= 1) {
    showToast("At least one warehouse is required.", "error");
    return;
  }
  const linked =
    state.bays.some((bay) => bay.warehouseId === id) ||
    state.inventory.some((row) => row.warehouseId === id && ((row.units || 0) > 0 || (row.pallets || 0) > 0)) ||
    state.receipts.some((row) => row.warehouseId === id) ||
    state.shipments.some((row) => row.warehouseId === id) ||
    state.customerLeases.some((lease) => lease.warehouseId === id);
  if (linked) {
    showToast("Warehouses with bays, inventory, leases, or activity cannot be deleted.", "error");
    return;
  }
  const warehouse = getWarehouse(id);
  state.warehouses = state.warehouses.filter((item) => item.id !== id);
  state.skus.forEach((sku) => {
    sku.warehouseIds = (sku.warehouseIds || []).filter((warehouseId) => warehouseId !== id);
  });
  state.customers.forEach((customer) => {
    customer.warehouseIds = (customer.warehouseIds || []).filter((warehouseId) => warehouseId !== id);
  });
  if (state.selectedWarehouseId === id) state.selectedWarehouseId = "";
  logAudit("warehouse.delete", warehouse?.code || id);
  saveState();
  renderAll();
  showToast("Warehouse deleted.");
}

function exportState() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bayline-wms-${todayISO()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Export downloaded.");
}

function exportTmsReport() {
  const loads = getFilteredTmsLoads();
  const html = `
    <html>
      <head><meta charset="utf-8" /></head>
      <body>
        <table>
          <thead>
            <tr><th>Load</th><th>Customer</th><th>Carrier</th><th>Mode</th><th>Status</th><th>Lane</th><th>Class</th><th>Weight</th><th>Carrier Cost</th><th>Client Charge</th><th>Margin</th></tr>
          </thead>
          <tbody>
            ${loads
              .map((load) => {
                const pricing = calculateTmsLoadPricing(load);
                return `<tr><td>${escapeHtml(load.reference)}</td><td>${escapeHtml(getCustomer(load.customerId)?.name || "")}</td><td>${escapeHtml(getTmsCarrier(load.carrierId)?.name || "")}</td><td>${escapeHtml(TMS_MODES[load.mode] || load.mode)}</td><td>${escapeHtml(TMS_LOAD_STATUSES[load.status] || load.status)}</td><td>${escapeHtml(load.origin || "")} to ${escapeHtml(load.destination || "")}</td><td>${escapeHtml(load.freightClass)}</td><td>${load.weight}</td><td>${pricing.carrierCost}</td><td>${pricing.clientCharge}</td><td>${pricing.margin}</td></tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bayline-tms-report-${todayISO()}.xls`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("TMS report exported.");
}

function financeExportAllowed() {
  if (state.currentUserRole !== "admin") {
    showToast("Admin role required for financial exports.", "error");
    return false;
  }
  return true;
}

function financeExportRows() {
  return getFinancialRows();
}

function exportFinanceExcel() {
  if (!financeExportAllowed()) return;
  const rows = financeExportRows();
  const totals = rows.reduce(
    (summary, row) => {
      summary.shipmentRevenue += row.shipmentRevenue;
      summary.carrierCosts += row.carrierCosts;
      summary.accessorials += row.accessorials;
      summary.kitCharges += row.kitCharges;
      summary.pickCharges += row.pickCharges;
      summary.laborCharges += row.laborCharges;
      summary.leaseCharges += row.leaseCharges;
      summary.openAr += row.openAr;
      summary.margin += row.margin;
      return summary;
    },
    { shipmentRevenue: 0, carrierCosts: 0, accessorials: 0, kitCharges: 0, pickCharges: 0, laborCharges: 0, leaseCharges: 0, openAr: 0, margin: 0 }
  );
  const html = `
    <html>
      <head><meta charset="utf-8" /></head>
      <body>
        <h1>BayLine WMS Admin Finance Export</h1>
        <p>Generated ${todayISO()}</p>
        <table border="1">
          <tr><th>Shipment Revenue</th><th>Carrier Costs</th><th>Accessorials</th><th>Kit Charges</th><th>Pick Charges</th><th>Labor Charges</th><th>Lease Charges</th><th>Open AR</th><th>Margin</th></tr>
          <tr><td>${totals.shipmentRevenue}</td><td>${totals.carrierCosts}</td><td>${totals.accessorials}</td><td>${totals.kitCharges}</td><td>${totals.pickCharges}</td><td>${totals.laborCharges}</td><td>${totals.leaseCharges}</td><td>${totals.openAr}</td><td>${totals.margin}</td></tr>
        </table>
        <h2>Customer Warehouse Detail</h2>
        <table border="1">
          <tr><th>Customer</th><th>Warehouse</th><th>Shipments</th><th>Shipment Revenue</th><th>Carrier Costs</th><th>Accessorials</th><th>Kit Charges</th><th>Pick Charges</th><th>Labor Charges</th><th>Lease Charges</th><th>Open AR</th><th>Margin</th></tr>
          ${rows
            .map(
              (row) => `<tr><td>${escapeHtml(row.customer.name)}</td><td>${escapeHtml(formatWarehouse(row.warehouseId))}</td><td>${row.shipments}</td><td>${row.shipmentRevenue}</td><td>${row.carrierCosts}</td><td>${row.accessorials}</td><td>${row.kitCharges}</td><td>${row.pickCharges}</td><td>${row.laborCharges}</td><td>${row.leaseCharges}</td><td>${row.openAr}</td><td>${row.margin}</td></tr>`
            )
            .join("")}
        </table>
        <h2>Labor Entries</h2>
        <table border="1">
          <tr><th>User</th><th>Task</th><th>Order</th><th>Hours</th><th>Billable</th><th>Rate</th><th>Cost</th></tr>
          ${state.laborEntries
            .map((entry) => normalizeLaborEntry(entry))
            .map((entry) => `<tr><td>${escapeHtml(formatUser(entry.userId))}</td><td>${escapeHtml(LABOR_TASK_TYPES[entry.taskType] || entry.taskType)}</td><td>${escapeHtml(getOrderReference(entry.orderType, entry.orderId))}</td><td>${entry.hours}</td><td>${entry.billable ? "Yes" : "No"}</td><td>${entry.rate}</td><td>${entry.billable ? entry.hours * entry.rate : 0}</td></tr>`)
            .join("")}
        </table>
        <h2>Document Staging</h2>
        <table border="1">
          <tr><th>Load</th><th>Customer</th><th>Warehouse</th><th>Status</th><th>Required</th><th>Received</th><th>Assigned</th></tr>
          ${state.documentStages
            .map((stage) => normalizeDocumentStage(stage))
            .map((stage) => `<tr><td>${escapeHtml(stage.reference)}</td><td>${escapeHtml(getCustomer(stage.customerId)?.name || "")}</td><td>${escapeHtml(formatWarehouse(stage.warehouseId))}</td><td>${escapeHtml(getDocumentStatusLabel(stage.status))}</td><td>${escapeHtml(stage.requiredDocs.join(", "))}</td><td>${escapeHtml(stage.receivedDocs.join(", "))}</td><td>${escapeHtml(formatUser(stage.assignedUserId))}</td></tr>`)
            .join("")}
        </table>
        <h2>Lease Charges</h2>
        <table border="1">
          <tr><th>Customer</th><th>Warehouse</th><th>Bays</th><th>Base Monthly</th><th>Overage</th><th>Total</th><th>Status</th></tr>
          ${state.customerLeases
            .map((lease) => {
              const charge = calculateLeaseCharge(lease);
              return `<tr><td>${escapeHtml(getCustomer(lease.customerId)?.name || "")}</td><td>${escapeHtml(formatWarehouse(lease.warehouseId))}</td><td>${escapeHtml(lease.bayKeys.map(formatBayKey).join(", "))}</td><td>${lease.monthlyRate}</td><td>${charge.overageTotal}</td><td>${charge.total}</td><td>${escapeHtml(lease.status)}</td></tr>`;
            })
            .join("")}
        </table>
      </body>
    </html>
  `;
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bayline-finance-${todayISO()}.xls`;
  link.click();
  URL.revokeObjectURL(url);
  state.financialExports.push({ id: uid("FIN-EXPORT"), date: todayISO(), type: "excel", rows: rows.length });
  logAudit("finance.export.excel", `${rows.length} rows`);
  saveState("Finance exported");
  showToast("Finance Excel export downloaded.");
}

function exportFinancePdfPacket() {
  if (!financeExportAllowed()) return;
  const rows = financeExportRows();
  const packet = window.open("", "_blank");
  if (!packet) {
    showToast("Allow popups to open the PDF packet.", "error");
    return;
  }
  packet.document.write(`
    <html>
      <head>
        <title>BayLine Finance Packet</title>
        <style>
          body { font-family: Arial, sans-serif; color: #18212d; margin: 32px; }
          h1, h2 { margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin: 18px 0 28px; }
          th, td { border: 1px solid #d8dee6; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #f4f6f8; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <h1>Admin Financial Packet</h1>
        <p>Generated ${todayISO()}</p>
        <h2>Operational P&L</h2>
        <table>
          <tr><th>Customer</th><th>Warehouse</th><th>Shipment Revenue</th><th>Carrier Costs</th><th>Kit Charges</th><th>Pick Charges</th><th>Labor Charges</th><th>Lease Charges</th><th>Open AR</th><th>Margin</th></tr>
          ${rows
            .map(
              (row) => `<tr><td>${escapeHtml(row.customer.name)}</td><td>${escapeHtml(formatWarehouse(row.warehouseId))}</td><td>${formatCurrency(row.shipmentRevenue)}</td><td>${formatCurrency(row.carrierCosts)}</td><td>${formatCurrency(row.kitCharges)}</td><td>${formatCurrency(row.pickCharges)}</td><td>${formatCurrency(row.laborCharges)}</td><td>${formatCurrency(row.leaseCharges)}</td><td>${formatCurrency(row.openAr)}</td><td>${formatCurrency(row.margin)}</td></tr>`
            )
            .join("")}
        </table>
        <h2>Labor and Document Snapshot</h2>
        <table>
          <tr><th>Labor Entries</th><th>Total Hours</th><th>Staged Loads</th><th>Missing Docs</th></tr>
          <tr><td>${state.laborEntries.length}</td><td>${formatNumber(getLaborSummary(state.laborEntries).hours)}</td><td>${state.documentStages.length}</td><td>${state.documentStages.filter((stage) => stage.status === "missing_docs").length}</td></tr>
        </table>
        <h2>Lease Detail</h2>
        <table>
          <tr><th>Customer</th><th>Warehouse</th><th>Bays</th><th>Base Monthly</th><th>Overage</th><th>Total</th></tr>
          ${state.customerLeases
            .map((lease) => {
              const charge = calculateLeaseCharge(lease);
              return `<tr><td>${escapeHtml(getCustomer(lease.customerId)?.name || "")}</td><td>${escapeHtml(formatWarehouse(lease.warehouseId))}</td><td>${escapeHtml(lease.bayKeys.map(formatBayKey).join(", "))}</td><td>${formatCurrency(lease.monthlyRate)}</td><td>${formatCurrency(charge.overageTotal)}</td><td>${formatCurrency(charge.total)}</td></tr>`;
            })
            .join("")}
        </table>
      </body>
    </html>
  `);
  packet.document.close();
  packet.focus();
  packet.print();
  state.financialExports.push({ id: uid("FIN-EXPORT"), date: todayISO(), type: "pdf", rows: rows.length });
  logAudit("finance.export.pdf", `${rows.length} rows`);
  saveState("Finance packet opened");
  showToast("PDF packet opened for printing.");
}

function importState(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const imported = JSON.parse(String(reader.result || ""));
      const nextState = normalizeState(imported);
      state = nextState;
      activeCustomReport = null;
      selectedInvoiceId = null;
      saveState("Imported");
      renderAll();
      showToast("Import complete.");
    } catch {
      showToast("Import file could not be read.", "error");
    }
  });
  reader.readAsText(file);
}

function bindEvents() {
  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => setActiveView(button.dataset.viewTarget));
  });
  $$(".arm-button").forEach((button) => {
    button.addEventListener("click", () => setActiveArm(button.dataset.armTarget));
  });

  $$("[data-focus-form]").forEach((button) => {
    button.addEventListener("click", () => {
      const form = $(`#${button.dataset.focusForm}`);
      form?.querySelector("input, select, textarea")?.focus();
    });
  });

  $("#warehouseForm").addEventListener("submit", handleWarehouseSubmit);
  $("#skuForm").addEventListener("submit", handleSkuSubmit);
  $("#bayForm").addEventListener("submit", handleBaySubmit);
  $("#receiveForm").addEventListener("submit", handleReceive);
  $("#outboundForm").addEventListener("submit", handleOutbound);
  $("#customerForm").addEventListener("submit", handleCustomerSubmit);
  $("#userForm").addEventListener("submit", handleUserSubmit);
  $("#laborForm").addEventListener("submit", handleLaborSubmit);
  $("#documentStageForm").addEventListener("submit", handleDocumentStageSubmit);
  $("#leaseForm").addEventListener("submit", handleLeaseSubmit);
  $("#pickRequestForm").addEventListener("submit", handlePickRequestSubmit);
  $("#kitTemplateForm").addEventListener("submit", handleKitTemplateSubmit);
  $("#kitOrderForm").addEventListener("submit", handleKitOrderSubmit);
  $("#tmsOrderForm").addEventListener("submit", handleTmsOrderSubmit);
  $("#tmsLoadForm").addEventListener("submit", handleTmsLoadSubmit);
  $("#tmsCarrierForm").addEventListener("submit", handleTmsCarrierSubmit);
  $("#tmsCarrierRateForm").addEventListener("submit", handleTmsCarrierRateSubmit);
  $("#tmsClientRateForm").addEventListener("submit", handleTmsClientRateSubmit);
  $("#customReportForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const report = getReportDefinitionFromForm();
    state.customReports.push(report);
    activeCustomReport = report;
    saveState();
    renderAll();
    showToast(`Custom report ${report.name} saved.`);
  });
  $("#carrierSettingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.currentUserRole = $("#currentUserRole").value;
    state.carrierSettings = normalizeCarrierSettings({
      mode: $("#carrierMode").value,
      backendUrl: cleanText($("#carrierBackendUrl").value),
      accounts: {
        ups: cleanText($("#upsAccount").value),
        fedex: cleanText($("#fedexAccount").value),
        usps: cleanText($("#uspsAccount").value),
      },
    });
    saveState();
    renderAll();
    showToast("Carrier settings saved.");
  });
  $("#appearanceForm").addEventListener("submit", (event) => {
    event.preventDefault();
    updateAppearanceFromForm();
    saveState();
    showToast("Appearance saved.");
  });
  $("#pickSettingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.currentUserRole !== "admin") {
      showToast("Admin role required for pick controls.", "error");
      return;
    }
    state.pickSettings = normalizePickSettings({
      defaultFee: $("#pickSettingDefaultFee").value,
      laborRate: $("#pickSettingLaborRate").value,
      rushMultiplier: $("#pickSettingRushMultiplier").value,
      requireApproval: $("#pickSettingRequireApproval").checked,
      showExceptionsToCustomers: $("#pickSettingShowExceptions").checked,
    });
    logAudit("pick.settings.save", "Pick controls updated");
    saveState();
    renderAll();
    showToast("Pick controls saved.");
  });

  $("#warehouseResetButton").addEventListener("click", resetWarehouseForm);
  $("#skuResetButton").addEventListener("click", resetSkuForm);
  $("#bayResetButton").addEventListener("click", resetBayForm);
  $("#customerResetButton").addEventListener("click", resetCustomerForm);
  $("#userResetButton").addEventListener("click", resetUserForm);
  $("#leaseResetButton").addEventListener("click", resetLeaseForm);
  $("#tmsLoadResetButton").addEventListener("click", resetTmsLoadForm);
  $("#tmsCarrierResetButton").addEventListener("click", resetTmsCarrierForm);
  $("#tmsCarrierRateResetButton").addEventListener("click", resetTmsCarrierRateForm);
  $("#tmsClientRateResetButton").addEventListener("click", resetTmsClientRateForm);
  $("#rateEstimateButton").addEventListener("click", () => {
    const rate = estimateOutboundRate();
    $("#outboundFreightCharge").value = rate.freight || "";
    $("#outboundFuelCharge").value = rate.fuel || "";
    $("#rateEstimatePill").textContent = `${formatCurrency(rate.total)} estimated`;
  });
  $("#runCustomReportButton").addEventListener("click", () => {
    activeCustomReport = getReportDefinitionFromForm();
    renderCustomReportOutput(activeCustomReport);
    showToast(`Previewing ${activeCustomReport.name}.`);
  });
  $("#customReportSource").addEventListener("input", renderCustomFieldOptions);
  ["#kitOrderCustomer", "#kitOrderWarehouse"].forEach((selector) => $(selector).addEventListener("input", renderKitTemplateOptions));
  $("#kitOrderTemplate").addEventListener("input", () => {
    const template = state.kitTemplates.find((item) => item.id === $("#kitOrderTemplate").value);
    if (template) $("#kitOrderLines").value = kitLinesText(template.lines);
  });
  $("#inboundRouteSelect").addEventListener("input", renderSelectedRoutes);
  $("#outboundRouteSelect").addEventListener("input", renderSelectedRoutes);
  $("#currentUserRole").addEventListener("input", () => {
    state.currentUserRole = $("#currentUserRole").value;
    saveState();
    renderAdminFinance();
  });
  $("#outboundCarrier").addEventListener("input", () => {
    setServiceOptions();
    $("#rateEstimatePill").textContent = "No rate estimate";
  });
  $("#topWarehouseFilter").addEventListener("input", () => {
    state.selectedWarehouseId = $("#topWarehouseFilter").value;
    saveState();
    renderAll();
  });
  ["#receiveWarehouse", "#outboundWarehouse", "#leaseWarehouse", "#pickWarehouse"].forEach((selector) =>
    $(selector).addEventListener("input", () => {
      renderSelects();
      renderAvailableStock();
    })
  );
  ["#outboundService", "#outboundUnits", "#outboundMiles", "#outboundPackageCount", "#outboundDeclaredValue"].forEach(
    (selector) => $(selector).addEventListener("input", () => {
      $("#rateEstimatePill").textContent = "No rate estimate";
    })
  );
  ["#appearanceAppName", "#appearanceInitials", "#appearancePrimary", "#appearanceNav", "#appearanceAccent", "#appearancePage", "#appearanceDensity"].forEach(
    (selector) => $(selector).addEventListener("input", () => {
      updateAppearanceFromForm();
      saveState();
    })
  );
  $("#resetAppearanceButton").addEventListener("click", () => {
    state.appearance = defaultAppearance();
    renderSettings();
    saveState();
    showToast("Appearance reset.");
  });
  $("#printInvoiceButton").addEventListener("click", () => {
    if (!selectedInvoiceId) {
      showToast("Select a shipment invoice first.", "error");
      return;
    }
    document.body.classList.add("print-invoice");
    window.print();
    setTimeout(() => document.body.classList.remove("print-invoice"), 300);
  });
  $("#printPickTicketButton").addEventListener("click", () => {
    if (!selectedPickRequestId) {
      showToast("Select a pick request first.", "error");
      return;
    }
    document.body.classList.add("print-pick-ticket");
    window.print();
    setTimeout(() => document.body.classList.remove("print-pick-ticket"), 300);
  });

  $("#warehouseSearch").addEventListener("input", renderWarehouses);
  $("#skuSearch").addEventListener("input", renderSkuTable);
  $("#baySearch").addEventListener("input", renderBayTable);
  ["#globalSearch", "#globalSearchType"].forEach((selector) => $(selector).addEventListener("input", renderGlobalSearch));
  ["#inventorySearch", "#inventoryWarehouseFilter", "#inventorySkuFilter", "#inventoryBayFilter"].forEach((selector) =>
    $(selector).addEventListener("input", renderInventory)
  );
  ["#reportFrom", "#reportTo", "#reportSku", "#reportWarehouse", "#reportBay"].forEach((selector) =>
    $(selector).addEventListener("input", renderReports)
  );
  ["#adminWarehouseFilter", "#adminCustomerFilter", "#adminFrom", "#adminTo"].forEach((selector) =>
    $(selector).addEventListener("input", renderAdminFinance)
  );
  $$(".admin-tab").forEach((button) =>
    button.addEventListener("click", () => {
      activeAdminTab = button.dataset.adminTab || "finance";
      renderAdminFinance();
    })
  );
  ["#pickQueueStatus", "#pickQueueCustomer", "#pickQueueWarehouse", "#pickPortalCustomer", "#pickPortalWarehouse"].forEach((selector) =>
    $(selector).addEventListener("input", renderPicks)
  );
  ["#laborFilterUser", "#laborFilterTask"].forEach((selector) => $(selector).addEventListener("input", renderUsersAndLabor));
  ["#documentFilterStatus", "#documentFilterWarehouse"].forEach((selector) => $(selector).addEventListener("input", renderDocuments));
  ["#laborOrderType", "#documentOrderType"].forEach((selector) => $(selector).addEventListener("input", renderOrderSelects));
  ["#tmsLoadFilterCustomer", "#tmsLoadFilterStatus"].forEach((selector) => $(selector).addEventListener("input", renderTmsLoads));
  ["#tmsReportCustomer", "#tmsReportMode", "#tmsReportStatus"].forEach((selector) => $(selector).addEventListener("input", renderTmsReports));
  ["#portalCustomerSelect", "#portalWarehouseSelect"].forEach((selector) => $(selector).addEventListener("input", renderCustomerPortal));
  $("#tmsBolLoadSelect").addEventListener("input", renderTmsDocuments);
  ["#tmsLoadWeight", "#tmsLoadCarrierRate", "#tmsLoadClientRate", "#tmsLoadAccessorials"].forEach((selector) =>
    $(selector).addEventListener("input", () => {
      const load = buildTmsLoadFromForm();
      $("#tmsLoadCarrierCost").placeholder = formatCurrency(calculateTmsLoadPricing(load).carrierCost);
      $("#tmsLoadClientCharge").placeholder = formatCurrency(calculateTmsLoadPricing(load).clientCharge);
    })
  );
  ["#outboundSku", "#outboundBay", "#outboundWarehouse"].forEach((selector) =>
    $(selector).addEventListener("input", renderAvailableStock)
  );
  $("#exportFinanceExcelButton").addEventListener("click", exportFinanceExcel);
  $("#exportFinancePdfButton").addEventListener("click", exportFinancePdfPacket);
  $("#exportTmsReportButton").addEventListener("click", exportTmsReport);
  $("#printBolButton").addEventListener("click", () => {
    document.body.classList.add("print-bol");
    window.print();
    setTimeout(() => document.body.classList.remove("print-bol"), 300);
  });
  $("#printShipmentSummaryButton").addEventListener("click", () => {
    document.body.classList.add("print-bol");
    window.print();
    setTimeout(() => document.body.classList.remove("print-bol"), 300);
  });

  document.addEventListener("click", (event) => {
    const editWarehouseButton = event.target.closest("[data-edit-warehouse]");
    const deleteWarehouseButton = event.target.closest("[data-delete-warehouse]");
    const editSkuButton = event.target.closest("[data-edit-sku]");
    const deleteSkuButton = event.target.closest("[data-delete-sku]");
    const editBayButton = event.target.closest("[data-edit-bay]");
    const deleteBayButton = event.target.closest("[data-delete-bay]");
    const invoiceButton = event.target.closest("[data-invoice-shipment]");
    const sendCarrierButton = event.target.closest("[data-send-carrier]");
    const runReportButton = event.target.closest("[data-run-report]");
    const deleteReportButton = event.target.closest("[data-delete-report]");
    const editCustomerButton = event.target.closest("[data-edit-customer]");
    const deleteCustomerButton = event.target.closest("[data-delete-customer]");
    const editUserButton = event.target.closest("[data-edit-user]");
    const deleteUserButton = event.target.closest("[data-delete-user]");
    const documentStatusButton = event.target.closest("[data-document-status]");
    const editLeaseButton = event.target.closest("[data-edit-lease]");
    const deleteLeaseButton = event.target.closest("[data-delete-lease]");
    const editKitTemplateButton = event.target.closest("[data-edit-kit-template]");
    const deleteKitTemplateButton = event.target.closest("[data-delete-kit-template]");
    const viewPickButton = event.target.closest("[data-view-pick]");
    const approvePickButton = event.target.closest("[data-approve-pick]");
    const startPickButton = event.target.closest("[data-start-pick]");
    const exceptionPickButton = event.target.closest("[data-exception-pick]");
    const packPickButton = event.target.closest("[data-pack-pick]");
    const shipPickButton = event.target.closest("[data-ship-pick]");
    const closePickButton = event.target.closest("[data-close-pick]");
    const cancelPickButton = event.target.closest("[data-cancel-pick]");
    const approveKitButton = event.target.closest("[data-approve-kit]");
    const completeKitButton = event.target.closest("[data-complete-kit]");
    const cancelKitButton = event.target.closest("[data-cancel-kit]");
    const editTmsLoadButton = event.target.closest("[data-edit-tms-load]");
    const deleteTmsLoadButton = event.target.closest("[data-delete-tms-load]");
    const bolLoadButton = event.target.closest("[data-bol-load]");
    const editTmsCarrierButton = event.target.closest("[data-edit-tms-carrier]");
    const deleteTmsCarrierButton = event.target.closest("[data-delete-tms-carrier]");
    const editTmsRateButton = event.target.closest("[data-edit-tms-rate]");
    const deleteTmsRateButton = event.target.closest("[data-delete-tms-rate]");
    const editTmsClientRateButton = event.target.closest("[data-edit-tms-client-rate]");
    const deleteTmsClientRateButton = event.target.closest("[data-delete-tms-client-rate]");

    if (editWarehouseButton) editWarehouse(editWarehouseButton.dataset.editWarehouse);
    if (deleteWarehouseButton) deleteWarehouse(deleteWarehouseButton.dataset.deleteWarehouse);
    if (editSkuButton) editSku(editSkuButton.dataset.editSku);
    if (deleteSkuButton) deleteSku(deleteSkuButton.dataset.deleteSku);
    if (editBayButton) editBay(editBayButton.dataset.editBay);
    if (deleteBayButton) deleteBay(deleteBayButton.dataset.deleteBay);
    if (invoiceButton) {
      selectedInvoiceId = invoiceButton.dataset.invoiceShipment;
      renderInvoicePreview();
    }
    if (sendCarrierButton) {
      sendShipmentToCarrier(sendCarrierButton.dataset.sendCarrier);
    }
    if (editCustomerButton) editCustomer(editCustomerButton.dataset.editCustomer);
    if (deleteCustomerButton) {
      const id = deleteCustomerButton.dataset.deleteCustomer;
      if (
        state.kitOrders.some((order) => order.customerId === id) ||
        state.shipments.some((shipment) => shipment.customerId === id) ||
        state.customerLeases.some((lease) => lease.customerId === id)
      ) {
        showToast("Customers with activity cannot be deleted.", "error");
      } else {
        state.customers = state.customers.filter((customer) => customer.id !== id);
        saveState();
        renderAll();
      }
    }
    if (editLeaseButton) editLease(editLeaseButton.dataset.editLease);
    if (editUserButton) editUser(editUserButton.dataset.editUser);
    if (deleteUserButton) deleteUser(deleteUserButton.dataset.deleteUser);
    if (documentStatusButton) updateDocumentStatus(documentStatusButton.dataset.documentStatus, documentStatusButton.dataset.nextStatus);
    if (deleteLeaseButton) {
      const id = deleteLeaseButton.dataset.deleteLease;
      const lease = state.customerLeases.find((item) => item.id === id);
      state.customerLeases = state.customerLeases.filter((item) => item.id !== id);
      logAudit("lease.delete", lease?.id || id);
      saveState();
      renderAll();
      showToast("Lease deleted.");
    }
    if (viewPickButton) {
      selectedPickRequestId = viewPickButton.dataset.viewPick;
      renderPickTicketPreview(selectedPickRequestId);
    }
    if (approvePickButton) reservePickRequest(approvePickButton.dataset.approvePick);
    if (startPickButton) startPickRequest(startPickButton.dataset.startPick);
    if (exceptionPickButton) reportPickException(exceptionPickButton.dataset.exceptionPick);
    if (packPickButton) packPickRequest(packPickButton.dataset.packPick);
    if (shipPickButton) shipPickRequest(shipPickButton.dataset.shipPick);
    if (closePickButton) closePickRequest(closePickButton.dataset.closePick);
    if (cancelPickButton) cancelPickRequest(cancelPickButton.dataset.cancelPick);
    if (editKitTemplateButton) editKitTemplate(editKitTemplateButton.dataset.editKitTemplate);
    if (deleteKitTemplateButton) {
      state.kitTemplates = state.kitTemplates.filter((template) => template.id !== deleteKitTemplateButton.dataset.deleteKitTemplate);
      saveState();
      renderAll();
    }
    if (approveKitButton) approveKitOrder(approveKitButton.dataset.approveKit);
    if (completeKitButton) completeKitOrder(completeKitButton.dataset.completeKit);
    if (cancelKitButton) cancelKitOrder(cancelKitButton.dataset.cancelKit);
    if (editTmsLoadButton) editTmsLoad(editTmsLoadButton.dataset.editTmsLoad);
    if (bolLoadButton) selectBolLoad(bolLoadButton.dataset.bolLoad);
    if (deleteTmsLoadButton) {
      const id = deleteTmsLoadButton.dataset.deleteTmsLoad;
      const load = state.tmsLoads.find((item) => item.id === id);
      state.tmsLoads = state.tmsLoads.filter((item) => item.id !== id);
      logAudit("tms.load.delete", load?.reference || id);
      saveState();
      renderAll();
      showToast("TMS load deleted.");
    }
    if (editTmsCarrierButton) editTmsCarrier(editTmsCarrierButton.dataset.editTmsCarrier);
    if (deleteTmsCarrierButton) {
      const id = deleteTmsCarrierButton.dataset.deleteTmsCarrier;
      if (state.tmsLoads.some((load) => load.carrierId === id) || state.tmsCarrierRates.some((rate) => rate.carrierId === id)) {
        showToast("Carriers with loads or rates cannot be deleted.", "error");
      } else {
        state.tmsCarriers = state.tmsCarriers.filter((item) => item.id !== id);
        saveState();
        renderAll();
        showToast("Carrier deleted.");
      }
    }
    if (editTmsRateButton) editTmsCarrierRate(editTmsRateButton.dataset.editTmsRate);
    if (deleteTmsRateButton) {
      const id = deleteTmsRateButton.dataset.deleteTmsRate;
      state.tmsCarrierRates = state.tmsCarrierRates.filter((item) => item.id !== id);
      state.tmsClientRates.forEach((rate) => {
        if (rate.rateId === id) rate.rateId = "";
      });
      saveState();
      renderAll();
      showToast("Carrier rate deleted.");
    }
    if (editTmsClientRateButton) editTmsClientRate(editTmsClientRateButton.dataset.editTmsClientRate);
    if (deleteTmsClientRateButton) {
      const id = deleteTmsClientRateButton.dataset.deleteTmsClientRate;
      state.tmsClientRates = state.tmsClientRates.filter((item) => item.id !== id);
      saveState();
      renderAll();
      showToast("Client rate deleted.");
    }
    if (runReportButton) {
      activeCustomReport = state.customReports.find((report) => report.id === runReportButton.dataset.runReport) || null;
      renderCustomReportOutput(activeCustomReport);
    }
    if (deleteReportButton) {
      const id = deleteReportButton.dataset.deleteReport;
      state.customReports = state.customReports.filter((report) => report.id !== id);
      if (activeCustomReport?.id === id) activeCustomReport = null;
      saveState();
      renderAll();
      showToast("Custom report deleted.");
    }
  });

  $("#loadDemoButton").addEventListener("click", () => {
    if (state.skus.length || state.bays.length || state.receipts.length || state.shipments.length) {
      const ok = confirm("Replace current local WMS data with demo data?");
      if (!ok) return;
    }
    state = normalizeState(demoState());
    activeCustomReport = state.customReports[0] || null;
    selectedInvoiceId = state.shipments[0]?.id || null;
    selectedPickRequestId = state.pickRequests[0]?.id || null;
    saveState("Demo loaded");
    renderAll();
    showToast("Demo data loaded.");
  });

  $("#clearButton").addEventListener("click", () => {
    const ok = confirm("Clear all local WMS data?");
    if (!ok) return;
    state = normalizeState(emptyState());
    activeCustomReport = null;
    selectedInvoiceId = null;
    selectedPickRequestId = null;
    saveState("Cleared");
    resetSkuForm();
    resetWarehouseForm();
    resetBayForm();
    resetOutboundForm();
    resetCustomerForm();
    resetUserForm();
    resetLeaseForm();
    renderAll();
    showToast("Local WMS data cleared.");
  });

  $("#exportButton").addEventListener("click", exportState);
  $("#importFile").addEventListener("change", (event) => {
    importState(event.target.files[0]);
    event.target.value = "";
  });
}

function init() {
  $("#receiveDate").value = todayISO();
  $("#outboundDate").value = todayISO();
  $("#pickRequestedShipDate").value = todayISO();
  $("#tmsLoadShipDate").value = todayISO();
  $("#tmsCarrierRateFrom").value = todayISO();
  $("#tmsClientRateFrom").value = todayISO();
  if ($("#laborRate")) $("#laborRate").value = state.pickSettings?.laborRate || "";
  bindEvents();
  setActiveView(activeView);
  renderAll();
}

init();
