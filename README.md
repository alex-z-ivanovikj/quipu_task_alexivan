# ParaBank QA automation

UI, REST and SOAP tests for [ParaBank](https://parabank.parasoft.com/parabank/index.htm), Parasoft's demo banking app, written with [Playwright](https://playwright.dev) and TypeScript.

The tests run against a local Docker copy of ParaBank, so they own their data and can reset the database safely.

## Prerequisites

- Node.js 20 or newer
- Docker Desktop (or any Docker engine with Compose)

## Quick start

```bash
npm install
npx playwright install chromium
npm run parabank:up        # starts parasoft/parabank on http://localhost:8080
npm test                   # runs api, soap and ui projects
npm run report             # opens the HTML report
```

Open the app at <http://localhost:8080/parabank/index.htm>. The container takes 20 to 40 seconds to boot; the test run waits for it automatically.

## Useful commands

| Command | What it runs |
| --- | --- |
| `npm run test:api` | REST tests only |
| `npm run test:soap` | SOAP tests only |
| `npm run test:ui` | Browser tests only |
| `npm run test:smoke` | Tests tagged `@smoke` across all layers |
| `npm run typecheck` | TypeScript compile check |
| `npm run parabank:down` | Stops the ParaBank container |

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `BASE_URL` | `http://localhost:8080` | ParaBank host, without `/parabank` |
| `INIT_DB` | unset | `true` resets the database before the run. Refused against the public site. |

To run read-only checks against the public site: `BASE_URL=https://parabank.parasoft.com npm run test:smoke`. Data there is shared and changes often, so expect occasional failures.

## Project layout

```
docker-compose.yml          ParaBank container (ports 8080, 61616, 9001)
playwright.config.ts        projects: api, soap, ui
src/api/parabankApi.ts      typed REST client (/parabank/services/bank)
src/data/customerFactory.ts unique test customers + registration helper
src/pages/pages.ts          page objects for the UI
tests/fixtures.ts           `api` and `newCustomer` fixtures
tests/global-setup.ts       waits for ParaBank, optional DB reset
tests/api/                  customers, accounts, money movement, search, negative
tests/soap/                 WSDL contract and REST/SOAP parity
tests/ui/                   registration, login, account services
.github/workflows/ci.yml    runs everything on push and pull request
```

## How the tests are designed

- **Every test gets its own customer.** The `newCustomer` fixture registers a fresh user through the HTML form (ParaBank has no REST endpoint for sign-up), then looks up its customer ID and first account through the API.
- **API arranges, UI acts, API verifies.** UI tests set up accounts through REST, drive only the feature under test in the browser, then check balances through REST.
- **Money assertions round to cents** to avoid floating-point noise.
- **Negative tests are expected to find defects.** ParaBank is deliberately lenient (for example, unauthenticated API reads). Those tests use soft assertions and annotations so the findings appear in the report.

## Notes and known gaps

- Selectors live in `src/pages/pages.ts`. If a UI test fails on a locator, check the markup there first.
- Exact error messages in the UI tests were written from ParaBank's standard pages; adjust the strings if your image version words them differently.
- Not yet covered: Bill Pay and Find Transactions UI forms, Update Contact Info UI, Bookstore SOAP services, WS-Security variants, and the Admin configuration matrix (data access modes, loan processors). See the QA breakdown doc for the full list.
