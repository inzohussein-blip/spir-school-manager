/** Per-station appearance (plain module: used by the server layouts and by client code).
 *  Each station keeps its own choice under its own key; nothing is shared. */
export const THEME_KEYS = {
  setup: "setup.theme.v1",
  students: "students.theme.v1",
  classes: "classes.theme.v1",
  teachers: "teachers.theme.v1",
  results: "results.theme.v1",
  leaves: "leaves.theme.v1",
  plan: "plan.theme.v1",
  attendance: "attendance.theme.v1",
  fees: "fees.theme.v1",
  sync: "sync.theme.v1",
  about: "about.theme.v1",
} as const;
export type ThemeStation = keyof typeof THEME_KEYS;

/** Inline script that applies the station's choice before it paints (no flash). */
export const themeScript = (key: string) =>
  `try{var t=localStorage.getItem('${key}');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');else if(t==='light')document.documentElement.removeAttribute('data-theme')}catch(e){}`;
