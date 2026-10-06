# دليل نقل الثيمات (الأخضر الجديد + القديم) إلى مشاريع SPIR الأخرى

هذا الملف يشرح **كل** ما نُفّذ في `spir-school-manager` لنظام الثيمين، بحيث يمكن تطبيقه حرفياً على
`spir-lab-manager` و`spir-supply-manager`. كل مقاطع الكود أدناه منسوخة من الملفات الفعلية في هذا المستودع؛
ولكل ملف مسار مرجعي تستطيع نسخه كما هو.

> **لمن سيطبّق (مطوّر أو Claude):** اقرأ الأقسام 1 و2 و3 أولاً، ثم نفّذ قائمة الخطوات في القسم 9،
> واستعمل القسم 10 لتكييف الأسماء، والقسم 11 للتحقق.

---

## 1. الفكرة العامة

للموقع «ثيمان» (شكلان) مستقلان عن «المظهر» (فاتح/غامق/تلقائي):

| | الأخضر الجديد (الافتراضي) | القديم (classic) |
|---|---|---|
| ما هو | واجهة لوحة تحكم هادئة: قائمة جانبية عائمة، شريط علوي ببحث ⌘K وتنبيهات، بطاقات مستديرة بلا حدود، أزرار حبّة، تبويبات لصفحات المحطة، لوحة تحكم وتحليلات | الشكل الذي كان عليه المشروع قبل التصميم الجديد |
| كيف يُفعَّل | الافتراضي | `data-ui="classic"` على عنصر `<html>` |
| أين يُحفظ | لا شيء (يُحذف المفتاح) | `localStorage["school-ui"] = "classic"` |
| التبديل | بطاقتان بمعاينة في أسفل صفحة الترحيب تحت «المظهر» | نفسه |

المبدأ الذي يجعل التنفيذ رخيصاً وآمناً:

1. **الرموز (tokens)**: كل الألوان والظلال متغيّرات CSS (`--color-brand`…). الثيم الجديد يغيّر قيمها في `@theme`، والقديم يعيدها بقاعدة
   `:root[data-ui="classic"]` (أعلى تخصيصاً فتغلب). بذلك تتبدّل ألوان كل الصفحات تلقائياً.
2. **CSS غير مُطبَّق في طبقة (unlayered)** يتغلّب على أدوات Tailwind v4 (التي تعيش في `@layer utilities`)، وهذا ما يسمح لقواعد
   «الصفحات القديمة تلبس الشكل الجديد» (وبالعكس) بتجاوز أصناف مثل `rounded-2xl` دون تعديل الصفحات.
3. **الفروق البنيوية** (القائمة الجانبية، صفحة الترحيب) تُعالَج بمكوّنين فعليين: إمّا شرط `useUi()` في مكوّن عميل،
   أو رسم الشكلين معاً في الصفحة وإخفاء أحدهما بـ CSS (`ui-only-new` / `ui-only-classic`) — لتفادي وميض الـSSR.
4. **لا تغيير في منطق الصفحات**: الثيم طبقة عرض فقط.

---

## 2. خريطة الملفات (ما يُنسخ وما يُعدَّل)

### ملفات جديدة (تُنسخ مع تعديل بسيط)

| المسار في school-manager | الدور |
|---|---|
| `src/lib/local/ui.ts` | حالة الثيم: `getUi/setUi/useUi` وسكربت ما قبل الرسم `uiScript` |
| `src/components/local/UiSwitch.tsx` | بطاقتا الاختيار بمعاينة SVG مصغّرة |
| `src/components/school/AppShell.tsx` | الإطار الجديد (قائمة عائمة + شريط علوي + تبويبات) **وفرع classic** يرجع إلى `AppSidebar` القديم |
| `src/components/school/Palette.tsx` | بحث ⌘K (صفحات + سجلات) |
| `src/components/school/charts.tsx` | رسوم SVG يدوية: Sparkline وAreaChart وDonut وPillBars وGauge (بلا مكتبة) |
| `src/components/school/DashboardView.tsx` + `src/app/dashboard/*` | لوحة التحكم والتحليلات (اختيارية؛ مرتبطة ببيانات المشروع) |
| `src/components/school/ui.tsx` | أصناف مشتركة بعلامات `ui-card/ui-btn…` تسمح للقديم بإعادة الشكل |
| `src/components/school/StationFrame.tsx` | غلاف المحطة: ترخيص + PIN + مظهر + `AppShell` |
| `src/lib/school/nav.ts` | بيانات تنقّل كل محطة (أقسام وعناصر بأيقونة ووصف) — تغذّي القائمة القديمة والتبويبات الجديدة والبحث |

### ملفات موجودة تُعدَّل

| الملف | التعديل |
|---|---|
| `src/app/globals.css` | الرموز الجديدة + قواعد «الصفحات القديمة» + كتلة classic (القسم 4) |
| `src/app/layout.tsx` | إضافة `<script dangerouslySetInnerHTML={{__html: uiScript}} />` في `<head>` قبل سكربت المظهر |
| صفحة الترحيب `src/app/welcome/page.tsx` | رسم الشكلين معاً بـ `ui-only-*` (القسم 6) |
| `src/components/local/WelcomeFooter.tsx` | إضافة `<UiSwitch />` تحت `SiteThemeSwitch` داخل بطاقة «المظهر» |
| لكل صفحة «ملصقة» (إدارة الرموز مثلاً) | نسختان من القائمة/العنوان واختيار بـ `useUi()` (القسم 7) |
| `src/components/local/PrintDoc.tsx` | لا يعرض شعاراً افتراضياً (`{logo && <img/>}`) — خاص بمشروعنا |

---

## 3. الحالة: `ui.ts` (يُنسخ كما هو)

```ts
// src/lib/local/ui.ts
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
```


نقاط مهمة:

- `uiScript` يوضع **inline في `<head>`** ليُطبَّق الثيم قبل أول رسم (لا وميض).
- `useUi()` يعتمد `useSyncExternalStore` مع لقطة خادم `"new"`. لأن مكوّنات المحطات تُرسم **داخل `LocalDataGate`** (لا تظهر قبل تحميل البيانات
  على العميل) فلا ينشأ عدم تطابق hydration. أي مكوّن يقرأ `useUi()` ويُرسم على الخادم سيتطابق مع `"new"` ثم يُحدَّث.
- مفتاح التخزين `school-ui`؛ غيّره إن أردت (`lab-ui` / `supply-ui`) مع تعديل `uiScript` تلقائياً (يستعمل `UI_KEY`).

---

## 4. CSS: `globals.css`

### 4.1 الرموز الجديدة (مكان `@theme` الحالي)

الألوان الخضراء الهادئة، مع رمزين إضافيين (`brand-mid`, `brand-soft`) وظلّ ناعم. **في مشروع المختبر/التوريد انقل قيمهما الأصلية إلى كتلة classic** (القسم 4.3) قبل استبدالها.

