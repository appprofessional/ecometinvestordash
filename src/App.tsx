import React, { useMemo, useEffect } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Layers, ShoppingCart, Package, Banknote, Percent, TrendingUp, RotateCcw, Receipt, Wallet } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const DATA = {
  meta: { period: "Apr 1 – Aug 31, 2025" },
  purchases: { units: 403, merch: 16528.07, shipping: 70.0, invoiceTotal: 16598.07, avgCost: 41.17 },
  orders: { units: 305, grossSales: 18526.09, conversion: 1.11, buyBox: 12.38 },
  shipments: {
    totalUnits: 300,
    totalGross: 20118.22,
    uniqueOrders: 267,
    monthly: [
      { month: "2025-04", units: 74, sales: 3863.15, orders: 64 },
      { month: "2025-05", units: 30, sales: 2229.67, orders: 27 },
      { month: "2025-06", units: 67, sales: 3899.64, orders: 59 },
      { month: "2025-07", units: 50, sales: 3422.15, orders: 42 },
      { month: "2025-08", units: 79, sales: 6703.61, orders: 75 },
    ],
  },
  payments: {
    productSales: 16081.25,
    sellingFees: 2466.13,
    fbaFees: 1178.82,
    otherFees: 1669.17,
    totalFees: 5314.12,
    netPayout: 10803.81,
  },
  storage: {
    byMonth: [
      { month: "2025-04", amount: 5.73 },
      { month: "2025-05", amount: 4.90 },
      { month: "2025-06", amount: 2.67 },
      { month: "2025-07", amount: 12.16 },
      { month: "2025-08", amount: 5.29 },
    ],
    total: 30.75,
  },
  returns: {
    totalUnits: 28,
    reasons: [
      { name: "Not as Described", qty: 8 },
      { name: "Missing Parts", qty: 5 },
      { name: "Defective", qty: 4 },
      { name: "Ordered Wrong Item", qty: 3 },
      { name: "Unwanted Item", qty: 3 },
      { name: "Other", qty: 5 },
    ],
    disposition: [
      { name: "Sellable", qty: 17 },
      { name: "Customer Damaged", qty: 7 },
      { name: "Defective", qty: 4 },
    ],
  },
  reimbursements: {
    amount: 603.82,
    units: 23,
    reasonsAmount: [
      { name: "Customer Return", amount: 225.53 },
      { name: "Damaged in Warehouse", amount: 196.34 },
      { name: "Customer Service Issue", amount: 110.82 },
      { name: "Lost in Warehouse", amount: 71.13 },
    ],
  },
  profitability: {
    orderedGross: 18526.09,
    netPayout: 10803.81,
    purchases: 16598.07,
    reimbursements: 603.82,
    storageFees: 30.75,
    netPosition: -5221.19,
  },
} as Record<string, any>;

