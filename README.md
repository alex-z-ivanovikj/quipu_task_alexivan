# ParaBank QA automation

UI and REST tests for [ParaBank](https://parabank.parasoft.com/parabank/index.htm), Parasoft's demo banking app, written with [Playwright](https://playwright.dev) and TypeScript.

The tests run against a local Docker copy of ParaBank, so they own their data and can reset the database safely.


The app opens at <http://localhost:8080/parabank/index.htm>. The container takes 20 to 40 seconds to boot; the test run waits for it automatically.

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


## Project layout

```
docker-compose.yml          ParaBank container (ports 8080, 61616, 9001)
playwright.config.ts        projects: api, soap, ui
src/
  api/
    ParaBankApi.ts          typed REST client (/parabank/services/bank)
    types.ts                Customer, Account, Transaction, Payee, ... models
    utils.ts                cents() rounding, MM-DD-YYYY date helper
    index.ts                re-exports, so tests import from 'src/api'
  data/
    customerBuilder.ts      unique test customers
    registration.ts         register a customer via the HTML form
    index.ts
  pages/                    one page object per file
    LoginPanel.ts
    RegisterPage.ts
    AccountServicesMenu.ts
    AccountsOverviewPage.ts
    OpenAccountPage.ts
    TransferPage.ts
    index.ts
tests/fixtures.ts           `api` and `newCustomer` fixtures
tests/global-setup.ts       waits for ParaBank, optional DB reset
tests/api/                  customers, accounts, money movement, search, negative
tests/ui/                   registration, login, account services
```

## How the tests are designed

- **Every test gets its own customer.** The `newCustomer` fixture registers a fresh user through the HTML form (ParaBank has no REST endpoint for sign-up), then looks up its customer ID and first account through the API.
- **API arranges, UI acts, API verifies.** UI tests set up accounts through REST, drive only the feature under test in the browser, then check balances through REST.
- **Money assertions round to cents** to avoid floating-point noise.

## Notes and known gaps

- Selectors live in the page objects under `src/pages/`, one file per page. If a UI test fails on a locator, check that page's file first.
- Not yet covered: Bill Pay and Find Transactions UI forms, Update Contact Info UI, Bookstore SOAP services, WS-Security variants, and the Admin configuration matrix (data access modes, loan processors).
