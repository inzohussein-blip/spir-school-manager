import type { ReactNode } from "react";
import { OfflineReady } from "@/components/local/OfflineReady";
import { ActivationGate } from "@/components/local/ActivationGate";
import { LocalDataGate } from "@/components/local/LocalDataGate";
import { LocalThemeApplier } from "@/components/local/LocalTheme";
import { ACTIVATION_SCRIPT } from "@/lib/local/activation";
import { THEME_KEYS, themeScript } from "@/lib/local/theme";
import { AppShell } from "@/components/school/AppShell";

export const metadata = { title: "لوحة التحكم" };

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="school-st min-h-screen md:flex">
      <script dangerouslySetInnerHTML={{ __html: ACTIVATION_SCRIPT }} />
      <ActivationGate />
      <script dangerouslySetInnerHTML={{ __html: themeScript(THEME_KEYS.setup) }} />
      <LocalThemeApplier storageKey={THEME_KEYS.setup} />
      <LocalDataGate><AppShell id="dashboard">{children}</AppShell></LocalDataGate>
      <OfflineReady />
    </div>
  );
}
