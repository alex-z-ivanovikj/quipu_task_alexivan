import { Locator, Page } from '@playwright/test';
import { NewCustomer } from '../data';

/** register.htm — the sign-up form. */
export class RegisterPage {
  readonly submit: Locator;
  readonly title: Locator;
  readonly rightPanel: Locator;

  constructor(private readonly page: Page) {
    this.submit = page.locator('input[type="submit"][value="Register"]');
    this.title = page.locator('#rightPanel h1.title');
    this.rightPanel = page.locator('#rightPanel');
  }

  async goto() {
    await this.page.goto('/parabank/register.htm');
  }

  field(id: string): Locator {
    // ids contain dots (customer.firstName), so use an attribute selector
    return this.page.locator(`[id="${id}"]`);
  }

  fieldError(id: string): Locator {
    return this.page.locator(`[id="${id}.errors"]`);
  }

  async fill(c: NewCustomer, confirmPassword = c.password) {
    await this.field('customer.firstName').fill(c.firstName);
    await this.field('customer.lastName').fill(c.lastName);
    await this.field('customer.address.street').fill(c.street);
    await this.field('customer.address.city').fill(c.city);
    await this.field('customer.address.state').fill(c.state);
    await this.field('customer.address.zipCode').fill(c.zipCode);
    await this.field('customer.phoneNumber').fill(c.phoneNumber);
    await this.field('customer.ssn').fill(c.ssn);
    await this.field('customer.username').fill(c.username);
    await this.field('customer.password').fill(c.password);
    await this.field('repeatedPassword').fill(confirmPassword);
  }

  async register(c: NewCustomer, confirmPassword?: string) {
    await this.fill(c, confirmPassword);
    await this.submit.click();
  }
}
