import * as React from "react";
type TabsCtx = { value: string; setValue: (v: string) => void };
const Ctx = React.createContext<TabsCtx | null>(null);
export function Tabs({ defaultValue, children, className="" }: { defaultValue: string; children: React.ReactNode; className?: string }) {
  const [value, setValue] = React.useState(defaultValue);
  return <Ctx.Provider value={{ value, setValue }}><div className={className}>{children}</div></Ctx.Provider>;
}
export function TabsList({ children, className="" }: { children: React.ReactNode; className?: string }) {
  return <div className={`inline-flex gap-2 p-1 ${className}`}>{children}</div>;
}
export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = React.useContext(Ctx)!; const active = ctx.value === value;
  return (
    <button onClick={() => ctx.setValue(value)} className={`rounded-xl px-3 py-1 text-sm ${active ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"}`}>
      {children}
    </button>
  );
}
export function TabsContent({ value, children, className="" }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(Ctx)!; if (ctx.value !== value) return null;
  return <div className={className}>{children}</div>;
}