```css
@theme {
  --color-brand: #14733f;
  --color-brand-dark: #0e5530;
  --color-brand-light: #e6f4ec;
  --color-brand-mid: #3fbf7f;
  --color-brand-soft: #9be3bd;
  --color-ink: #0f1f17;
  --color-muted: #75857c;
  --color-line: #e5ebe7;
  --color-surface: #ffffff;
  --color-canvas: #f2f5f3;
  --color-high: #dc2626;
  --color-low: #2563eb;
  --color-amber: #f0b429;
  --color-brand-fg: #ffffff;
  --font-sans: "IBM Plex Sans Arabic", ui-sans-serif, system-ui, "Segoe UI",
    Tahoma, "Noto Sans Arabic", sans-serif;
  --shadow-card: 0 1px 2px rgba(15, 40, 28, 0.04), 0 6px 20px -8px rgba(15, 40, 28, 0.10);
  --shadow-pop: 0 18px 44px -12px rgba(15, 40, 28, 0.28);
}

/* Dark theme — steps chosen against the dark surface, not an automatic flip. */
:root[data-theme="dark"] {
  --color-brand: #4ade80;
  --color-brand-dark: #22c55e;
  --color-brand-light: #12301f;
  --color-brand-mid: #34d399;
  --color-brand-soft: #1f5a3a;
  --color-ink: #e6efe9;
  --color-muted: #8aa095;
  --color-line: #1d2c24;
  --color-surface: #101c16;
  --color-canvas: #0a120e;
  --color-high: #f87171;
  --color-low: #60a5fa;
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.3), 0 6px 20px -8px rgba(0, 0, 0, 0.5);
  --shadow-pop: 0 18px 44px -12px rgba(0, 0, 0, 0.7);
}
```

### 4.2 قواعد التفاعل المحصورة بـ `.school-st`

الصنف `school-st` يوضع على جذر كل محطة (`StationFrame`, صفحة الترحيب, الرموز…) ليحصر قواعد التفاعل والـ CSS القديم ضمنه:

```css
/* ── Local stations interactions (scoped to .school-st) ── */
:is(.school-st, .about, .sync) button:not(:disabled),
:is(.school-st, .about, .sync) a[href] {
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease,
    box-shadow 0.15s ease, transform 0.1s ease;
}
/* Tactile press feedback */
:is(.school-st, .about, .sync) button:not(:disabled):active {
  transform: scale(0.96);
}
:is(.school-st, .about, .sync) button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
/* Primary buttons lift slightly on hover */
:is(.school-st, .about, .sync) button.bg-brand:not(:disabled):hover {
  box-shadow: 0 4px 12px color-mix(in oklab, var(--color-brand) 35%, transparent);
}
/* Keyboard focus ring for buttons/links */
:is(.school-st, .about, .sync) button:focus-visible,
:is(.school-st, .about, .sync) a:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
/* Soft glow around focused fields */
:is(.school-st, .about, .sync) input:focus,
:is(.school-st, .about, .sync) select:focus,
:is(.school-st, .about, .sync) textarea:focus {
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-brand) 18%, transparent);
}
/* Dark theme: the brand green is bright, so text sitting on it goes dark for contrast */
:root[data-theme="dark"] :is(.school-st, .about, .sync) :is(.bg-brand, .from-brand).text-white {
  color: #062613;
}
:root[data-theme="dark"] :is(.school-st, .about, .sync) :is(.bg-brand, .from-brand).text-white {
  color: #062613;
}
```

### 4.3 «الصفحات القديمة تلبس الجديد» (محصورة بغير classic)

أي صفحة لم نعد كتابتها (مزامنة، رموز، إعدادات…) تأخذ شكل الجديد بقواعد عامة بدل تعديل كودها. لاحظ البادئة
`:root:not([data-ui="classic"])` — في classic تتوقف هذه القواعد فتعود الصفحات لشكلها الأصلي:

```css
/* Older pages (sync, license, welcome, about, settings…) pick up the same look without their markup changing:
   soft cards, pill buttons, rounded fields. */
@media screen {
  :root:not([data-ui="classic"]) :is(.school-st, .about, .sync, .lic) :is(.rounded-2xl, .rounded-xl).border.border-line.bg-surface { border-color: transparent; border-radius: 1.5rem; box-shadow: var(--shadow-card); }
  :root:not([data-ui="classic"]) :is(.school-st, .about, .sync, .lic) :is(button, a).bg-brand {
    border-radius: 9999px; background-image: linear-gradient(to bottom, var(--color-brand), var(--color-brand-dark)); box-shadow: 0 8px 18px -10px var(--color-brand);
  }
  :root:not([data-ui="classic"]) :is(.school-st, .about, .sync, .lic) button.rounded-lg.border { border-radius: 9999px; }
  :root:not([data-ui="classic"]) :is(.school-st, .about, .sync, .lic) :is(input, select, textarea).rounded-lg { border-radius: 0.85rem; }
}
/* Page titles: large and plain; the page icon is hidden (the sidebar already shows it). */
@media screen {
  :root:not([data-ui="classic"]) :is(.school-st, .about, .sync) main h1 > svg:first-child { display: none; }
  :root:not([data-ui="classic"]) :is(.school-st, .about, .sync) main h1 { font-size: 1.75rem; line-height: 1.2; letter-spacing: -0.01em; }
}
```

> العنوان `main h1` في الجديد كبير وبلا أيقونة (الأيقونة موجودة في القائمة)، وفي classic تعود الأيقونة في مربع ملوّن.
> **عدّل القوائم `:is(.school-st, .about, .sync, .lic)` لتشمل أصناف جذور محطات مشروعك** (القسم 10).

### 4.4 كتلة classic كاملة

هذه الكتلة تُعيد: الرموز القديمة (تيل)، ألوان كل محطة (`.st-*`)، ألوان المزامنة و«عن التطبيق»، عنوان الصفحة بأيقونة، والأصناف المشتركة.
**في المشاريع الأخرى: غيّر الأرقام لتطابق ألوان المشروع الأصلية (اقرأها من `@theme` قبل تعديله)، وأسماء `.st-*` لتطابق محطاتك:**

