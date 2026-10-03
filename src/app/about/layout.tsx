import type { ReactNode } from "react";
import { LocalThemeApplier } from "@/components/local/LocalTheme";
import { THEME_KEYS, themeScript } from "@/lib/local/theme";

export default function AboutLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeScript(THEME_KEYS.about) }} />
      <LocalThemeApplier storageKey={THEME_KEYS.about} />
      {children}
    </>
  );
}
