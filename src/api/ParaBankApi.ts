import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import {
  ACCOUNT_TYPE_CODE,
  Account,
  AccountType,
  BillPayResponse,
  Customer,
  LoanResponse,
  Payee,
  Transaction,
} from './types';

/** Direct REST service. Paths mirror the services_proxy spec (swagger.yaml). */
export const REST_BASE = '/parabank/services/bank';

const JSON_HEADERS = { Accept: 'application/json' };

/**
 * Thin typed wrapper over ParaBank's REST API.
 * Use `getRaw` / `postRaw` in negative tests to inspect status codes,
 * and the typed methods in happy-path tests.
 */
export class ParaBankApi {
  constructor(private readonly request: APIRequestContext) {}

  // ---------- raw calls (use in negative tests) ----------

  getRaw(path: string): Promise<APIResponse> {
    return this.request.get(`${REST_BASE}${path}`, { headers: JSON_HEADERS });
  }

  postRaw(path: string, params: Record<string, string | number> = {}, data?: unknown): Promise<APIResponse> {
    return this.request.post(`${REST_BASE}${path}`, {
      headers: JSON_HEADERS,
      params,
      ...(data !== undefined ? { data } : {}),
    });
  }

  // ---------- auth / customers ----------

  async login(username: string, password: string): Promise<Customer> {
    const res = await this.getRaw(`/login/${encodeURIComponent(username)}/${encodeURIComponent(password)}`);
    return this.json<Customer>(res);
  }

  async getCustomer(customerId: number): Promise<Customer> {
    return this.json<Customer>(await this.getRaw(`/customers/${customerId}`));
  }

  async updateCustomer(customerId: number, fields: Record<string, string>): Promise<string> {
    const res = await this.postRaw(`/customers/update/${customerId}`, fields);
    await this.expectOk(res);
    return res.text();
  }

  // ---------- accounts ----------

  async getAccounts(customerId: number): Promise<Account[]> {
    return this.json<Account[]>(await this.getRaw(`/customers/${customerId}/accounts`));
  }

  async getAccount(accountId: number): Promise<Account> {
    return this.json<Account>(await this.getRaw(`/accounts/${accountId}`));
  }

  async createAccount(customerId: number, type: AccountType, fromAccountId: number): Promise<Account> {
    const res = await this.postRaw('/createAccount', {
      customerId,
      newAccountType: ACCOUNT_TYPE_CODE[type],
      fromAccountId,
    });
    return this.json<Account>(res);
  }

  async transfer(fromAccountId: number, toAccountId: number, amount: number): Promise<string> {
    const res = await this.postRaw('/transfer', { fromAccountId, toAccountId, amount });
    await this.expectOk(res);
    return res.text();
  }

  async billPay(accountId: number, amount: number, payee: Payee): Promise<BillPayResponse> {
    const res = await this.postRaw('/billpay', { accountId, amount }, payee);
    return this.json<BillPayResponse>(res);
  }

  async deposit(accountId: number, amount: number): Promise<string> {
    const res = await this.postRaw('/deposit', { accountId, amount });
    await this.expectOk(res);
    return res.text();
  }

  async withdraw(accountId: number, amount: number): Promise<string> {
    const res = await this.postRaw('/withdraw', { accountId, amount });
    await this.expectOk(res);
    return res.text();
  }

  // ---------- transactions ----------

  async getTransactions(accountId: number): Promise<Transaction[]> {
    return this.json<Transaction[]>(await this.getRaw(`/accounts/${accountId}/transactions`));
  }

  async getTransaction(transactionId: number): Promise<Transaction> {
    return this.json<Transaction>(await this.getRaw(`/transactions/${transactionId}`));
  }

  async getTransactionsByAmount(accountId: number, amount: number): Promise<Transaction[]> {
    return this.json<Transaction[]>(await this.getRaw(`/accounts/${accountId}/transactions/amount/${amount}`));
  }

  /** date format: MM-DD-YYYY */
  async getTransactionsOnDate(accountId: number, onDate: string): Promise<Transaction[]> {
    return this.json<Transaction[]>(await this.getRaw(`/accounts/${accountId}/transactions/onDate/${onDate}`));
  }

  /** dates format: MM-DD-YYYY */
  async getTransactionsByDateRange(accountId: number, fromDate: string, toDate: string): Promise<Transaction[]> {
    return this.json<Transaction[]>(
      await this.getRaw(`/accounts/${accountId}/transactions/fromDate/${fromDate}/toDate/${toDate}`),
    );
  }

  /** month: 'All' | 'January'..; type: 'All' | 'Credit' | 'Debit' */
  async getTransactionsByMonthAndType(accountId: number, month: string, type: string): Promise<Transaction[]> {
    return this.json<Transaction[]>(
      await this.getRaw(`/accounts/${accountId}/transactions/month/${month}/type/${type}`),
    );
  }

  // ---------- loans ----------

  async requestLoan(customerId: number, amount: number, downPayment: number, fromAccountId: number) {
    const res = await this.postRaw('/requestLoan', { customerId, amount, downPayment, fromAccountId });
    return this.json<LoanResponse>(res);
  }

  // ---------- admin (private instance only) ----------

  async initializeDB(): Promise<void> {
    await this.expectOk(await this.postRaw('/initializeDB'));
  }

  async cleanDB(): Promise<void> {
    await this.expectOk(await this.postRaw('/cleanDB'));
  }

  // ---------- helpers ----------

  private async expectOk(res: APIResponse) {
    expect(res.status(), `${res.url()} -> ${await res.text()}`).toBe(200);
  }

  private async json<T>(res: APIResponse): Promise<T> {
    await this.expectOk(res);
    return (await res.json()) as T;
  }
}