```css
/* ════════ Classic look (the design before the green dashboard style) — chosen on the welcome page ════════ */
:root[data-ui="classic"] {
  --color-brand: #0d9488; --color-brand-dark: #0f766e; --color-brand-light: #f0fdfa;
  --color-ink: #0f172a; --color-muted: #64748b; --color-line: #e2e8f0; --color-surface: #ffffff; --color-canvas: #f8fafc;
  --shadow-card: 0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06); --shadow-pop: 0 10px 30px rgba(15, 23, 42, 0.12);
}
:root[data-ui="classic"][data-theme="dark"] {
  --color-brand: #2dd4bf; --color-brand-dark: #14b8a6; --color-brand-light: #0b3b36;
  --color-ink: #e2e8f0; --color-muted: #94a3b8; --color-line: #1e293b; --color-surface: #111c30; --color-canvas: #0b1220;
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.4); --shadow-pop: 0 10px 30px rgba(0, 0, 0, 0.55);
}
:root[data-ui="classic"][data-theme="dark"] :is(.school-st, .about, .sync) :is(.bg-brand, .from-brand).text-white { color: #0f172a; }
:root[data-ui="classic"] .st-setup { --color-brand: #0d9488; --color-brand-dark: #0f766e; --color-brand-light: #f0fdfa; }
:root[data-ui="classic"][data-theme="dark"] .st-setup { --color-brand: #2dd4bf; --color-brand-dark: #14b8a6; --color-brand-light: #0b3b36; }
:root[data-ui="classic"] .st-students { --color-brand: #2563eb; --color-brand-dark: #1d4ed8; --color-brand-light: #eff6ff; }
:root[data-ui="classic"][data-theme="dark"] .st-students { --color-brand: #60a5fa; --color-brand-dark: #3b82f6; --color-brand-light: #172554; }
:root[data-ui="classic"] .st-classes { --color-brand: #d97706; --color-brand-dark: #b45309; --color-brand-light: #fffbeb; }
:root[data-ui="classic"][data-theme="dark"] .st-classes { --color-brand: #fbbf24; --color-brand-dark: #f59e0b; --color-brand-light: #451a03; }
:root[data-ui="classic"] .st-teachers { --color-brand: #0284c7; --color-brand-dark: #0369a1; --color-brand-light: #f0f9ff; }
:root[data-ui="classic"][data-theme="dark"] .st-teachers { --color-brand: #38bdf8; --color-brand-dark: #0ea5e9; --color-brand-light: #082f49; }
:root[data-ui="classic"] .st-results { --color-brand: #059669; --color-brand-dark: #047857; --color-brand-light: #ecfdf5; }
:root[data-ui="classic"][data-theme="dark"] .st-results { --color-brand: #34d399; --color-brand-dark: #10b981; --color-brand-light: #022c22; }
:root[data-ui="classic"] .st-leaves { --color-brand: #e11d48; --color-brand-dark: #be123c; --color-brand-light: #fff1f2; }
:root[data-ui="classic"][data-theme="dark"] .st-leaves { --color-brand: #fb7185; --color-brand-dark: #f43f5e; --color-brand-light: #4c0519; }
:root[data-ui="classic"] .st-plan { --color-brand: #4f46e5; --color-brand-dark: #4338ca; --color-brand-light: #eef2ff; }
:root[data-ui="classic"][data-theme="dark"] .st-plan { --color-brand: #818cf8; --color-brand-dark: #6366f1; --color-brand-light: #1e1b4b; }
:root[data-ui="classic"] .st-attendance { --color-brand: #ea580c; --color-brand-dark: #c2410c; --color-brand-light: #fff7ed; }
:root[data-ui="classic"][data-theme="dark"] .st-attendance { --color-brand: #fb923c; --color-brand-dark: #f97316; --color-brand-light: #431407; }
:root[data-ui="classic"] .st-fees { --color-brand: #65a30d; --color-brand-dark: #4d7c0f; --color-brand-light: #f7fee7; }
:root[data-ui="classic"][data-theme="dark"] .st-fees { --color-brand: #a3e635; --color-brand-dark: #84cc16; --color-brand-light: #1a2e05; }
:root[data-ui="classic"] .sync { --color-brand: #7c3aed; --color-brand-dark: #6d28d9; --color-brand-light: #f5f3ff; }
:root[data-ui="classic"][data-theme="dark"] .sync { --color-brand: #a78bfa; --color-brand-dark: #8b5cf6; --color-brand-light: #2e1065; }
:root[data-ui="classic"] .about { --color-brand: #9333ea; --color-brand-dark: #7e22ce; --color-brand-light: #faf5ff; }
:root[data-ui="classic"][data-theme="dark"] .about { --color-brand: #c084fc; --color-brand-dark: #a855f7; --color-brand-light: #3b0764; }
@media screen {
  :root[data-ui="classic"] :is(.school-st, .about, .sync) main h1:has(> svg:first-child) { gap: 0.75rem; }
  :root[data-ui="classic"] :is(.school-st, .about, .sync) main h1 > svg:first-child {
    box-sizing: content-box; width: 22px; height: 22px; padding: 11px; flex-shrink: 0; border-radius: 1rem; color: #fff;
    background: linear-gradient(135deg, var(--color-brand), var(--color-brand-dark)); box-shadow: 0 6px 16px -6px color-mix(in oklab, var(--color-brand) 70%, transparent);
  }
  :root[data-ui="classic"][data-theme="dark"] :is(.school-st, .about, .sync) main h1 > svg:first-child { color: #0f172a; }
  /* the new look's shared pieces, back to their classic shape */
  :root[data-ui="classic"] .ui-card { border-radius: 1rem; border: 1px solid var(--color-line); box-shadow: var(--shadow-card); }
  :root[data-ui="classic"] .ui-btn { border-radius: 0.5rem; background-image: none; box-shadow: none; }
  :root[data-ui="classic"] .ui-btn-primary { background: var(--color-brand); color: #fff; padding: 0.5rem 1rem; }
  :root[data-ui="classic"] .ui-btn-primary:hover { background: var(--color-brand-dark); filter: none; }
  :root[data-ui="classic"] .ui-btn-ghost { border: 1px solid var(--color-line); padding: 0.5rem 0.75rem; }
  :root[data-ui="classic"] .ui-inp { border-radius: 0.5rem; padding: 0.5rem 0.75rem; }
  :root[data-ui="classic"] .ui-admin-card { border: 2px solid #c4b5fd; border-radius: 1rem; box-shadow: var(--shadow-card); }
  :root[data-ui="classic"] .ui-admin-card:hover { border-color: #8b5cf6; }
  :root[data-ui="classic"] .ui-admin-icon { background: linear-gradient(135deg, #8b5cf6, #6d28d9); border-radius: 0.75rem; box-shadow: none; }
  :root[data-ui="classic"] .ui-admin-btn { background: #7c3aed; border-radius: 0.5rem; background-image: none; }
  :root[data-ui="classic"] .ui-station-card { border-radius: 1rem; border-width: 2px; border-style: solid; box-shadow: var(--shadow-card); }
  :root[data-ui="classic"] .ui-sync-card { border-color: #c4b5fd; }
  :root[data-ui="classic"] .ui-about-card { border-color: #d8b4fe; }
  :root[data-ui="classic"] .sync-hero-ok { background-image: linear-gradient(to left, #7c3aed, #4f46e5); }
}
/* each look shows only its own markup */
:root[data-ui="classic"] .ui-only-new { display: none !important; }
:root:not([data-ui="classic"]) .ui-only-classic { display: none !important; }
```

