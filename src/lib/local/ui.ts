"use client";

import { useSyncExternalStore } from "react";

/** Which look the site wears: the new green dashboard style, or the classic one it had before.
 *  Kept on this device; `data-ui="classic"` on <html> switches the CSS (set before first paint, see root layout). */
export type UiMode = "new" | "classic";
export const UI_KEY = "school-ui";
const EVT = "school-ui";
export const uiScript = `try{if(localStorage.getItem('${UI_KEY}')==='classic')document.documentElement.setAttribute('data-ui','classic')}catch(e){}`;

export function getUi(): UiMode {
  return typeof document !== "undefined" && document.documentElement.getAttribute("data-ui") === "classic" ? "classic" : "new";
}
export function setUi(mode: UiMode): void {
  try { if (mode === "classic") localStorage.setItem(UI_KEY, "classic"); else localStorage.removeItem(UI_KEY); } catch { /* ignore */ }
  if (mode === "classic") document.documentElement.setAttribute("data-ui", "classic"); else document.documentElement.removeAttribute("data-ui");
  window.dispatchEvent(new Event(EVT));
}
const subscribe = (cb: () => void) => { window.addEventListener(EVT, cb); window.addEventListener("storage", cb); return () => { window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); }; };
/** The current look (the new one while the page is first rendered on the server). */
export const useUi = (): UiMode => useSyncExternalStore(subscribe, getUi, () => "new" as UiMode);
