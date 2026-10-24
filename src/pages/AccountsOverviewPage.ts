import { Locator, Page, expect } from '@playwright/test';

/** overview.htm — the list of the customer's accounts and balances. */
export class AccountsOverviewPage {
  readonly table: Locator;
  readonly accountLinks: Locator;

  constructor(private readonly page: Page) {
    this.table = page.locator('#accountTable');
    this.accountLinks = this.table.locator('tbody a');
  }

  async goto() {
    await this.page.goto('/parabank/overview.htm');
  }

  async waitForAccounts() {
    await expect(this.accountLinks.first()).toBeVisible();
  }
}
