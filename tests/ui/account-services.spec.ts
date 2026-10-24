import { test, expect } from '../fixtures';
import { cents } from '../../src/api';
import {
  AccountServicesMenu,
  AccountsOverviewPage,
  LoginPanel,
  OpenAccountPage,
  TransferPage,
} from '../../src/pages';

test.describe('Account services UI', () => {
  test.beforeEach(async ({ page, newCustomer }) => {
    const login = new LoginPanel(page);
    await login.goto();
    await login.login(newCustomer.credentials.username, newCustomer.credentials.password);
    await expect(page).toHaveURL(/overview\.htm/);
  });

  test('Overview lists every account returned by the API', async ({ page, api, newCustomer }) => {
    const { customer, primaryAccount } = newCustomer;
    const savings = await api.createAccount(customer.id, 'SAVINGS', primaryAccount.id);

    const overview = new AccountsOverviewPage(page);
    await overview.goto();
    await overview.waitForAccounts();
    await expect(overview.accountLinks).toHaveText([String(primaryAccount.id), String(savings.id)], {
      useInnerText: true,
    });
  });

  test('Transfer funds through the UI updates both balances @smoke', async ({ page, api, newCustomer }) => {
    const { customer, primaryAccount } = newCustomer;
    const savings = await api.createAccount(customer.id, 'SAVINGS', primaryAccount.id);
    const fromBefore = await api.getAccount(primaryAccount.id);

    const transfer = new TransferPage(page);
    await transfer.goto();
    await transfer.transfer('10.00', primaryAccount.id, savings.id);

    await expect(transfer.result).toContainText('Transfer Complete!');
    const fromAfter = await api.getAccount(primaryAccount.id);
    const toAfter = await api.getAccount(savings.id);
    expect(cents(fromAfter.balance)).toBe(cents(fromBefore.balance - 10));
    expect(cents(toAfter.balance)).toBe(cents(savings.balance + 10));
  });

  test('Open new account through the UI', async ({ page, api, newCustomer }) => {
    const openAccount = new OpenAccountPage(page);
    await new AccountServicesMenu(page).link('Open New Account').click();
    await openAccount.open('SAVINGS');

    await expect(openAccount.result).toContainText('Congratulations, your account is now open.');
    const newId = await openAccount.getNewAccountId();
    const account = await api.getAccount(newId);
    expect(account.type).toBe('SAVINGS');
    expect(account.customerId).toBe(newCustomer.customer.id);
  });

  test('Every account-services link opens its page', async ({ page }) => {
    const menu = new AccountServicesMenu(page);
    const pages: Array<[string, RegExp]> = [
      ['Open New Account', /openaccount\.htm/],
      ['Accounts Overview', /overview\.htm/],
      ['Transfer Funds', /transfer\.htm/],
      ['Bill Pay', /billpay\.htm/],
      ['Find Transactions', /findtrans\.htm/],
      ['Update Contact Info', /updateprofile\.htm/],
      ['Request Loan', /requestloan\.htm/],
    ];
    for (const [name, url] of pages) {
      await menu.link(name).click();
      await expect(page, `${name} did not open`).toHaveURL(url);
    }
  });
});
