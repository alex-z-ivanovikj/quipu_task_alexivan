import { test, expect } from '../fixtures';
import { buildCustomer } from '../../src/data';
import { RegisterPage } from '../../src/pages';

test.describe('Registration', () => {
  test('new customer can register and is logged in @smoke', async ({ page }) => {
    const reg = new RegisterPage(page);
    const c = buildCustomer();

    await reg.goto();
    await reg.register(c);

    await expect(reg.title).toHaveText(`Welcome ${c.username}`);
    await expect(reg.rightPanel).toContainText('Your account was created successfully. You are now logged in.');
  });

  test('every required field shows its own error when empty', async ({ page }) => {
    const reg = new RegisterPage(page);
    await reg.goto();
    await reg.submit.click();

    for (const id of [
      'customer.firstName',
      'customer.lastName',
      'customer.address.street',
      'customer.address.city',
      'customer.address.state',
      'customer.address.zipCode',
      'customer.ssn',
      'customer.username',
      'customer.password',
      'repeatedPassword',
    ]) {
      await expect(reg.fieldError(id), `no error shown for ${id}`).toBeVisible();
    }
  });

  test('mismatched password confirmation is rejected', async ({ page }) => {
    const reg = new RegisterPage(page);
    await reg.goto();
    await reg.register(buildCustomer(), 'NotTheSame1!');
    await expect(reg.fieldError('repeatedPassword')).toContainText('Passwords did not match');
  });

  test('duplicate username is rejected', async ({ page, newCustomer }) => {
    const reg = new RegisterPage(page);
    await reg.goto();
    await reg.register(buildCustomer({ username: newCustomer.credentials.username }));
    await expect(reg.fieldError('customer.username')).toContainText('This username already exists');
  });
});