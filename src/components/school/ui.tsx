"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { onKvChange } from "@/lib/local/kv";

export const inp = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand";
export const btnPrimary = "inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50";
export const btnGhost = "inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm hover:bg-canvas disabled:opacity-50";
export const card = "rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]";

export function PageTitle({ icon, title, sub, children }: { icon: ReactNode; title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="no-print mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">{icon} {title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`block text-sm font-medium ${className}`}>{label}<div className="mt-1 font-normal">{children}</div></label>;
}

/** A centered dialog. */
export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="no-print fixed inset-0 z-[90] grid place-items-center bg-slate-900/40 p-4 backdrop-blur-[2px]" onMouseDown={onClose}>
      <div role="dialog" aria-label={title} onMouseDown={(e) => e.stopPropagation()}
        className={`max-h-[90vh] w-full overflow-auto rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-pop)] ${wide ? "max-w-3xl" : "max-w-xl"}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="إغلاق" className="grid size-8 place-items-center rounded-lg hover:bg-canvas"><X className="size-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">{children}</div>;
}

/** Re-reads `read()` on mount and whenever data from another tab / device arrives. */
export function useLive<T>(read: () => T, initial: T): [T, () => void] {
  const [v, setV] = useState<T>(initial);
  const [n, setN] = useState(0);
  useEffect(() => { setV(read()); }, [n]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => onKvChange((_k, _p, _n, origin) => { if (origin === "external") setN((x) => x + 1); }), []);
  return [v, () => setN((x) => x + 1)];
}
