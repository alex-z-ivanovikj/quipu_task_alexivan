import { Locator, Page, expect } from '@playwright/test';

/** transfer.htm — move money between the customer's own accounts. */
export class TransferPage {
  readonly amount: Locator;
  readonly from: Locator;
  readonly to: Locator;
  readonly submit: Locator;
  readonly result: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.amount = page.locator('#amount');
    this.from = page.locator('#fromAccountId');
    this.to = page.locator('#toAccountId');
    this.submit = page.locator('input[type="submit"][value="Transfer"]');
    this.result = page.locator('#showResult');
    this.error = page.locator('#showError');
  }

  async goto() {
    await this.page.goto('/parabank/transfer.htm');
    // account dropdowns are filled by an async call after load
    await expect(this.from.locator('option').first()).toBeAttached();
  }

  async transfer(amount: string, fromId: number, toId: number) {
    await this.amount.fill(amount);
    await this.from.selectOption(String(fromId));
    await this.to.selectOption(String(toId));
    await this.submit.click();
  }
}