شرح الأصناف المساعدة (`ui-*`): كلها «علامات» تضيفها المكوّنات إلى عناصرها حتى يستطيع classic إعادة شكلها
(`ui.tsx` يضيف `ui-card` و`ui-btn ui-btn-primary` و`ui-btn ui-btn-ghost` و`ui-inp`؛ بطاقة لوحة الإدارة تحمل `ui-admin-card/icon/btn`؛
بطاقات صفحة الترحيب `ui-station-card`؛ هيرو المزامنة `sync-hero-ok`).

---

## 5. الإطار: `AppShell.tsx` ومحيطه

### 5.1 `StationFrame.tsx` (غلاف المحطة)

```tsx
// src/components/school/StationFrame.tsx
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
import { AppShell } from "./AppShell";

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
        <AppShell id={id}>{children}</AppShell>
      </LocalDataGate>
      <OfflineReady />
    </div>
  );
}
```


لاحظ: `className="school-st st-{id} ..."` — الصنف `st-<id>` هو ما يلوّن المحطة في classic. كل `layout.tsx` لمحطة هو سطرين:
`<StationFrame id="students">{children}</StationFrame>`.

### 5.2 `AppShell.tsx` الكامل

فيه: القائمة العائمة (القائمة + عام + بطاقة النسخة الاحتياطية)، الشريط العلوي (بحث، المظهر، التنبيهات، شارة المدرسة)،
تبويبات المحطة، **وفرع classic** في بداية الرسم الذي يعيد `AppSidebar` القديم + `<main className="p-4 md:p-7">`.

