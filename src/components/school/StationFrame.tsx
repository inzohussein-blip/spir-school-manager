import type { ReactNode } from "react";
import { OfflineReady } from "@/components/local/OfflineReady";
import { ActivationGate } from "@/components/local/ActivationGate";
import { PinGate } from "@/components/local/PinGate";
import { LocalDataGate } from "@/components/local/LocalDataGate";
import { LocalThemeApplier } from "@/components/local/LocalTheme";
import { ACTIVATION_SCRIPT } from "@/lib/local/activation";
import { THEME_KEYS, themeScript } from "@/lib/local/theme";
import type { LicenseModule } from "@/lib/license/modules";
import { stationById } from "@/lib/school/stations";
import { SchoolSidebar } from "./SchoolSidebar";

type Id = Exclude<LicenseModule, "admin">;

/** The shell every school station's layout uses: licence gate, PIN, theme, data loading and the sidebar. */
export function StationFrame({ id, children }: { id: Id; children: ReactNode }) {
  const st = stationById(id)!;
  return (
    <div className={`school-st st-${id} min-h-screen md:flex`}>
      <script dangerouslySetInnerHTML={{ __html: ACTIVATION_SCRIPT }} />
      <ActivationGate module={id} />
      <PinGate station={id} title={st.label} />
      <script dangerouslySetInnerHTML={{ __html: themeScript(THEME_KEYS[id]) }} />
      <LocalThemeApplier storageKey={THEME_KEYS[id]} />
      <LocalDataGate>
        <SchoolSidebar id={id} />
        <main className="min-w-0 flex-1 p-4 md:p-7 print:p-0">{children}</main>
      </LocalDataGate>
      <OfflineReady />
    </div>
  );
}
