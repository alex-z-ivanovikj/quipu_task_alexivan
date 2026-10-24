import { Locator, Page } from '@playwright/test';

/** Customer Login panel shown on the left of every public page. */
export class LoginPanel {
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.username = page.locator('input[name="username"]');
    this.password = page.locator('input[name="password"]');
    this.submit = page.locator('input[type="submit"][value="Log In"]');
    this.error = page.locator('#rightPanel .error');
  }

  async goto() {
    await this.page.goto('/parabank/index.htm');
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }
}
