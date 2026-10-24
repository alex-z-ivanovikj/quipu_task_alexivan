import { Locator, Page } from '@playwright/test';

/** openaccount.htm — open a new CHECKING or SAVINGS account. */
export class OpenAccountPage {
  readonly type: Locator;
  readonly fromAccount: Locator;
  readonly submit: Locator;
  readonly result: Locator;
  readonly newAccountId: Locator;

  constructor(private readonly page: Page) {
    this.type = page.locator('#type');
    this.fromAccount = page.locator('#fromAccountId');
    this.submit = page.locator('input[type="submit"][value="Open New Account"]');
    this.result = page.locator('#openAccountResult');
    this.newAccountId = page.locator('#newAccountId');
  }

  async goto() {
    await this.page.goto('/parabank/openaccount.htm');
  }

  async open(type: 'CHECKING' | 'SAVINGS') {
    await this.type.selectOption({ label: type });
    await this.submit.click();
  }

  async getNewAccountId(): Promise<number> {
    return Number(await this.newAccountId.innerText());
  }
}
