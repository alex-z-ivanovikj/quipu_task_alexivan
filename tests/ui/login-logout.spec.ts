import { test, expect } from '../fixtures';
import { AccountServicesMenu, LoginPanel } from '../../src/pages';

test.describe('Login and logout', () => {
  test('valid login opens Accounts Overview @smoke', async ({ page, newCustomer }) => {
    const login = new LoginPanel(page);
    await login.goto();
    await login.login(newCustomer.credentials.username, newCustomer.credentials.password);

    await expect(page).toHaveURL(/overview\.htm/);
    await expect(page.locator('#accountTable')).toContainText(String(newCustomer.primaryAccount.id));
  });

  test('wrong password shows an error', async ({ page, newCustomer }) => {
    const login = new LoginPanel(page);
    await login.goto();
    await login.login(newCustomer.credentials.username, 'wrong-password');
    await expect(login.error).toBeVisible();
  });

  test('empty credentials show an error', async ({ page }) => {
    const login = new LoginPanel(page);
    await login.goto();
    await login.submit.click();
    await expect(login.error).toContainText('Please enter a username and password');
  });

  test('logout ends the session', async ({ page, newCustomer }) => {
    const login = new LoginPanel(page);
    await login.goto();
    await login.login(newCustomer.credentials.username, newCustomer.credentials.password);
    await new AccountServicesMenu(page).logout();

    await page.goto('/parabank/overview.htm');
    await expect(login.username).toBeVisible();
    await expect(page.locator('#accountTable')).toHaveCount(0);
  });
});
