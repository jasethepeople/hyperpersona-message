# Browser QA Notes

## 2026-08-20 — Initial foundation check

- Production build completed successfully after the rebuilt application was written.
- The development URL returned the expected document title, **HyperPersona — Content Operations**. The initial visual capture was blank while the application was settling.
- DOM inspection confirmed that the landing page had rendered all expected content and loaded the Vite client bundle.
- A subsequent rendered view confirmed the full Signal Ledger landing page, including the hero artwork, plan cards, navigation, access entry point, and local-prototype disclosure. No browser-console error was emitted during this check.

## 2026-08-20 — Local access workflow

The **Access workspace** entry point routed correctly to `/access`. The registration form rendered its browser-local disclosure and accepted a display name, email address, and non-sensitive local demonstration password. The next check is form submission and allocation display in the authenticated workspace.

The registration submit action routed to `/overview`, displayed the newly entered profile details, and initialized the Free allocation at **100 local demonstration credits**. The Plans & credits page also rendered all four tiers and clearly stated that selecting a tier does not open checkout, charge a card, or create a real subscription.

Selecting **Starter** changed the local allocation from 100 to **1,000 credits**, moved the selected-state indicator to Starter, and displayed an explicit no-payment toast. The Content Studio then loaded with the required prompt field, text/image/video choices, a three-credit local text-draft disclosure, and a clear statement that image and video requests are recorded rather than generated while no provider is connected.

## 2026-08-20 — Prompt-aware content flow

The Studio accepted the test prompt, **“Introduce the new campaign review checklist to trial teams who have not invited a teammate yet.”** Creating a local text draft placed that exact prompt in both the draft heading and copy body, reduced local credits from 1,000 to **997**, and showed a transparent confirmation that the result is a local, prompt-aware prototype draft. No claim of an external model call was made.

Saving the text draft routed correctly to the Content library and displayed the saved prompt-aware item with a local-storage boundary notice. Returning to the Studio restored the default clean brief state without masking the provider and credit limitations.

## 2026-08-20 — Media-provider boundary

Selecting **Video** changed the primary action from “Create local text draft” to **“Record video request.”** The requested prompt, **“A cat playing with a red toy in a sunny living room, 15 seconds, portrait social format,”** was accepted without any implication that an MP4 would be generated. The next check validates that submission retains this transparency and preserves the local credit balance.

Submitting that video request displayed **“Provider required — No generation request sent,”** repeated the exact requested prompt, confirmed that no video was produced, and preserved the 997-credit local balance. The Campaign register rendered three local planning records and an explicit distribution guardrail explaining that the prototype cannot send content or collect customer data.

## 2026-08-20 — Campaign workflow

The Campaign register’s **New campaign** action revealed the local planning form without suggesting that a campaign would be launched. The form accepted the working title **“Activation checklist / Q4”** and kept the channel choice explicit; the next step validates local record creation.

The form created a fourth record, **Activation checklist / Q4**, with a visible Draft state, unassigned audience, zero readiness, and a confirmation that nothing was scheduled or distributed. The Audience ledger then rendered the explanatory no-scraping/no-customer-data statement, three illustrative local segments, and the local segment-rule form.

The Audience ledger accepted **Checklist adopters** with the explicit plain-language rule **“Viewed campaign checklist twice in the last 14 days.”** Saving created a Draft segment with zero illustrative people and confirmed that no customer-data query occurred.

## 2026-08-20 — Insights and workspace controls

The Insights view rendered an illustrative bar chart and sample metrics while directly stating that no live attribution, warehouse, CRM, predictive scoring, or analytics connection exists. Settings displayed the local workspace profile as well as distinct status rows for local browser data, an unconnected AI provider, and an unconnected payment processor; the example email toggle is labeled as non-sending UI.

## 2026-08-20 — Final verification

`pnpm check` completed with no TypeScript errors, and `pnpm build` completed successfully. The production build reported only a non-blocking client-bundle-size recommendation. The browser console did not show a runtime application error during workflow testing. Reloading `/settings` retained the local Jordan Reed workspace profile, Starter selection, and 997 local-credit balance, confirming the intended browser-local persistence behavior.

## 2026-08-20 — Plans and credits enhancement

The enhanced Plans & credits page renders four detailed tier cards, each with a stage label, local-credit allocation, recommended use case, core features, and progressive workflow/review/reporting/support detail. An at-a-glance comparison table presents six capabilities across all tiers. Hovering the Starter card applies the planned elevation and detail reveal, while the browser-local payment boundary remains visible.

After the focus treatment was strengthened, programmatic focus on the Starter tier set its detail panel to an opacity of **1** and a maximum height of **230px**, confirming that the extended comparison information is available without mouse hover. Type checking and the production build both completed successfully after this change.

## 2026-08-20 — Mock checkout initial check

The updated Plans page renders paid-tier actions labeled **“Continue to mock checkout”** and the revised no-payment-data disclosure. The first Professional-plan click did not visibly display the dialog in the browser capture, so the next step is to inspect the live DOM and event behavior before considering the checkout flow verified.

Live DOM inspection confirmed that no checkout overlay or dialog was mounted after the initial click. A first direct-action diagnostic could not execute because it mistakenly used TypeScript syntax in the browser context; the next interaction test will use plain JavaScript.

The corrected direct DOM click found and triggered a paid-tier action, but no dialog mounted and no browser runtime error was emitted. The next diagnostic step is to inspect the rendered React event wiring and current source state rather than treating the flow as functional.

After allowing the React update to settle, the Professional checkout dialog mounted correctly. The rendered payment-preview state displays a browser-local checkout label, an explicit no-payment-data notice, fixed test-card and invoice-preview choices, the local workspace contact, and review/cancel actions.

The review step correctly displayed the selected fixed method, $800/month planning price, 10,000-credit local allocation, and explicit “Not connected” payment processing status. Simulating plan activation showed a confirmation state with a local reference, then changed the workspace to Professional with 10,000 browser-demo credits and a no-payment toast.

Using **Return to workspace** closed the confirmation dialog, routed to Overview, and retained the Professional local allocation. Returning to Plans & credits also preserved that local state and left paid-tier mock-checkout actions available for non-selected plans.

The Enterprise flow opened with the browser-local dialog labeled **“Prepare Enterprise.”** and rendered the Cancel action. The remaining check is cancellation: it must close the dialog while leaving the current Professional local allocation untouched.

Cancelling the Enterprise checkout closed the dialog and left the plan header, card selection, sidebar allocation, and available balance at **Professional · 10,000 credits**. The mock checkout now has verified payment-preview, review, confirmation, return, and cancellation paths.

## 2026-08-20 — Expanded confirmation detail

The paid-plan mock checkout opened normally after the expanded confirmation update, with its review action available. The next verification step is to complete the local flow and confirm the new credit, included-feature, operating-support, and local-only disclosure sections all render in the final state.

The final Professional confirmation rendered the full activation ledger: activated plan, 10,000 browser-demo credits, monthly and price previews, all included features, Workflow/Review/Reporting/Support details, the fixed local reference and test method, and an explicit local-only/no-live-entitlement disclosure. The modal remains scrollable, keeping the detailed confirmation usable on the current viewport.
