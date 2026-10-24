import { APIRequestContext, expect } from '@playwright/test';
import { NewCustomer } from './customerBuilder';

/** Field names used by the register.htm form. */
export function toRegisterForm(c: NewCustomer): Record<string, string> {
  return {
    'customer.firstName': c.firstName,
    'customer.lastName': c.lastName,
    'customer.address.street': c.street,
    'customer.address.city': c.city,
    'customer.address.state': c.state,
    'customer.address.zipCode': c.zipCode,
    'customer.phoneNumber': c.phoneNumber,
    'customer.ssn': c.ssn,
    'customer.username': c.username,
    'customer.password': c.password,
    repeatedPassword: c.password,
  };
}

/**
 * ParaBank has no REST endpoint for registration, so we post the HTML form.
 * Registration also opens the customer's first CHECKING account.
 */
export async function registerViaForm(request: APIRequestContext, c: NewCustomer): Promise<void> {
  // GET first so the server issues a session cookie for the form post.
  await request.get('/parabank/register.htm');
  const res = await request.post('/parabank/register.htm', { form: toRegisterForm(c) });
  expect(res.ok(), `register failed with ${res.status()}`).toBeTruthy();
  const html = await res.text();
  expect(html, 'registration page did not confirm success').toContain('Your account was created successfully');
}
