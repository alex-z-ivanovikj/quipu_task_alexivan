export interface NewCustomer {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  ssn: string;
  username: string;
  password: string;
}

/** Unique, readable test data. Usernames must be unique per ParaBank instance. */
export function buildCustomer(overrides: Partial<NewCustomer> = {}): NewCustomer {
  const suffix = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
  return {
    firstName: 'Test',
    lastName: `User${suffix}`,
    street: '1 Test Street',
    city: 'Skopje',
    state: 'MK',
    zipCode: '1000',
    phoneNumber: '070000000',
    ssn: `999-${suffix.slice(-6)}`,
    username: `qa_${suffix}`,
    password: 'Passw0rd!',
    ...overrides,
  };
}