```tsx
// src/components/school/AppShell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard, BarChart3, Search, Bell, Menu, X, Sun, Moon, HelpCircle, RefreshCw, Home, Settings, Download, Check, ShieldCheck,
} from "lucide-react";
import { SCHOOL_STATIONS } from "@/lib/school/stations";
import { NAV, it } from "@/lib/school/nav";
import { AppSidebar, type SideSection } from "@/components/local/AppSidebar";
import { useUi } from "@/lib/local/ui";
import { THEME_KEYS } from "@/lib/local/theme";
import { getMode, setMode } from "@/components/local/LocalTheme";
import { getInfo, KIND_LABEL, type SchoolInfo } from "@/lib/school/store";
import { alerts, type Alerts } from "@/lib/school/stats";
import { exportBackup } from "@/lib/school/store";
import { downloadJson, todayYmd } from "@/lib/local/util";
import { cn } from "@/lib/utils";
import type { LicenseModule } from "@/lib/license/modules";
import { Palette } from "./Palette";

export type ShellId = Exclude<LicenseModule, "admin"> | "dashboard" | "sync";
const SHORT: Record<string, string> = { setup: "الإعداد", students: "الطلاب", classes: "الصفوف والجداول", teachers: "الكادر التدريسي", results: "النتائج والشهادات", leaves: "الإجازات والعطل", plan: "الخطة السنوية", attendance: "الحضور والغياب", fees: "الأقساط الشهرية" };

/** The app frame in the dashboard style: floating side menu, top bar (search, alerts, theme, school), page tabs, content. */
export function AppShell({ id, children }: { id: ShellId; children: ReactNode }) {
  const pathname = usePathname();
  const ui = useUi();
  const [open, setOpen] = useState(false); const [pal, setPal] = useState(false); const [bell, setBell] = useState(false);
  const [info, setInfo] = useState<SchoolInfo | null>(null); const [al, setAl] = useState<Alerts | null>(null); const [dark, setDark] = useState(false); const [saved, setSaved] = useState(false);
  const themeKey = id === "dashboard" ? THEME_KEYS.setup : THEME_KEYS[id];

  useEffect(() => { setOpen(false); setBell(false); setInfo(getInfo()); try { setAl(alerts()); } catch { setAl(null); } }, [pathname]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPal((p) => !p); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);
  useEffect(() => { const run = () => setDark(document.documentElement.getAttribute("data-theme") === "dark"); run(); const t = setInterval(run, 600); return () => clearInterval(t); }, []);

  const isOn = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const badge = (sid: string) => !al ? 0 : sid === "classes" ? al.conflicts : sid === "leaves" ? al.pendingLeaves : sid === "attendance" ? al.heavyAbsence : sid === "fees" ? al.lateFees : sid === "plan" ? al.latePlans : 0;
  const stations = SCHOOL_STATIONS.filter((s) => !(s.privateOnly && info && info.kind !== "private") || isOn(s.path));
  const tabs = id === "dashboard" ? [{ href: "/dashboard", label: "نظرة عامة", exact: true }, { href: "/dashboard/analytics", label: "التحليلات", exact: false }]
    : (NAV[id]?.flatMap((s) => s.items) ?? []).map((i) => ({ href: i.href, label: i.label, exact: !!i.exact }));
  const toggleTheme = () => { setMode(themeKey, dark ? "light" : "dark"); setDark(!dark); };
  const nItems = al?.items.length ?? 0;

  if (ui === "classic") {
    const st = SCHOOL_STATIONS.find((x) => x.id === id);
    const sections: SideSection[] = id === "dashboard"
      ? [{ title: "لوحة التحكم", items: [it("/dashboard", "نظرة عامة", "الطلاب والحضور والخطط", LayoutDashboard, true), it("/dashboard/analytics", "التحليلات", "الحضور والمقارنات", BarChart3)] }]
      : (NAV[id] ?? []).map((sec) => ({ ...sec, items: sec.items.filter((i) => i.href !== "/plan/board") }));
    return (
      <>
        <AppSidebar appName={id === "dashboard" ? "لوحة التحكم" : id === "sync" ? "محطة المزامنة" : st!.label} appTag={id === "sync" ? "بين حواسيب المدرسة" : "مدرسة · بلا إنترنت"}
          icon={id === "dashboard" ? LayoutDashboard : id === "sync" ? RefreshCw : st!.icon} sections={sections}
          footerNote={id === "sync" ? "تجمع بيانات المحطات (عدا ما تختاره للحاسوب وحده) بين حواسيب المدرسة نفسه فقط." : "البيانات محفوظة على هذا الجهاز ومشتركة مع باقي محطات المدرسة."} />
        <main className="min-w-0 flex-1 p-4 md:p-7 print:p-0">{children}</main>
      </>
    );
  }

  const link = (href: string, label: string, Icon: typeof Home, active: boolean, n = 0) => (
    <Link key={href} href={href} aria-current={active ? "page" : undefined}
      className={cn("relative flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-colors", active ? "font-bold text-ink" : "text-muted hover:bg-canvas hover:text-ink")}>
      {active && <span className="absolute inset-y-2 -start-3 w-1 rounded-e-full bg-brand" />}
      <Icon className={cn("size-[18px]", active && "text-brand")} />
      <span className="flex-1 truncate">{label}</span>
      {n > 0 && <span className="grid min-w-5 place-items-center rounded-md bg-brand-dark px-1.5 py-0.5 text-[10px] font-bold leading-none text-white tabular-nums">{n}</span>}
    </Link>
  );

  const menu = (
    <>
      <div className="flex items-center gap-3 px-3 pb-3 pt-1">
        <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-[0_8px_18px_-8px_var(--color-brand)]"><LayoutDashboard className="size-5" /></span>
        <div className="min-w-0 leading-tight"><div className="text-lg font-extrabold">سبير</div><div className="truncate text-[11px] text-muted">إدارة المدارس</div></div>
      </div>
      <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wide text-muted">القائمة</div>
      <nav className="flex flex-col gap-0.5">
        {link("/dashboard", "لوحة التحكم", LayoutDashboard, id === "dashboard")}
        {stations.map((s) => link(s.path, SHORT[s.id] ?? s.label, s.icon, id === s.id, badge(s.id)))}
      </nav>
      <div className="px-3 pb-1 pt-3 text-[11px] font-semibold tracking-wide text-muted">عام</div>
      <nav className="flex flex-col gap-0.5">
        {link("/setup/settings", "الإعدادات", Settings, pathname === "/setup/settings")}
        {link("/sync", "المزامنة", RefreshCw, id === "sync")}
        {link("/about", "المساعدة", HelpCircle, isOn("/about"))}
        {link("/welcome", "الصفحة الرئيسية", Home, false)}
      </nav>
      <div className="mt-auto pt-3">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e5530] to-[#06331c] p-3.5 text-white">
          <svg className="pointer-events-none absolute inset-0 size-full opacity-[0.12]" aria-hidden><defs><pattern id="wv" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M0 13 Q6.5 0 13 13 T26 13" fill="none" stroke="#fff" strokeWidth="1" /></pattern></defs><rect width="100%" height="100%" fill="url(#wv)" /></svg>
          <span className="relative grid size-8 place-items-center rounded-full bg-white/15"><ShieldCheck className="size-4" /></span>
          <div className="relative mt-2 text-sm font-bold leading-snug">نسخة احتياطية لبيانات المدرسة</div>
          <button onClick={() => { downloadJson(`school-backup-${todayYmd()}.json`, exportBackup()); setSaved(true); setTimeout(() => setSaved(false), 2500); }}
            className="relative mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-b from-[#1a8a50] to-[#0e6b3c] px-4 py-2 text-sm font-semibold text-white shadow-inner hover:brightness-110">
            {saved ? <><Check className="size-4" /> تم التنزيل</> : <><Download className="size-4" /> تنزيل النسخة</>}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div onClick={() => setOpen(false)} className={cn("no-print fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity md:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")} />
      <aside className={cn("no-print fixed inset-y-0 start-0 z-50 flex w-72 flex-col overflow-y-auto bg-surface p-4 shadow-[var(--shadow-pop)] transition-transform duration-200",
        "md:sticky md:top-4 md:z-auto md:m-4 md:h-[calc(100vh-2rem)] md:w-64 md:shrink-0 md:translate-x-0 md:rounded-[28px] md:shadow-[var(--shadow-card)]", open ? "translate-x-0" : "translate-x-full")}>
        <button onClick={() => setOpen(false)} aria-label="إغلاق القائمة" className="absolute end-3 top-3 grid size-8 place-items-center rounded-lg text-muted hover:bg-canvas md:hidden"><X className="size-4" /></button>
        {menu}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col md:py-4 md:pe-4">
        <header className="no-print sticky top-0 z-30 flex items-center gap-3 bg-canvas/85 px-4 py-3 backdrop-blur md:static md:mb-4 md:rounded-[28px] md:bg-surface md:px-5 md:py-3 md:shadow-[var(--shadow-card)]">
          <button onClick={() => setOpen(true)} aria-label="فتح القائمة" className="grid size-10 place-items-center rounded-full border border-line bg-surface md:hidden"><Menu className="size-5" /></button>
          <button onClick={() => setPal(true)} aria-label="بحث" className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full bg-canvas px-4 text-start text-sm text-muted md:max-w-md">
            <Search className="size-[18px] shrink-0" /><span className="flex-1 truncate">ابحث عن صفحة أو طالب أو مدرس…</span><kbd className="hidden rounded-md border border-line bg-surface px-1.5 text-[10px] sm:block" dir="ltr">⌘K</kbd>
          </button>
          <div className="ms-auto flex items-center gap-1.5">
            <button onClick={toggleTheme} aria-label="تبديل المظهر" className="grid size-10 place-items-center rounded-full text-muted hover:bg-canvas">{dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}</button>
            <div className="relative">
              <button onClick={() => setBell((b) => !b)} aria-label="التنبيهات" className="relative grid size-10 place-items-center rounded-full text-muted hover:bg-canvas"><Bell className="size-[18px]" />{nItems > 0 && <span className="absolute end-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-surface" />}</button>
              {bell && (
                <div className="absolute end-0 top-12 z-50 w-72 rounded-3xl border border-line bg-surface p-3 shadow-[var(--shadow-pop)]">
                  <div className="px-2 pb-2 text-sm font-bold">التنبيهات</div>
                  {nItems ? al!.items.map((i) => <Link key={i.href + i.text} href={i.href} className="block rounded-2xl px-3 py-2 text-sm hover:bg-canvas">{i.text}</Link>) : <p className="px-3 py-4 text-center text-sm text-muted">لا تنبيهات. كل شيء على ما يرام.</p>}
                </div>
              )}
            </div>
            <div className="ms-2 hidden items-center gap-3 sm:flex">
              <span className="grid size-10 place-items-center rounded-full bg-brand-light text-sm font-bold text-brand-dark">{(info?.name || "م").trim().slice(0, 1)}</span>
              <div className="leading-tight"><div className="max-w-40 truncate text-sm font-bold">{info?.name || "المدرسة"}</div><div className="text-[11px] text-muted">{info ? KIND_LABEL[info.kind] : ""}</div></div>
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 pb-6 md:px-1 print:p-0">
          {tabs.length > 1 && (
            <nav className="no-print mb-5 flex gap-1.5 overflow-x-auto pb-1" aria-label="صفحات المحطة">
              {tabs.map((t) => { const on = t.exact ? pathname === t.href : isOn(t.href);
                return <Link key={t.href} href={t.href} aria-current={on ? "page" : undefined} className={cn("shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors", on ? "bg-gradient-to-b from-brand to-brand-dark font-semibold text-white shadow-[0_6px_14px_-6px_var(--color-brand)]" : "text-muted hover:bg-surface hover:text-ink")}>{t.label}</Link>; })}
            </nav>
          )}
          {children}
        </main>
      </div>
      <Palette open={pal} onClose={() => setPal(false)} />
    </>
  );
}
```


