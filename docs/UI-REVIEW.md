# UI Review & Audit

**Audited:** 2026-08-22
**Baseline:** Abstract 6-pillar UI standards
**Screenshots:** Code-only audit (Dev server status unverified)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Some generic CTAs ("Save & Connect", "Submit Counter-Bid"), but mostly descriptive. |
| 2. Visuals | 3/4 | Proper use of Lucide icons, clear structural delineation. |
| 3. Color | 4/4 | Excellent token usage. Only 1 hardcoded color (`#090D16`) across the app. |
| 4. Typography | 2/4 | Heavy reliance on extreme weights (`bold` 182x, `extrabold` 47x). |
| 5. Spacing | 2/4 | Overuse of arbitrary values (`text-[10px]`, `text-[11px]`, `min-h-[48px]`). |
| 6. Experience Design | 1/4 | Complete absence of loading states, skeletons, and error boundaries. |

**Overall: 15/24**

---

## Top 3 Priority Fixes

1. **Implement Global Loading States** — *User Impact: Freezes during transitions* — Add a global `<Suspense>` boundary and generic loading skeletons for dashboard/lobby transitions.
2. **Remove Arbitrary Pixel Values** — *User Impact: Responsive scaling breaks* — Replace `text-[10px]` and `text-[11px]` with `text-xs` (configure Tailwind config to smaller `xs` if needed), and replace `min-h-[48px]` with standard spacing classes like `min-h-12`.
3. **Typography Weight Balance** — *User Impact: Visual fatigue* — Reduce the 180+ instances of `font-bold` and 47+ instances of `font-extrabold`. Use `medium` and `semibold` to create a smoother typographic hierarchy.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)
- General descriptive copy is excellent.
- Some generic labels remain: `Cancel` (SupabaseModal.tsx), `Submit Counter-Bid` (AuctionArena.tsx).
- Minimal handling of Empty States natively inside components beyond basic ternary operators.

### Pillar 2: Visuals (3/4)
- Good use of iconography (Lucide-react).
- Structured grid layouts provide clear focal points for the user.
- Could benefit from more micro-interactions on hover.

### Pillar 3: Color (4/4)
- Superb execution of Tailwind color scale.
- Only a single hardcoded color: `bg-[#090D16]` (Lobby.tsx:415).
- Rest of the app exclusively uses abstract design tokens (`bg-slate-900`, `text-indigo-400`, etc).

### Pillar 4: Typography (2/4)
- 9 distinct font sizes in use, which is slightly above the recommended 4-6 range for a tight design system.
- Extreme overuse of bolding: `font-bold` (182 usages), `font-extrabold` (47 usages), `font-semibold` (48 usages).
- `font-normal` and `font-medium` are barely used, meaning the baseline text weight is heavily skewed.

### Pillar 5: Spacing (2/4)
- Dozens of instances of arbitrary JIT pixel classes bypassing Tailwind's scale.
- Examples: `text-[10px]`, `text-[11px]`, `min-h-[48px]`, `min-h-[50px]`.
- This fractures the design system and breaks holistic scaling on different devices.

### Pillar 6: Experience Design (1/4)
- No `React.ErrorBoundary` wrappers found.
- Zero matches for `isLoading`, `loading`, `Spinner`, or `skeleton` indicating poor asynchronous state UX handling.
- App relies entirely on immediate state updates, which may cause jarring visual snaps.

---

## Files Audited
- `src/components/AuctionArena.tsx`
- `src/components/CompanyDashboard.tsx`
- `src/components/EvaluationModal.tsx`
- `src/components/Lobby.tsx`
- `src/components/QuoteBuilder.tsx`
- `src/components/RfqBoard.tsx`
- `src/components/SupabaseModal.tsx`
- `src/components/UserManualModal.tsx`
