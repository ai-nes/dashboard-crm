# Student campaign history

The Student detail **Tương tác → Chiến dịch** subtab, immediately after **Khác**, reads `GET /api/v1/students/:studentId/campaigns?page=1&pageSize=20` through the shared Nest client and the Better Auth session cookie. It uses the canonical Student identifier from the loaded detail record. Each page preserves the backend's newest-first order; page navigation requests the next backend page rather than truncating the history.

The tab requires effective Student read scope and `CRM Campaign` read permission, using `canReadStudentCampaigns` in the centralized permission module. Requests are enabled only for an active, authorized tab. Backend row authorization remains authoritative; forbidden queries use the shared `/access-denied` handler. Empty history, loading and errors have separate states; a failed request is never displayed as an empty history.

Rows show campaign title/code, status, registration time (Asia/Ho_Chi_Minh), optional channel and whether it is the original campaign. `timestampEstimated` is labeled “Thời gian ước tính”. The tab is read-only and provides refresh and pagination. It does not create a CRM Interaction or change the original acquisition campaign.

## Verification — 2026-10-11

- PASS: 44 tests across API transport/errors, permissions, tab selection, row metadata and tab loading/error/empty/pagination states; six related forbidden-redirect and Student projection regressions also passed (50 total).
- PASS: `npx tsc --noEmit`, focused ESLint and `git diff --check`.
- PASS: Orca browser in the user's Lead Sale session at `http://localhost:3000`, Student `HS-2026-HCM-002718` (Võ Khánh Linh). The tab displays both `CAM-2026-00005` (returning registration) and `CAM-2026-00001` (original campaign, estimated historical timestamp). Its history GET returned 200. The page resource log had no Student campaign-history request on initial overview load and showed the history request after selecting the tab.
- Screenshot retained locally at `../crm-backend/storage/backups/campaign-history-20261011/ui-campaign-tab.png` relative to the dashboard root. Existing test participation was reused; no additional registration was created for UI verification.

Pagination and denied/error/empty states were covered by automated tests; the live browser check used the two-record authorized profile. No commit or push was made.

The user's follow-up moved Campaigns from the main tab row into Interactions after Other, and gave returning participation a sky badge. Campaign access remains independent of the Interaction Type catalog grant. PASS: 15 focused tests, TypeScript, focused ESLint and Orca verification of the nested tab with both campaigns and participation badges. Updated screenshot: `../crm-backend/storage/backups/campaign-history-20261011/ui-campaign-nested-tab.png`.