ما يعتمد عليه:

- `NAV`/`it` من `src/lib/school/nav.ts`: خريطة `id ← أقسام[{title, items:[{href,label,hint,icon,exact}]}]`. **مصدر واحد** يغذّي: القائمة القديمة (`AppSidebar` يعرض الأقسام والوصف)، تبويبات الجديد (تسطيح العناصر)، والبحث ⌘K.
- `AppSidebar` (القديم) موجود أصلاً في مشاريعكم (`src/components/local/AppSidebar.tsx`) — **لا يُحذف**، فهو نصف classic.
- `alerts()` للتنبيهات والشارات: دالة تقرأ بيانات المشروع (في مشروعنا من `lib/school/stats.ts`). في المختبر/التوريد اكتب مقابلها (مثلاً: أصناف ناقصة، فحوص بانتظار الاعتماد…) أو احذف الجرس مؤقتاً.
- `exportBackup` + `downloadJson` للبطاقة الداكنة السفلية (نسخة احتياطية) — استبدلها بدالة النسخ الاحتياطي في مشروعك.
- العناصر التي لا ينبغي أن تظهر في classic لأنها لم تكن موجودة قديماً تُفلتر داخل فرع classic (عندنا `/plan/board`) ولوحة التحكم تظهر بقائمة بسيطة.

### 5.3 البحث ⌘K والرسوم

انسخ `Palette.tsx` و`charts.tsx` كما هما؛ الأول يقرأ الصفحات من `NAV` وسجلات (طلاب/مدرسون عندنا) — بدّل مصدر السجلات.
الرسوم مستقلة تماماً (SVG بلا مكتبات) وتأخذ ألوانها من `PALETTE` ومن أصناف `stroke-line` / `fill-muted`.

---

## 6. صفحة الترحيب والمبدّل

### 6.1 المبدّل `UiSwitch.tsx`

```tsx
// src/components/local/UiSwitch.tsx
"use client";

import { Check } from "lucide-react";
import { setUi, useUi, type UiMode } from "@/lib/local/ui";

/** Little pictures of the two looks: the new green dashboard style, and the classic one. */
function Preview({ mode }: { mode: UiMode }) {
  return mode === "new" ? (
    <svg viewBox="0 0 120 70" className="w-full rounded-xl" aria-hidden>
      <rect width="120" height="70" fill="#f2f5f3" /><rect x="86" y="6" width="28" height="58" rx="7" fill="#fff" /><rect x="90" y="12" width="20" height="3" rx="1.5" fill="#14733f" /><rect x="90" y="20" width="20" height="3" rx="1.5" fill="#cfd8d3" /><rect x="90" y="27" width="20" height="3" rx="1.5" fill="#cfd8d3" />
      <rect x="6" y="6" width="74" height="8" rx="4" fill="#fff" /><rect x="6" y="20" width="22" height="20" rx="6" fill="#14733f" /><rect x="31" y="20" width="22" height="20" rx="6" fill="#fff" /><rect x="56" y="20" width="24" height="20" rx="6" fill="#fff" />
      <rect x="6" y="44" width="46" height="20" rx="6" fill="#fff" /><rect x="56" y="44" width="24" height="20" rx="6" fill="#0e5530" />
    </svg>
  ) : (
    <svg viewBox="0 0 120 70" className="w-full rounded-xl" aria-hidden>
      <rect width="120" height="70" fill="#f8fafc" /><rect x="84" width="36" height="70" fill="#fff" stroke="#e2e8f0" /><rect x="90" y="8" width="8" height="8" rx="2" fill="#0d9488" /><rect x="101" y="9" width="14" height="3" rx="1.5" fill="#0f172a" />
      {[24, 36, 48].map((y, i) => <g key={y}><rect x="90" y={y} width="8" height="8" rx="2" fill={i === 0 ? "#0d9488" : "#e2e8f0"} /><rect x="101" y={y + 2} width="14" height="3" rx="1.5" fill="#94a3b8" /></g>)}
      <rect x="6" y="8" width="40" height="5" rx="2" fill="#0f172a" /><rect x="6" y="20" width="34" height="22" rx="4" fill="#fff" stroke="#e2e8f0" /><rect x="44" y="20" width="34" height="22" rx="4" fill="#fff" stroke="#e2e8f0" />
      <rect x="6" y="46" width="72" height="18" rx="4" fill="#fff" stroke="#e2e8f0" />
    </svg>
  );
}

export function UiSwitch() {
  const ui = useUi();
  const opts: { m: UiMode; label: string; hint: string }[] = [
    { m: "new", label: "الأخضر الجديد", hint: "قائمة عائمة، بطاقات مستديرة، لوحة تحكم" },
    { m: "classic", label: "التصميم القديم", hint: "كما كان قبل التصميم الجديد، بألوان المحطات" },
  ];
  return (
    <div role="radiogroup" aria-label="الثيم" data-testid="ui-switch" className="grid gap-3 sm:grid-cols-2">
      {opts.map((o) => {
        const on = ui === o.m;
        return (
          <button key={o.m} type="button" role="radio" aria-checked={on} onClick={() => setUi(o.m)}
            className={`rounded-2xl border-2 p-2.5 text-start transition-colors ${on ? "border-brand bg-brand-light" : "border-line hover:bg-canvas"}`}>
            <Preview mode={o.m} />
            <span className="mt-2 flex items-center gap-1.5 text-sm font-semibold">{on && <Check className="size-4 text-brand-dark" />}{o.label}</span>
            <span className="block text-[11px] leading-5 text-muted">{o.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
```


وفي `WelcomeFooter.tsx` داخل بطاقة «المظهر» بعد `<SiteThemeSwitch />`:

```tsx
<div className="mt-5 border-t border-line pt-4">
  <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><Palette className="size-4 text-brand-dark" /> الثيم (شكل التصميم)</div>
  <p className="mb-3 text-xs text-muted">اختر التصميم الأخضر الجديد، أو ارجع إلى التصميم القديم ليظهر المشروع كله كما كان. يُحفظ على هذا الجهاز.</p>
  <UiSwitch />
</div>
```

> في `Preview` رسمنا نموذجين SVG بسيطين؛ عدّلهما ليمثّلا شكل مشروعك الحقيقي القديم والجديد.

### 6.2 نمط «الشكلان معاً»

في `src/app/welcome/page.tsx` (مكوّن خادم) لا نعرف الثيم وقت الرسم، فنرسم الشكلين ونُخفي أحدهما بـ CSS:

