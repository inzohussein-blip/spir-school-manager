import type { ReactNode } from "react";
import { OfflineReady } from "@/components/local/OfflineReady";
import { ActivationGate } from "@/components/local/ActivationGate";
import { PinGate } from "@/components/local/PinGate";
import { LocalDataGate } from "@/components/local/LocalDataGate";
import { ACTIVATION_SCRIPT } from "@/lib/local/activation";
import { LocalThemeApplier } from "@/components/local/LocalTheme";
import { THEME_KEYS, themeScript } from "@/lib/local/theme";
import { AppShell } from "@/components/school/AppShell";

export const metadata = { title: "محطة المزامنة" };

/** «محطة المزامنة»: every activated computer of the school (no station of its own to switch on). */
export default function SyncLayout({ children }: { children: ReactNode }) {
  return (
    <div className="sync school-st min-h-screen md:flex">
      <script dangerouslySetInnerHTML={{ __html: ACTIVATION_SCRIPT }} />
      <ActivationGate />
      <PinGate station="sync" title="محطة المزامنة" />
      <script dangerouslySetInnerHTML={{ __html: themeScript(THEME_KEYS.sync) }} />
      <LocalThemeApplier storageKey={THEME_KEYS.sync} />
      <LocalDataGate>
        <AppShell id="sync">{children}</AppShell>
      </LocalDataGate>
      <OfflineReady />
    </div>
  );
}
