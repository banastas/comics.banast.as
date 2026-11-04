import { createSign } from 'node:crypto';

// Minimal Google Sheets v4 client authenticated with a service account. It
// signs the OAuth JWT with node:crypto so the sync needs no Google SDK.

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SHEETS_URL = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

export interface ServiceAccount {
  client_email: string;
  private_key: string;
}

export type CellValue = string | number | boolean | null;

export const parseServiceAccount = (json: string | undefined): ServiceAccount => {
  if (!json?.trim()) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not set. Add the service-account key JSON as a repository secret.');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON.');
  }
  const account = parsed as Partial<ServiceAccount>;
  if (typeof account.client_email !== 'string' || typeof account.private_key !== 'string') {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON must contain client_email and private_key.');
  }
  return { client_email: account.client_email, private_key: account.private_key };
};

const base64url = (value: string | Buffer) => Buffer.from(value).toString('base64url');

export const createAssertion = (account: ServiceAccount, nowSeconds = Math.floor(Date.now() / 1000)): string => {
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(JSON.stringify({
    iss: account.client_email,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  }));
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  return `${header}.${claims}.${signer.sign(account.private_key).toString('base64url')}`;
};

const failure = async (response: Response, action: string) => {
  const body = await response.text().catch(() => '');
  return new Error(`${action} failed with HTTP ${response.status}: ${body.slice(0, 500)}`);
};

export const getAccessToken = async (account: ServiceAccount): Promise<string> => {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: createAssertion(account),
    }),
  });
  if (!response.ok) throw await failure(response, 'Google token exchange');
  const { access_token: token } = await response.json() as { access_token?: string };
  if (!token) throw new Error('Google token exchange returned no access_token.');
  return token;
};

export class SheetsClient {
  private readonly token: string;
  private readonly spreadsheetId: string;

  constructor(token: string, spreadsheetId: string) {
    this.token = token;
    this.spreadsheetId = spreadsheetId;
  }

  private headers() {
    return { authorization: `Bearer ${this.token}`, 'content-type': 'application/json' };
  }

  /** Reads a range as unformatted values (numbers stay numbers, checkboxes stay booleans). */
  async getValues(range: string): Promise<CellValue[][]> {
    const url = `${SHEETS_URL}/${this.spreadsheetId}/values/${encodeURIComponent(range)}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`;
    const response = await fetch(url, { headers: this.headers() });
    if (!response.ok) throw await failure(response, `Reading ${range}`);
    const { values } = await response.json() as { values?: CellValue[][] };
    return values ?? [];
  }

  /** Writes several single-range updates in one request. */
  async batchUpdate(updates: { range: string; values: CellValue[][] }[]): Promise<void> {
    if (updates.length === 0) return;
    const url = `${SHEETS_URL}/${this.spreadsheetId}/values:batchUpdate`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ valueInputOption: 'RAW', data: updates }),
    });
    if (!response.ok) throw await failure(response, 'Writing IDs back to the sheet');
  }
}
