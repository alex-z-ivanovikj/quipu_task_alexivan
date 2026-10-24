/** Data models returned by the ParaBank REST API (see swagger.yaml definitions). */

export type AccountType = 'CHECKING' | 'SAVINGS' | 'LOAN';

/** Numeric codes used by createAccount's newAccountType parameter. */
export const ACCOUNT_TYPE_CODE = { CHECKING: 0, SAVINGS: 1, LOAN: 2 } as const;

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  address: Address;
  phoneNumber: string;
  ssn: string;
}

export interface Account {
  id: number;
  customerId: number;
  type: AccountType;
  balance: number;
}

export interface Transaction {
  id: number;
  accountId: number;
  type: 'Credit' | 'Debit';
  date: number | string;
  amount: number;
  description: string;
}

export interface LoanResponse {
  responseDate: number | string;
  loanProviderName: string;
  approved: boolean;
  message?: string;
  accountId?: number;
}

export interface Payee {
  name: string;
  address: Address;
  phoneNumber: string;
  accountNumber: number;
}

export interface BillPayResponse {
  payeeName: string;
  amount: number;
  accountId: number;
}
