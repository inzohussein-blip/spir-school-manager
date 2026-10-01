import type { ReactNode } from "react";
import { StationFrame } from "@/components/school/StationFrame";
import { stationById } from "@/lib/school/stations";

export const metadata = { title: stationById("teachers")!.label };

export default function Layout({ children }: { children: ReactNode }) {
  return <StationFrame id="teachers">{children}</StationFrame>;
}