- عناصر الجديد: `className="ui-only-new ..."`
- عناصر القديم: `className="ui-only-classic ..."`
- القواعد: `:root[data-ui="classic"] .ui-only-new {display:none!important}` و`:root:not([data-ui="classic"]) .ui-only-classic {display:none!important}`.

أمثلة: ترويسة الصفحة (شعار + عنوان) نسختان؛ بطاقة «لوحة التحكم» الكبيرة للجديد فقط؛ كل بطاقة محطة تحمل رقاقة وأيقونة وزراً بنسختين داخل **عنصر واحد**
(`LicensedLink`) مع الصنف `ui-station-card` + أصناف الحدود الملوّنة القديمة (`s.border`) — في classic تُعطى حدوداً بعرض 2px فتظهر ألوان `s.border`، وفي الجديد عرض الحدّ صفر فلا أثر لها.

> **اجعل ملف بيانات المحطات (`stations.ts`) يحمل حقولاً للشكلين:** `border, chip, grad, btn` (ألوان القديم بأصناف Tailwind كاملة كي يراها المترجم) و`tone` للشارات.

---

## 7. الصفحات ذات الهيكل المختلف (مثال: إدارة الرموز)

إدارة الرموز صفحة كبيرة بقائمتها وعنوان أقسامها الخاصين. الحل:

1. أبقِ **القائمة القديمة** كمكوّن `OwnerNavClassic` (انسخها من تاريخ git قبل إعادة التصميم أو من المشروع الأصلي) و**الجديدة** `OwnerNav` (قائمة عائمة: `md:sticky md:top-4 md:m-4 md:h-[calc(100vh-2rem)] md:rounded-[28px]`، عنصر نشط بخط عريض ومؤشر أخضر).
2. اختيار بمكوّن صغير:
   ```tsx
   function OwnerNavPick(props: React.ComponentProps<typeof OwnerNav>) {
     return useUi() === "classic" ? <OwnerNavClassic {...props} /> : <OwnerNav {...props} />;
   }
   ```
3. نفس الفكرة لعنوان القسم: `SectionTitle` يرجع `SectionTitleClassic` (أيقونة في مربع) عند classic.
4. جذر الصفحة `className="lic school-st ..."` ليستفيد من قواعد التفاعل و«الصفحات القديمة».

القاعدة: **أي مكوّن بنيته تتغيّر ⇒ نسختان + `useUi()`؛ أي مكوّن تتغيّر ألوانه/حدوده فقط ⇒ CSS**.

---

## 8. لوحة التحكم والتحليلات (اختياري لكنه جزء من «الشكل الجديد»)

صفحتان في `src/app/dashboard/` (layout بـ `AppShell id="dashboard"`), و`DashboardView` مكوّن قابل لإعادة الاستعمال (له خاصية `portal` لتعطيل الروابط).
تعتمد على `charts.tsx` وعلى دوال إحصاء خاصة بالمشروع (`lib/school/stats.ts`). في المختبر مثلاً: فحوص اليوم، أصناف ناقصة، وقت إنجاز النتائج؛
في التوريد: طلبات، موردون، مخزون، مبيعات. **ابنِ مؤشرات مشروعك بنفس الهيكل** (4 بطاقات KPI أولاها داكنة، صف رسوم، صف قوائم، بطاقة داكنة أخيرة).
في classic تبقى الصفحتان متاحتين لكن بقائمة قديمة بسيطة وبلا بطاقة في الترحيب.

مواصفات التصميم (لتبقى النتيجة قريبة من المرجع):

- خلفية الصفحة `--color-canvas` رمادي أخضر فاتح؛ البطاقات `rounded-3xl` بيضاء بلا حدّ مع `--shadow-card`.
- البطاقة الأولى: تدرّج `#14733f → #0b4527` ونص أبيض ودائرة سهم بيضاء؛ أرقام KPI بحجم `text-5xl font-extrabold`.
- الأزرار: الرئيسي حبّة بتدرّج عمودي `brand → brand-dark` وظلّ لون؛ الثانوي حبّة بحدّ `border-ink/15`.
- القائمة الجانبية: بطاقة بيضاء `rounded-[28px]`، عنصر نشط بخط عريض ومؤشر أخضر عمودي على الحافة وشارة داكنة بعدد.
- الشريط العلوي: بطاقة مستديرة فيها حقل بحث حبّة + أزرار دائرية + شارة المستخدم.
- التبويبات: حبّات؛ النشط تدرّج أخضر بنص أبيض.
- تصحيح RTL: القائمة تظهر يميناً تلقائياً (أول عنصر في flex).

---

## 9. خطوات التنفيذ (بالترتيب)

1. **اقرأ مشروعك**: اعثر على `globals.css` (القيم الأصلية لـ `@theme` والداكنة)، القائمة الجانبية الحالية (`AppSidebar`)، صفحة الترحيب، ملف تسجيل المحطات، والـ layouts. اسجّل الألوان الأصلية لكل محطة.
2. **انسخ** الملفات الجديدة من القسم 2 إلى مسارات مشروعك (غيّر `school` في أسماء المجلدات إن أردت، مثلاً `components/shell`).
3. **`ui.ts`**: انسخه، وغيّر `UI_KEY`. أضف `uiScript` إلى `<head>` في `layout.tsx`.
4. **`globals.css`**:
   1. انسخ قيم `@theme` و`:root[data-theme="dark"]` الأصلية إلى مكان مؤقت.
   2. استبدلها بالرموز الجديدة (القسم 4.1).
   3. ألصق قواعد التفاعل والـ«legacy» والـ«classic» (4.2–4.4) وعدّل: أسماء جذور المحطات في `:is(...)`، وألوان classic لتساوي المحفوظة في الخطوة 1، و`.st-*` لمحطاتك.
5. **`nav.ts`**: ابنِ `NAV` من قائمتك الجانبية الحالية (انقل الأقسام والعناصر والأوصاف كما هي — هذا ما يضمن أن classic مطابق للأصل).
6. **`StationFrame`/`layout.tsx` لكل محطة**: ضع الصنف `school-st st-<id>` على الجذر واستبدل القائمة القديمة بـ `AppShell` (الذي يحتويها في classic).
7. **`AppShell`**: اضبط: مصدر `alerts()` والشارات، دالة النسخ الاحتياطي، عناصر القسم «عام» (إعدادات/مساعدة/مزامنة…)، شعار التطبيق، وفلتر عناصر لا تظهر في classic.
8. **الأصناف المشتركة**: أضف علامات `ui-card/ui-btn/ui-inp` إلى ثوابت الأصناف الموجودة (أو مكوّنات الأزرار والبطاقات) إن كان للمشروع مثلها.
9. **صفحة الترحيب**: عدّلها بنمط الشكلين (القسم 6.2) وأضف `UiSwitch` إلى تذييلها.
10. **الصفحات ذات الهيكل الخاص** (إدارة الرموز وأي صفحة بقائمة أو ترويسة خاصة): القسم 7.
11. **لوحة التحكم** (اختيارية): القسم 8.
12. **اختبر**: القسم 11.

