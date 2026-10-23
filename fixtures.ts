import { test as base, request as pwRequest } from '@playwright/test';
import { Account, Customer, ParaBankApi } from '../src/api';
import { NewCustomer, buildCustomer, registerViaForm } from '../src/data';

interface RegisteredCustomer {
  credentials: NewCustomer;
  customer: Customer;
  /** The CHECKING account ParaBank opens on registration. */
  primaryAccount: Account;
}

interface Fixtures {
  api: ParaBankApi;
  /** A brand-new customer per test, so tests never share data. */
  newCustomer: RegisteredCustomer;
}

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    await use(new ParaBankApi(request));
  },

  newCustomer: async ({ baseURL }, use) => {
    // Separate context so registration cookies do not leak into the test's own session.
    const ctx = await pwRequest.newContext({ baseURL });
    const credentials = buildCustomer();
    await registerViaForm(ctx, credentials);

    const api = new ParaBankApi(ctx);
    const customer = await api.login(credentials.username, credentials.password);
    const [primaryAccount] = await api.getAccounts(customer.id);

    await use({ credentials, customer, primaryAccount });
    await ctx.dispose();
  },
});

export { expect } from '@playwright/test';
