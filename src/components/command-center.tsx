"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  closeLoadAction,
  createBayAction,
  createCarrierAction,
  createCarrierRateAction,
  createClientRateAction,
  createCustomerAction,
  createShipmentAction,
  createSkuAction,
  createTmsLoadAction,
  createWarehouseAction,
  updateReviewerAccessAction,
} from "@/app/actions";
import { formatCurrency } from "@/lib/money";

type Row = Record<string, unknown>;

type Snapshot = {
  profile: {
    name: string;
    email: string;
    role: "admin" | "operator" | "viewer" | "customer";
  };
  warehouses: Row[];
  customers: Row[];
  carriers: Row[];
  carrierRates: Row[];
  clientRates: Row[];
  loads: Row[];
  skus: Row[];
  bays: Row[];
  shipments: Row[];
  users: Row[];
  isBlank: boolean;
};

const arms = ["WMS", "TMS", "Customer Portal", "Admin", "Settings"] as const;

function text(row: Row, key: string) {
  const value = row[key];
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function num(row: Row, key: string) {
  const value = Number(row[key] ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function getName(rows: Row[], id: string, fallback = "-") {
  const row = rows.find((item) => text(item, "id") === id);
  return row ? text(row, "name") || text(row, "code") || fallback : fallback;
}

function canWrite(role: Snapshot["profile"]["role"]) {
  return role === "admin" || role === "operator";
}

function canAdmin(role: Snapshot["profile"]["role"]) {
  return role === "admin";
}

export function CommandCenter({ snapshot }: { snapshot: Snapshot }) {
  const defaultArm = snapshot.profile.role === "customer" ? "Customer Portal" : "WMS";
  const [activeArm, setActiveArm] = useState<(typeof arms)[number]>(defaultArm);
  const writable = canWrite(snapshot.profile.role);
  const admin = canAdmin(snapshot.profile.role);
  const totals = useMemo(() => {
    return snapshot.loads.reduce(
      (summary, load) => {
        summary.loads += 1;
        summary.open += ["draft", "quoted", "tendered", "dispatched", "picked_up", "in_transit", "exception"].includes(text(load, "status")) ? 1 : 0;
        summary.revenue += num(load, "clientChargeCents");
        summary.cost += num(load, "carrierCostCents");
        return summary;
      },
      { loads: 0, open: 0, revenue: 0, cost: 0 },
    );
  }, [snapshot.loads]);

  return (
    <main className="command-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">BL</div>
          <div>
            <p className="eyebrow">Command Center</p>
            <strong>Review Preview</strong>
          </div>
        </div>

        <div className="arm-nav" aria-label="Command arms">
          {arms
            .filter((arm) => snapshot.profile.role !== "customer" || arm === "Customer Portal" || arm === "Settings")
            .map((arm) => (
              <button className="arm-button" data-active={activeArm === arm} key={arm} onClick={() => setActiveArm(arm)} type="button">
                {arm === "Customer Portal" ? "Portal" : arm}
              </button>
            ))}
        </div>

        <nav className="side-nav">
          <span className="side-link" data-active="true">
            {activeArm}
          </span>
          <span className="side-link">Role: {snapshot.profile.role}</span>
          <span className="side-link">Workspace: Blank shared DB</span>
        </nav>
      </aside>

      <section className="main-panel">
        <header className="view-heading">
          <div>
            <p className="eyebrow">{snapshot.profile.role} Review Session</p>
            <h1>{activeArm}</h1>
          </div>
          <span className="badge warn">Protected shared preview</span>
        </header>

        {snapshot.isBlank ? (
          <section className="blank-state">
            <strong>Blank workspace ready.</strong>
            <p>No demo data is loaded. Admins and operators can create the first customers, warehouses, carriers, rates, and loads for review.</p>
          </section>
        ) : null}

        {activeArm === "WMS" ? (
          <WmsArm snapshot={snapshot} writable={writable} />
        ) : activeArm === "TMS" ? (
          <TmsArm snapshot={snapshot} writable={writable} totals={totals} />
        ) : activeArm === "Customer Portal" ? (
          <PortalArm snapshot={snapshot} />
        ) : activeArm === "Admin" ? (
          <AdminArm snapshot={snapshot} admin={admin} totals={totals} />
        ) : (
          <SettingsArm snapshot={snapshot} />
        )}
      </section>
    </main>
  );
}

function WmsArm({ snapshot, writable }: { snapshot: Snapshot; writable: boolean }) {
  return (
    <>
      <div className="metric-grid">
        <Metric label="Warehouses" value={snapshot.warehouses.length} />
        <Metric label="Customers" value={snapshot.customers.length} />
        <Metric label="SKUs" value={snapshot.skus.length} />
        <Metric label="WMS Shipments" value={snapshot.shipments.length} />
        <Metric label="Write Access" value={writable ? "Yes" : "No"} />
      </div>
      <div className="grid-two">
        {writable ? (
          <section className="panel">
            <div className="panel-heading">
              <h2>Create Warehouse</h2>
            </div>
            <form action={createWarehouseAction} className="data-form">
              <div className="field-row">
                <label>
                  <span>Code</span>
                  <input name="code" required />
                </label>
                <label>
                  <span>Name</span>
                  <input name="name" required />
                </label>
              </div>
              <div className="field-row">
                <label>
                  <span>City</span>
                  <input name="city" />
                </label>
                <label>
                  <span>State</span>
                  <input name="state" maxLength={2} />
                </label>
              </div>
              <button className="primary-button" type="submit">
                Save Warehouse
              </button>
            </form>
          </section>
        ) : null}
        {writable ? (
          <section className="panel">
            <div className="panel-heading">
              <h2>Create Customer</h2>
            </div>
            <form action={createCustomerAction} className="data-form">
              <div className="field-row">
                <label>
                  <span>Code</span>
                  <input name="code" required />
                </label>
                <label>
                  <span>Name</span>
                  <input name="name" required />
                </label>
              </div>
              <div className="field-row">
                <label>
                  <span>Email</span>
                  <input name="email" type="email" />
                </label>
                <label>
                  <span>Phone</span>
                  <input name="phone" />
                </label>
              </div>
              <button className="primary-button" type="submit">
                Save Customer
              </button>
            </form>
          </section>
        ) : null}
      </div>
      {writable ? (
        <div className="grid-two">
          <section className="panel">
            <div className="panel-heading">
              <h2>Create SKU</h2>
            </div>
            <form action={createSkuAction} className="data-form">
              <div className="field-row">
                <label>
                  <span>SKU</span>
                  <input name="sku" required />
                </label>
                <label>
                  <span>Item Name</span>
                  <input name="name" required />
                </label>
              </div>
              <Select name="customerId" label="Customer" rows={snapshot.customers} />
              <div className="field-row">
                <label>
                  <span>L</span>
                  <input name="length" type="number" />
                </label>
                <label>
                  <span>W</span>
                  <input name="width" type="number" />
                </label>
                <label>
                  <span>H</span>
                  <input name="height" type="number" />
                </label>
                <label>
                  <span>Weight</span>
                  <input name="weight" type="number" />
                </label>
              </div>
              <button className="primary-button" type="submit">
                Save SKU
              </button>
            </form>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>Create Bay</h2>
            </div>
            <form action={createBayAction} className="data-form">
              <Select name="warehouseId" label="Warehouse" rows={snapshot.warehouses} required />
              <div className="field-row">
                <label>
                  <span>Bay Code</span>
                  <input name="code" required />
                </label>
                <label>
                  <span>Zone</span>
                  <input name="zone" />
                </label>
              </div>
              <div className="field-row">
                <label>
                  <span>Max Pallets</span>
                  <input name="maxPallets" type="number" />
                </label>
                <label>
                  <span>Max Weight</span>
                  <input name="maxWeight" type="number" />
                </label>
              </div>
              <button className="primary-button" type="submit">
                Save Bay
              </button>
            </form>
          </section>
        </div>
      ) : null}
      {writable ? (
        <section className="panel">
          <div className="panel-heading">
            <h2>Create WMS Shipment</h2>
          </div>
          <form action={createShipmentAction} className="data-form">
            <div className="field-row">
              <label>
                <span>Reference</span>
                <input name="reference" required />
              </label>
              <Select name="customerId" label="Customer" rows={snapshot.customers} />
              <Select name="warehouseId" label="Warehouse" rows={snapshot.warehouses} />
            </div>
            <div className="field-row">
              <label>
                <span>Origin</span>
                <input name="origin" />
              </label>
              <label>
                <span>Destination</span>
                <input name="destination" />
              </label>
              <label>
                <span>Carrier</span>
                <input name="carrier" />
              </label>
            </div>
            <div className="field-row">
              <label>
                <span>Invoice Total</span>
                <input name="invoiceTotal" type="number" step="0.01" />
              </label>
              <label>
                <span>Internal Cost</span>
                <input name="internalCost" type="number" step="0.01" />
              </label>
            </div>
            <button className="primary-button" type="submit">
              Save Shipment
            </button>
          </form>
        </section>
      ) : null}
      <section className="panel">
        <div className="panel-heading">
          <h2>Warehouse Network</h2>
        </div>
        <SimpleTable
          columns={["Code", "Name", "Location"]}
          rows={snapshot.warehouses.map((row) => [text(row, "code"), text(row, "name"), [text(row, "city"), text(row, "state")].filter(Boolean).join(", ") || "-"])}
          empty="No warehouses have been created yet."
        />
      </section>
      <div className="grid-two">
        <section className="panel">
          <div className="panel-heading">
            <h2>SKU Catalog</h2>
          </div>
          <SimpleTable
            columns={["SKU", "Name", "Customer", "Weight"]}
            rows={snapshot.skus.map((row) => [text(row, "sku"), text(row, "name"), getName(snapshot.customers, text(row, "customerId")), num(row, "weight")])}
            empty="No SKUs have been created yet."
          />
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Bays</h2>
          </div>
          <SimpleTable
            columns={["Bay", "Warehouse", "Zone", "Capacity"]}
            rows={snapshot.bays.map((row) => [
              text(row, "code"),
              getName(snapshot.warehouses, text(row, "warehouseId")),
              text(row, "zone"),
              `${num(row, "maxPallets")} pallets / ${num(row, "maxWeight")} lb`,
            ])}
            empty="No bays have been created yet."
          />
        </section>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <h2>WMS Shipments</h2>
        </div>
        <SimpleTable
          columns={["Reference", "Customer", "Warehouse", "Lane", "Invoice"]}
          rows={snapshot.shipments.map((row) => [
            text(row, "reference"),
            getName(snapshot.customers, text(row, "customerId")),
            getName(snapshot.warehouses, text(row, "warehouseId")),
            `${text(row, "origin")} to ${text(row, "destination")}`,
            formatCurrency(num(row, "invoiceTotalCents")),
          ])}
          empty="No WMS shipments have been created yet."
        />
      </section>
    </>
  );
}

function TmsArm({ snapshot, writable, totals }: { snapshot: Snapshot; writable: boolean; totals: { loads: number; open: number; revenue: number; cost: number } }) {
  return (
    <>
      <div className="metric-grid">
        <Metric label="Loads" value={totals.loads} />
        <Metric label="Open Loads" value={totals.open} />
        <Metric label="Client Charges" value={formatCurrency(totals.revenue)} />
        <Metric label="Margin" value={formatCurrency(totals.revenue - totals.cost)} />
      </div>
      {writable ? (
        <div className="grid-two">
          <section className="panel">
            <div className="panel-heading">
              <h2>Carrier</h2>
            </div>
            <form action={createCarrierAction} className="data-form">
              <label>
                <span>Name</span>
                <input name="name" required />
              </label>
              <div className="field-row">
                <label>
                  <span>SCAC</span>
                  <input name="scac" maxLength={8} />
                </label>
                <label>
                  <span>Service Areas</span>
                  <input name="serviceAreas" />
                </label>
              </div>
              <button className="primary-button" type="submit">
                Save Carrier
              </button>
            </form>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>Transportation Load</h2>
            </div>
            <form action={createTmsLoadAction} className="data-form">
              <div className="field-row">
                <label>
                  <span>Reference</span>
                  <input name="reference" required />
                </label>
                <label>
                  <span>Mode</span>
                  <select name="mode" defaultValue="ltl">
                    <option value="ltl">LTL</option>
                    <option value="ftl">FTL</option>
                    <option value="parcel">Parcel</option>
                  </select>
                </label>
              </div>
              <div className="field-row">
                <Select name="customerId" label="Customer" rows={snapshot.customers} required />
                <Select name="warehouseId" label="Warehouse" rows={snapshot.warehouses} />
              </div>
              <div className="field-row">
                <Select name="carrierId" label="Carrier" rows={snapshot.carriers} />
                <label>
                  <span>Status</span>
                  <select name="status" defaultValue="draft">
                    <option value="draft">Draft</option>
                    <option value="quoted">Quoted</option>
                    <option value="tendered">Tendered</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </label>
              </div>
              <div className="field-row">
                <label>
                  <span>Origin</span>
                  <input name="origin" />
                </label>
                <label>
                  <span>Destination</span>
                  <input name="destination" />
                </label>
              </div>
              <div className="field-row">
                <label>
                  <span>Client Charge</span>
                  <input name="clientCharge" type="number" step="0.01" />
                </label>
                <label>
                  <span>Carrier Cost</span>
                  <input name="carrierCost" type="number" step="0.01" />
                </label>
              </div>
              <button className="primary-button" type="submit">
                Save Load
              </button>
            </form>
          </section>
        </div>
      ) : null}
      {writable ? <RateForms snapshot={snapshot} /> : null}
      <section className="panel">
        <div className="panel-heading">
          <h2>Load Board</h2>
        </div>
        <LoadTable snapshot={snapshot} internal />
      </section>
    </>
  );
}

function RateForms({ snapshot }: { snapshot: Snapshot }) {
  return (
    <div className="grid-two">
      <section className="panel">
        <div className="panel-heading">
          <h2>Carrier Rate</h2>
        </div>
        <form action={createCarrierRateAction} className="data-form">
          <Select name="carrierId" label="Carrier" rows={snapshot.carriers} required />
          <label>
            <span>Lane</span>
            <input name="laneName" required />
          </label>
          <div className="field-row">
            <label>
              <span>Minimum Charge</span>
              <input name="minimumCharge" type="number" step="0.01" />
            </label>
            <label>
              <span>Fuel %</span>
              <input name="fuelPct" type="number" step="0.01" />
            </label>
          </div>
          <button className="primary-button" type="submit">
            Save Carrier Rate
          </button>
        </form>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Client Rate</h2>
        </div>
        <form action={createClientRateAction} className="data-form">
          <Select name="customerId" label="Customer" rows={snapshot.customers} required />
          <label>
            <span>Profile Name</span>
            <input name="name" required />
          </label>
          <Select name="carrierRateId" label="Carrier Rate" rows={snapshot.carrierRates} labelKey="laneName" />
          <div className="field-row">
            <label>
              <span>% Markup</span>
              <input name="percentMarkup" type="number" step="0.01" />
            </label>
            <label>
              <span>Minimum Margin</span>
              <input name="minimumMargin" type="number" step="0.01" />
            </label>
          </div>
          <button className="primary-button" type="submit">
            Save Client Rate
          </button>
        </form>
      </section>
    </div>
  );
}

function PortalArm({ snapshot }: { snapshot: Snapshot }) {
  return (
    <>
      <div className="metric-grid">
        <Metric label="My Loads" value={snapshot.loads.length} />
        <Metric label="Open" value={snapshot.loads.filter((row) => !["closed", "canceled"].includes(text(row, "status"))).length} />
        <Metric label="Charges" value={formatCurrency(snapshot.loads.reduce((sum, row) => sum + num(row, "clientChargeCents"), 0))} />
        <Metric label="Rate Profiles" value={snapshot.clientRates.length} />
      </div>
      <section className="blank-state">
        <strong>Customer-safe view.</strong>
        <p>This portal intentionally excludes internal carrier costs, margin, markup, and internal notes from the server response.</p>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>My Shipments</h2>
        </div>
        <LoadTable snapshot={snapshot} internal={false} />
      </section>
    </>
  );
}

function AdminArm({ snapshot, admin, totals }: { snapshot: Snapshot; admin: boolean; totals: { loads: number; revenue: number; cost: number } }) {
  if (!admin) {
    return (
      <section className="blank-state">
        <strong>Admin access required.</strong>
        <p>Your reviewer role cannot see user management, internal cost reporting, or protected exports.</p>
      </section>
    );
  }

  return (
    <>
      <div className="metric-grid">
        <Metric label="Users" value={snapshot.users.length} />
        <Metric label="Loads" value={totals.loads} />
        <Metric label="Carrier Cost" value={formatCurrency(totals.cost)} />
        <Metric label="Margin" value={formatCurrency(totals.revenue - totals.cost)} />
      </div>
      <section className="panel">
        <div className="panel-heading">
          <h2>Reviewer Access</h2>
          <a className="ghost-button" href="/api/admin/export">
            Export Internal Report
          </a>
        </div>
        <form action={updateReviewerAccessAction} className="data-form compact-form">
          <div className="field-row">
            <Select name="userId" label="Reviewer" rows={snapshot.users} required />
            <label>
              <span>Role</span>
              <select name="role" defaultValue="viewer">
                <option value="admin">Admin</option>
                <option value="operator">Operator</option>
                <option value="viewer">Viewer</option>
                <option value="customer">Customer</option>
              </select>
            </label>
            <label>
              <span>Status</span>
              <select name="status" defaultValue="active">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>
          <div className="field-row">
            <Select name="customerId" label="Customer Scope" rows={snapshot.customers} />
            <Select name="warehouseId" label="Warehouse Scope" rows={snapshot.warehouses} />
          </div>
          <button className="primary-button" type="submit">
            Update Reviewer Access
          </button>
        </form>
        <SimpleTable
          columns={["Name", "Email", "Role", "Status", "Customers", "Warehouses"]}
          rows={snapshot.users.map((row) => [
            text(row, "name"),
            text(row, "email"),
            text(row, "role"),
            text(row, "status"),
            Array.isArray(row.customerIds) ? row.customerIds.length : 0,
            Array.isArray(row.warehouseIds) ? row.warehouseIds.length : 0,
          ])}
          empty="No users yet. First sign-in creates an admin when INITIAL_ADMIN_EMAILS matches."
        />
      </section>
    </>
  );
}

function SettingsArm({ snapshot }: { snapshot: Snapshot }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Review Setup</h2>
        <span className="badge ok">Blank workspace</span>
      </div>
      <SimpleTable
        columns={["Requirement", "Status"]}
        rows={[
          ["Clerk auth", "Required for invite-only access"],
          ["Neon/Postgres", "Required for shared data"],
          ["Vercel deployment protection", "Enable on preview deployment"],
          ["Initial admin", `${snapshot.profile.email} is currently signed in as ${snapshot.profile.role}`],
        ]}
        empty="No setup requirements."
      />
    </section>
  );
}

function LoadTable({ snapshot, internal }: { snapshot: Snapshot; internal: boolean }) {
  const columns = internal
    ? ["Ref", "Customer", "Mode", "Status", "Lane", "Charge", "Cost", "Margin", "Actions"]
    : ["Ref", "Mode", "Status", "Lane", "Charge"];
  const rows = snapshot.loads.map((load) => {
    const charge = num(load, "clientChargeCents");
    const cost = num(load, "carrierCostCents");
    const base = [
      text(load, "reference"),
      internal ? getName(snapshot.customers, text(load, "customerId")) : text(load, "mode").toUpperCase(),
      internal ? text(load, "mode").toUpperCase() : text(load, "status"),
      internal ? text(load, "status") : `${text(load, "origin")} to ${text(load, "destination")}`,
      internal ? `${text(load, "origin")} to ${text(load, "destination")}` : formatCurrency(charge),
    ];
    if (!internal) return base;
    return [
      ...base,
      formatCurrency(charge),
      formatCurrency(cost),
      formatCurrency(charge - cost),
      <form action={closeLoadAction} key={text(load, "id")}>
        <input name="id" type="hidden" value={text(load, "id")} />
        <button className="ghost-button" type="submit">
          Close
        </button>
      </form>,
    ];
  });
  return <SimpleTable columns={columns} rows={rows} empty="No loads have been created yet." />;
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Select({
  label,
  name,
  rows,
  labelKey = "name",
  required = false,
}: {
  label: string;
  name: string;
  rows: Row[];
  labelKey?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span>{label}</span>
      <select name={name} required={required}>
        <option value="">Select {label.toLowerCase()}</option>
        {rows.map((row) => (
          <option key={text(row, "id")} value={text(row, "id")}>
            {text(row, labelKey) || text(row, "code")}
          </option>
        ))}
      </select>
    </label>
  );
}

function SimpleTable({
  columns,
  rows,
  empty,
}: {
  columns: string[];
  rows: Array<Array<ReactNode>>;
  empty: string;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell === "" || cell == null ? "-" : cell}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>{empty}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
