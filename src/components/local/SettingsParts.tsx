"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Boxes } from "lucide-react";
import { notifySaved } from "@/components/SettingsLayout";

/**
 * The pieces every station's settings page is built from, so they all read the same way:
 * a card with a title (and icon) and one line saying what it is for, then its switches.
 */
export function SettingCard({ title, icon, desc, children, testid, tone }: {
  title: string; icon?: ReactNode; desc?: ReactNode; children: ReactNode; testid?: string; tone?: "warn";
}) {
  return (
    <div className={`rounded-2xl border bg-surface p-5 shadow-[var(--shadow-card)] ${tone === "warn" ? "border-amber-300" : "border-line"}`} data-testid={testid}>
      <div className="flex items-center gap-2 text-sm font-semibold [&>svg]:size-4">{icon}{title}</div>
      {desc && <p className="mt-0.5 text-xs text-muted">{desc}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

/** A setting that is on or off: its name and what it does, and a switch. */
export function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted">{desc}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full ${checked ? "bg-brand" : "bg-line"}`}
      >
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${checked ? "start-[22px]" : "start-0.5"}`} />
      </button>
    </label>
  );
}

/** Options that belong under a switch (shown while it is on). */
export function SubOptions({ children, grid = false }: { children: ReactNode; grid?: boolean }) {
  return <div className={`border-s-2 border-line ps-4 ${grid ? "grid gap-3 sm:grid-cols-2" : "flex flex-col gap-3"}`}>{children}</div>;
}
