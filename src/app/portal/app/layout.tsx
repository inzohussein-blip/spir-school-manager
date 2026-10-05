import type { ReactNode } from "react";
import { themeScript, THEME_KEYS } from "@/lib/local/theme";
import { PortalFrame } from "@/components/portal/PortalFrame";

export const metadata = { title: "لوحة الإدارة — سبير", robots: { index: false, follow: false } };

export default function PortalAppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeScript(THEME_KEYS.portal) }} />
      <PortalFrame>{children}</PortalFrame>
    </>
  );
}
