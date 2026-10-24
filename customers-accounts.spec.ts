import { test, expect } from '../fixtures';
import { cents } from '../../src/api';

test.describe('Customers and accounts API', () => {
  test('login returns the registered customer @smoke', async ({ api, newCustomer }) => {
    const { credentials, customer } = newCustomer;
    const again = await api.login(credentials.username, credentials.password);

    expect(again.id).toBe(customer.id);
    expect(again.firstName).toBe(credentials.firstName);
    expect(again.lastName).toBe(credentials.lastName);
    expect(again.address).toMatchObject({
      street: credentials.street,
      city: credentials.city,
      state: credentials.state,
      zipCode: credentials.zipCode,
    });
  });

  test('registration opens exactly one CHECKING account', async ({ api, newCustomer }) => {
    const accounts = await api.getAccounts(newCustomer.customer.id);
    expect(accounts).toHaveLength(1);
    expect(accounts[0].type).toBe('CHECKING');
    expect(accounts[0].customerId).toBe(newCustomer.customer.id);
    expect(accounts[0].balance).toBeGreaterThan(0);
  });

  test('GET /accounts/{id} matches the customer account list', async ({ api, newCustomer }) => {
    const account = await api.getAccount(newCustomer.primaryAccount.id);
    expect(account).toEqual(newCustomer.primaryAccount);
  });

  for (const type of ['CHECKING', 'SAVINGS'] as const) {
    test(`createAccount opens a ${type} account funded from the primary account`, async ({ api, newCustomer }) => {
      const { customer, primaryAccount } = newCustomer;

      const created = await api.createAccount(customer.id, type, primaryAccount.id);
      expect(created.type).toBe(type);
      expect(created.customerId).toBe(customer.id);

      const accounts = await api.getAccounts(customer.id);
      expect(accounts.map((a) => a.id)).toContain(created.id);

      // Money is conserved: what left the source landed in the new account.
      const source = await api.getAccount(primaryAccount.id);
      expect(cents(source.balance + created.balance)).toBe(cents(primaryAccount.balance));
    });
  }

  test('updateCustomer persists new contact details', async ({ api, newCustomer }) => {
    const { customer, credentials } = newCustomer;
    await api.updateCustomer(customer.id, {
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      street: '99 Updated Ave',
      city: 'Bitola',
      state: 'MK',
      zipCode: '7000',
      phoneNumber: '071111111',
      ssn: credentials.ssn,
      username: credentials.username,
      password: credentials.password,
    });

    const updated = await api.getCustomer(customer.id);
    expect(updated.address).toMatchObject({ street: '99 Updated Ave', city: 'Bitola', zipCode: '7000' });
    expect(updated.phoneNumber).toBe('071111111');
  });
});
