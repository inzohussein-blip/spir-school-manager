import type { ReactNode } from "react";
import { StationFrame } from "@/components/school/StationFrame";
import { stationById } from "@/lib/school/stations";

export const metadata = { title: stationById("students")!.label };

export default function Layout({ children }: { children: ReactNode }) {
  return <StationFrame id="students">{children}</StationFrame>;
}