---

## 10. تكييف الأسماء حسب المشروع

### spir-lab-manager (المختبرات)

- المحطات الموجودة غالباً: `station` (المختبر) · `store`/`purchasing` (المخزن والمشتريات) · `training` · `qc` · `roster` · `sync` · `about` + لوحة الإدارة الكاملة.
- **ألوان classic الأصلية** (من الإصدار الذي أُخذ منه مشروع المدارس): الأساس تيل `#0d9488 / #0f766e / #f0fdfa`؛
  المختبر تيل · المخزن كهرماني `#d97706` · التدريب نيلي `#4f46e5` · الجودة وردي `#e11d48` · الكادر سماوي `#0284c7` · المزامنة بنفسجي `#7c3aed` · عن التطبيق أرجواني `#9333ea`.
  (الداكنة: 2dd4bf / fbbf24 / 818cf8 / fb7185 / 38bdf8 / a78bfa / c084fc.)
- أصناف الجذور في CSS كانت `.station, .store, .training, .qc, .roster, .about, .sync` — ضعها في القوائم `:is(...)` بدل `.school-st` أو أضف `school-st` لكل جذر (الأسهل).
- `PinStation`/`THEME_KEYS` و`lib/local/theme.ts` موجودة؛ لا تغيّرها.
- لوحة التحكم المقترحة: فحوص اليوم، نتائج بانتظار الاعتماد، أصناف ناقصة/قرب الانتهاء، إيراد اليوم، أحدث المرضى.
- لوحة الإدارة الكاملة (الإنترنت) في المختبر ليست `/portal` بل صفحات `/patients` و`/orders`… بتخطيط `Sidebar/Topbar` الخاص بها: طبّق عليها نفس مبدأ «الصفحات القديمة تلبس الجديد» بإضافة `school-st` لجذر تخطيطها.

### spir-supply-manager (التوريد)

- لم يُفحص كوده هنا؛ **ابدأ بالخطوة 1** (استكشاف: أين `@theme`، ما القائمة الجانبية، ما صفحة الترحيب إن وُجدت، ما المحطات).
- إن لم يكن فيه محطات محلية بل تطبيق واحد بقائمة جانبية: اعتبر الإطار كله «محطة» واحدة (`id="app"`) واجعل `NAV` أقسام تطبيقه.
- إن لم يكن فيه صفحة ترحيب: ضع `UiSwitch` في صفحة الإعدادات (تبويب «المظهر») بدل التذييل.
- لوحة التحكم: مبيعات/مشتريات الفترة، أصناف تحت الحد الأدنى، فواتير غير مسددة، أفضل الموردين/العملاء — بنفس الهيكل.

---

## 11. التحقق (يُنفَّذ في كل مشروع)

1. `npx tsc --noEmit` ثم `npm run build` بلا أخطاء.
2. شغّل الخادم وافتح الترحيب: بدّل الثيم من التذييل وتأكد:
   - الجديد: قائمة عائمة وتبويبات وبطاقات مستديرة.
   - القديم: **مطابق للمشروع قبل التعديل** (قارن بلقطة من الفرع الأصلي).
   - إعادة تحميل الصفحة تحافظ على الاختيار بلا وميض.
3. مرّ على كل المحطات والصفحات الكبيرة في الوضعين، **فاتح وغامق** وبعرض 390px (لا تمرير أفقي).
4. اختبار آلي: شغّل مسار الاختبار الحالي مرتين، مرة افتراضياً ومرة بـ `ctx.addInitScript(() => localStorage.setItem("<UI_KEY>", "classic"))`.
   (في school-manager: `UI=classic node tests/e2e/school.flow.cjs`).
5. لقطات: `tests/e2e/seed.cjs` + `tests/e2e/shots.cjs` يملآن متصفحاً ببيانات واقعية ويلتقطان الصفحات (بدّل البيانات لمشروعك).

---

## 12. أخطاء شائعة تعلّمناها

- **عدم تطابق hydration**: لا تقرأ `localStorage` أثناء الرسم؛ استعمل `useUi()` (لقطة الخادم `new`) وارسم الأجزاء الحسّاسة داخل مكوّنات تُحمَّل بعد جاهزية البيانات.
- **تخصيص CSS**: قواعد classic يجب أن تبدأ بـ `:root[data-ui="classic"]` (0,2,0) وفي الداكن `:root[data-ui="classic"][data-theme="dark"]` وإلا غلبتها `:root[data-theme="dark"]`.
- **لا تضع `border-color` افتراضياً في classic لبطاقات لها أصناف حدود ملوّنة** وإلا تجاوزتها (CSS غير المُطبَّق في طبقة يغلب Tailwind).
- **الأصناف الديناميكية**: Tailwind لا يرى `border-${color}-300`; اكتب الأصناف كاملة في بيانات المحطات.
- **`useId` في SVG** للتدرجات كي لا تتعارض المعرّفات عند تكرار الرسم.
- **الطباعة**: الإطار الجديد يخفي نفسه بـ `no-print`؛ النوافذ القابلة للطباعة تحتاج `printable` (انظر `Modal` في `ui.tsx`) وإلا اختفى محتواها في الطباعة.
- **تعديل المنطق**: ثيم العرض لا يلمس التخزين ولا الاختبارات القائمة؛ إن انكسر اختبار بعد التطبيق فالسبب نصوص/محدّدات تغيّرت (استعمل `getByRole('heading')` لا `getByText` لأن شريط الجوال يكرّر اسم الصفحة).
- **الأيقونات في عناوين الصفحات**: في الجديد تُخفى بـ CSS (`main h1 > svg:first-child{display:none}`)، فلا تحذفها من الصفحات.

---

## 13. قائمة تدقيق سريعة

- [ ] `uiScript` في `<head>` وقبله لا شيء يعتمد على الثيم.
- [ ] رموز جديدة في `@theme` + داكنة، وقيم المشروع الأصلية منسوخة إلى كتلة classic (فاتح وداكن).
- [ ] `.st-*` لكل محطة في classic بألوانها الأصلية.
- [ ] `AppShell` فيه فرع classic يرجع `AppSidebar` الأصلي بنفس الأقسام.
- [ ] صفحة الترحيب بالشكلين و`UiSwitch` تحت «المظهر».
- [ ] صفحات بهيكل خاص لها نسختان.
- [ ] مراجعة: فاتح/غامق × جديد/قديم × سطح مكتب/هاتف.