const toNumber = (v: any): number => {
  const n = typeof v === "string" ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : NaN;
};
const currency = (v: any) => {
  const n = toNumber(v);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
};
const percent = (n: number) => `${n.toFixed(2)}%`;
const COLORS = ["#7ed957", "#17becf", "#ff7f0e", "#bcbd22", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f"];

const PROJECTION_DEFAULTS = { startingUnitsPerMonth: 60, profitPerUnit: 20, unitCost: 41, months: 8, reinvestCap: 5000 };
type ProjectionRow = { month: number; capacity: number; profit: number; reinvest: number; withdrawal: number; addedUnits: number; };
function computeProjection(cfg = PROJECTION_DEFAULTS): ProjectionRow[] {
  let capacity = cfg.startingUnitsPerMonth;
  const rows: ProjectionRow[] = [];
  for (let m = 1; m <= cfg.months; m++) {
    const profit = capacity * cfg.profitPerUnit;
    const reinvest = Math.min(profit, cfg.reinvestCap);
    const withdrawal = Math.max(0, profit - reinvest);
    const addedUnits = Math.floor(reinvest / cfg.unitCost);
    rows.push({ month: m, capacity, profit, reinvest, withdrawal, addedUnits });
    capacity += addedUnits;
  }
  return rows;
}

function runDiagnostics() {
  console.assert(Number.isFinite(toNumber(DATA.storage.total)), "Storage total invalid");
  const sumUnits = DATA.shipments.monthly.reduce((s: number, m: any) => s + toNumber(m.units), 0);
  console.assert(sumUnits === DATA.shipments.totalUnits, "Shipments mismatch");
}

function Kpi({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <Card className="rounded-2xl shadow-sm bg-neutral-900 text-neutral-100">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-800">{icon}</div>
          <div>
            <div className="text-xs text-neutral-400">{label}</div>
            <div className="text-lg font-semibold leading-tight">{value}</div>
            {sub && <div className="text-xs text-neutral-500">{sub}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
function LiRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-neutral-900 px-3 py-2 shadow-sm">
      <span className="text-neutral-400">{label}</span>
      <strong className="tabular-nums text-green-300">{value}</strong>
    </div>
  );
}

function ProjectionChart() {
  const rows = useMemo(() => computeProjection(), []);
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" orientation="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="capacity" name="Capacity" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="withdrawal" name="Withdrawal" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="reinvest" name="Reinvest" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
function ProjectionTable() {
  const rows = useMemo(() => computeProjection(), []);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-neutral-200">
        <thead className="text-neutral-200">
          <tr>
            <th className="py-2 pr-3 text-left">Month</th>
            <th className="py-2 pr-3 text-right">Capacity</th>
            <th className="py-2 pr-3 text-right">Profit ($)</th>
            <th className="py-2 pr-3 text-right">Reinvest ($)</th>
            <th className="py-2 pr-3 text-right">Withdrawal ($)</th>
            <th className="py-2 pr-0 text-right">Added Units</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.month} className="border-t border-neutral-800 odd:bg-neutral-900 even:bg-neutral-950">
              <td className="py-2 pr-3 text-neutral-100">{r.month}</td>
              <td className="py-2 pr-3 text-right text-neutral-100">{r.capacity}</td>
              <td className="py-2 pr-3 text-right text-green-300">{currency(r.profit)}</td>
              <td className="py-2 pr-3 text-right text-green-300">{currency(r.reinvest)}</td>
              <td className="py-2 pr-3 text-right text-amber-300">{currency(r.withdrawal)}</td>
              <td className="py-2 pr-0 text-right text-neutral-100">{r.addedUnits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  useEffect(() => runDiagnostics(), []);

  const funnel = [
    { step: "Purchases (Cost)", value: toNumber(DATA.purchases.invoiceTotal) },
    { step: "Orders (Gross)", value: toNumber(DATA.orders.grossSales) },
    { step: "Shipments (Gross)", value: toNumber(DATA.shipments.totalGross) },
    { step: "Payments (Net)", value: toNumber(DATA.payments.netPayout) },
    { step: "Reimbursements (+)", value: toNumber(DATA.reimbursements.amount) },
    { step: "Storage Fees (−)", value: -toNumber(DATA.storage.total) },
  ];
  const returnsReasons = DATA.returns.reasons.filter((r: any) => r.qty > 0);

  return (
    <div className="min-h-screen bg-black text-neutral-100 relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-green-300">Ecomet Investor Dashboard</h1>
            <p className="text-sm text-neutral-400">Amazon Business Performance • {DATA.meta.period}</p>
          </div>
          <Button className="bg-green-400 text-black hover:bg-green-300" onClick={() => window.print()}>Print</Button>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={<Layers className="h-5 w-5 text-green-400" />} label="Units Purchased" value={String(DATA.purchases.units)} sub={currency(DATA.purchases.invoiceTotal)} />
          <Kpi icon={<ShoppingCart className="h-5 w-5 text-green-400" />} label="Units Ordered" value={String(DATA.orders.units)} sub={currency(DATA.orders.grossSales)} />
          <Kpi icon={<Package className="h-5 w-5 text-green-400" />} label="Units Shipped" value={String(DATA.shipments.totalUnits)} sub={currency(DATA.shipments.totalGross)} />
          <Kpi icon={<Banknote className="h-5 w-5 text-green-400" />} label="Net Payout" value={currency(DATA.payments.netPayout)} sub={`Fees ${currency(DATA.payments.totalFees)}`} />
        </section>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="rounded-2xl bg-neutral-900">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="shipments">Shipments</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
            <TabsTrigger value="returns">Returns</TabsTrigger>
            <TabsTrigger value="profit">Profitability</TabsTrigger>
            <TabsTrigger value="projection">Projection</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-6">
            <Card className="rounded-2xl shadow-sm bg-neutral-900">
              <CardContent className="p-4">
                <h2 className="mb-1 text-lg font-medium text-green-300">Reconciliation Funnel</h2>
                <p className="mb-4 text-xs text-neutral-400">Tracks value from purchases to net payout with adjustments.</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnel}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="step" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => currency(v)} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 rounded-2xl shadow-sm bg-neutral-900">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-green-300">Sales Quality</h3>
                    <Percent className="h-4 w-4 text-neutral-500" />
                  </div>
                  <ul className="mt-2 space-y-2 text-sm">
                    <LiRow label="Conversion" value={percent(DATA.orders.conversion)} />
                    <LiRow label="Buy Box Share" value={percent(DATA.orders.buyBox)} />
                    <LiRow label="Avg Cost / Unit" value={currency(DATA.purchases.avgCost)} />
                    <LiRow label="Avg Sale Price (approx)" value={currency(DATA.orders.grossSales / DATA.orders.units)} />
                  </ul>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm bg-neutral-900">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-green-300">Storage Fees (Apr–Aug)</h3>
                    <Receipt className="h-4 w-4 text-neutral-500" />
                  </div>
                  <div className="h-48 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={DATA.storage.byMonth.map((m: any) => ({ ...m, m: m.month.slice(5) }))}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="m" />
                        <YAxis tickFormatter={(v) => `$${v.toFixed(0)}`} />
                        <Tooltip formatter={(v: number) => currency(v)} />
                        <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 text-sm flex items-center justify-between">
                    <span className="text-neutral-300">Total</span>
                    <strong className="text-green-300 text-base">{currency(DATA.storage.total)}</strong>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shipments" className="mt-4 space-y-6">
            <Card className="rounded-2xl shadow-sm bg-neutral-900">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Monthly Shipments</h3>
                  <TrendingUp className="h-4 w-4 text-neutral-500" />
                </div>
                <div className="h-72 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={DATA.shipments.monthly.map((m: any) => ({ ...m, m: m.month.slice(5) }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="m" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number, name: string) => (name === "sales" ? currency(v) : v)} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="units" name="Units" dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="sales" name="Sales" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 grid grid-cols-3 text-sm">
                  <LiRow label="Units Shipped" value={String(DATA.shipments.totalUnits)} />
                  <LiRow label="Gross Sales (Shipped)" value={currency(DATA.shipments.totalGross)} />
                  <LiRow label="Unique Orders" value={String(DATA.shipments.uniqueOrders)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees" className="mt-4 space-y-6">
            <Card className="rounded-2xl shadow-sm bg-neutral-900">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Amazon Fees Breakdown</h3>
                  <Wallet className="h-4 w-4 text-neutral-500" />
                </div>
                <div className="h-72 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Selling Fees", value: toNumber(DATA.payments.sellingFees) },
                        { name: "FBA Fees", value: toNumber(DATA.payments.fbaFees) },
                        { name: "Other Fees", value: toNumber(DATA.payments.otherFees) },
                      ]}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => currency(v)} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-2 text-sm">
                  <LiRow label="Total Fees" value={currency(DATA.payments.totalFees)} />
                  <LiRow label="Net Payout" value={currency(DATA.payments.netPayout)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="returns" className="mt-4 space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="rounded-2xl shadow-sm bg-neutral-900">
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium">Returns by Reason</h3>
                  <div className="h-72 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={returnsReasons} dataKey="qty" nameKey="name" outerRadius={110}>
                          {returnsReasons.map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 text-sm">
                    <strong>Total Returned Units:</strong> {DATA.returns.totalUnits}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm bg-neutral-900">
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium">Returns Disposition</h3>
                  <div className="h-72 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={DATA.returns.disposition}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="qty" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl shadow-sm bg-neutral-900">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Reimbursements</h3>
                  <RotateCcw className="h-4 w-4 text-neutral-500" />
                </div>
                <div className="h-64 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DATA.reimbursements.reasonsAmount}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => currency(v)} />
                      <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-2 text-sm">
                  <LiRow label="Reimbursed Amount" value={currency(DATA.reimbursements.amount)} />
                  <LiRow label="Reimbursed Units" value={String(DATA.reimbursements.units)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profit" className="mt-4 space-y-6">
            <Card className="rounded-2xl shadow-sm bg-neutral-900">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium">Profitability Snapshot</h3>
                <div className="mt-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-2 lg:grid-cols-3">
                  <LiRow label="Gross Sales (Ordered)" value={currency(DATA.profitability.orderedGross)} />
                  <LiRow label="Net Amazon Payout" value={currency(DATA.profitability.netPayout)} />
                  <LiRow label="Purchases (Invoices)" value={currency(DATA.profitability.purchases)} />
                  <LiRow label="Reimbursements" value={currency(DATA.profitability.reimbursements)} />
                  <LiRow label="Storage Fees" value={currency(DATA.profitability.storageFees)} />
                  <LiRow label="Approx. Net Position" value={currency(DATA.profitability.netPosition)} />
                </div>
                <p className="mt-3 text-xs text-neutral-400">Note: Net reflects timing differences between orders, shipments, and payouts. As remaining inventory sells, cash flow should improve.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projection" className="mt-4 space-y-6">
            <Card className="rounded-2xl shadow-sm bg-neutral-900">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium text-green-300">Self-Funded Growth Projection</h3>
                <p className="mb-4 text-xs text-neutral-400">Assumptions: start 60 units/month, $20 profit per unit, $41 unit cost, reinvest up to $5k/month; withdraw the remainder.</p>
                <ProjectionChart />
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm bg-neutral-900">
              <CardContent className="p-4">
                <h4 className="text-md font-medium text-green-300 mb-2">Projection Table (8 Months)</h4>
                <ProjectionTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="mt-8 text-center text-xs text-neutral-500">Built for investor review • Data window: {DATA.meta.period}</footer>
      </div>
    </div>
  );
}
