import { FullConfig, request } from '@playwright/test';

/**
 * 1. Waits until ParaBank answers (the container takes ~20-40 s to boot).
 * 2. Optionally resets the database when INIT_DB=true.
 *    Never set INIT_DB against the shared public site.
 */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL ?? 'http://localhost:8080';
  const ctx = await request.newContext({ baseURL });

  const deadline = Date.now() + 120_000;
  let ready = false;
  while (Date.now() < deadline) {
    try {
      const res = await ctx.get('/parabank/index.htm', { timeout: 5_000 });
      if (res.ok()) {
        ready = true;
        break;
      }
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 3_000));
  }
  if (!ready) throw new Error(`ParaBank did not respond at ${baseURL} within 120 s`);

  if (process.env.INIT_DB === 'true') {
    if (baseURL.includes('parabank.parasoft.com')) {
      throw new Error('Refusing to reset the database on the shared public ParaBank site');
    }
    const res = await ctx.post('/parabank/services/bank/initializeDB');
    if (!res.ok()) throw new Error(`initializeDB failed: ${res.status()}`);
  }

  await ctx.dispose();
}
