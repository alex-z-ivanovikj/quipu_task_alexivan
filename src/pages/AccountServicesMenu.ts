import { Locator, Page } from '@playwright/test';

/** Account Services menu in the left panel, shown after login. */
export class AccountServicesMenu {
  constructor(private readonly page: Page) {}

  link(name: string): Locator {
    return this.page.locator('#leftPanel').getByRole('link', { name });
  }

  async logout() {
    await this.link('Log Out').click();
  }
}
