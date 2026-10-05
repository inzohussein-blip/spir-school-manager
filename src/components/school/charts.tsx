"use client";

import { useId } from "react";

/** Small hand-made SVG charts in the dashboard's green palette (no chart library). */
export const PALETTE = ["#0e5530", "#3fbf7f", "#9be3bd", "#f0b429", "#b8c2bc"];

const smooth = (pts: [number, number][]) => {
  if (pts.length < 2) return pts.length ? `M${pts[0][0]},${pts[0][1]}` : "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
};
const scale = (vals: number[], w: number, h: number, pad: number, max?: number): [number, number][] => {
  const hi = max ?? Math.max(1, ...vals), n = Math.max(1, vals.length - 1);
  return vals.map((v, i) => [pad + (i / n) * (w - pad * 2), h - pad - (Math.max(0, v) / hi) * (h - pad * 2)]);
};

/** A thin trend line with a soft fade underneath (KPI cards). */
export function Sparkline({ values, className = "" }: { values: number[]; className?: string }) {
  const id = useId(); const w = 240, h = 48;
  const pts = scale(values.length > 1 ? values : [0, 0], w, h, 3);
  const line = smooth(pts);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={`h-10 w-full text-brand-mid ${className}`} aria-hidden>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".22" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
      <path d={`${line} L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
    </svg>
  );
}

/** Area chart with a dashed comparison line and horizontal guides. */
export function AreaChart({ series, labels, max, height = 260, unit = "" }: { series: { name: string; values: number[]; dashed?: boolean }[]; labels: string[]; max?: number; height?: number; unit?: string }) {
  const id = useId(); const w = 720, h = height, pad = 28;
  const hi = max ?? Math.max(1, ...series.flatMap((s) => s.values));
  const nice = max ?? (Math.ceil(hi / 4) * 4 || 4);
  const main = series.find((s) => !s.dashed) ?? series[0];
  const mp = scale(main.values, w, h, pad, nice);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="رسم بياني">
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3fbf7f" stopOpacity=".35" /><stop offset="1" stopColor="#3fbf7f" stopOpacity="0" /></linearGradient></defs>
      {[0, 1, 2, 3, 4].map((i) => { const y = pad + (i / 4) * (h - pad * 2); return <g key={i}><line x1={pad} x2={w - pad} y1={y} y2={y} className="stroke-line" strokeDasharray="3 5" /><text x={pad - 6} y={y + 3} textAnchor="end" className="fill-muted" fontSize="10">{Math.round(nice * (1 - i / 4))}{unit}</text></g>; })}
      {labels.map((l, i) => { const x = pad + (i / Math.max(1, labels.length - 1)) * (w - pad * 2); return l ? <text key={i} x={x} y={h - 6} textAnchor="middle" className="fill-muted" fontSize="10">{l}</text> : null; })}
      <path d={`${smooth(mp)} L${mp[mp.length - 1][0]},${h - pad} L${mp[0][0]},${h - pad} Z`} fill={`url(#${id})`} />
      {series.map((s) => <path key={s.name} d={smooth(scale(s.values, w, h, pad, nice))} fill="none" stroke={s.dashed ? "#8aa095" : "#0e5530"} strokeWidth={s.dashed ? 1.5 : 2.2} strokeDasharray={s.dashed ? "4 4" : undefined} strokeLinecap="round" />)}
    </svg>
  );
}

/** Ring with a figure in the middle. */
export function Donut({ parts, center, sub, size = 190 }: { parts: { value: number; color?: string }[]; center: string; sub?: string; size?: number }) {
  const total = parts.reduce((n, p) => n + p.value, 0) || 1; const r = 70, c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg viewBox="0 0 180 180" className="size-full -rotate-90" aria-hidden>
        <circle cx="90" cy="90" r={r} fill="none" className="stroke-line" strokeWidth="22" />
        {parts.map((p, i) => {
          const len = (p.value / total) * c; const off = parts.slice(0, i).reduce((n, q) => n + (q.value / total) * c, 0);
          return <circle key={i} cx="90" cy="90" r={r} fill="none" stroke={p.color ?? PALETTE[i % PALETTE.length]} strokeWidth="22" strokeDasharray={`${Math.max(0, len - 2)} ${c}`} strokeDashoffset={-off} />;
        })}
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center"><div className="text-2xl font-extrabold tabular-nums">{center}</div>{sub && <div className="text-[11px] text-muted">{sub}</div>}</div>
    </div>
  );
}

/** Rounded vertical pills: the highlighted ones filled, the rest hatched. */
export function PillBars({ items }: { items: { label: string; value: number; tone?: "dark" | "mid" | "soft" | "hatch"; note?: string }[] }) {
  const id = useId();
  return (
    <div className="flex items-end justify-between gap-2" dir="ltr">
      <svg width="0" height="0" aria-hidden><defs><pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#eef2ef" /><line x1="0" y1="0" x2="0" y2="6" stroke="#b8c2bc" strokeWidth="1.2" /></pattern></defs></svg>
      {items.map((it, i) => {
        const hgt = Math.max(14, Math.min(100, it.value));
        const bg = it.tone === "dark" ? "#0e5530" : it.tone === "mid" ? "#3fbf7f" : it.tone === "soft" ? "#9be3bd" : `url(#${id})`;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-40 w-full max-w-14 items-end"><div className="relative w-full rounded-full border border-line/60" style={{ height: `${hgt}%`, background: bg }} title={it.note}>
              {it.note && <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-surface px-1.5 text-[10px] font-semibold tabular-nums shadow-[var(--shadow-card)]">{it.note}</span>}</div></div>
            <span className="text-xs text-muted" dir="rtl">{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Half-ring gauge. */
export function Gauge({ percent, label }: { percent: number; label?: string }) {
  const p = Math.max(0, Math.min(100, percent)); const r = 80, c = Math.PI * r;
  return (
    <div className="relative mx-auto w-56">
      <svg viewBox="0 0 200 110" className="w-full" aria-hidden>
        <path d="M20,100 A80,80 0 0 1 180,100" fill="none" className="stroke-line" strokeWidth="26" strokeLinecap="round" />
        <path d="M20,100 A80,80 0 0 1 180,100" fill="none" stroke="#0e5530" strokeWidth="26" strokeLinecap="round" strokeDasharray={`${(p / 100) * c} ${c}`} />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center"><div className="text-3xl font-extrabold tabular-nums">{Math.round(p)}%</div>{label && <div className="text-[11px] text-muted">{label}</div>}</div>
    </div>
  );
}
