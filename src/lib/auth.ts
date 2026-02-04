import rawCredentialsCsv from "@/data/LoginCredentials.csv?raw";

export type UserRole = "admin" | "operations" | (string & {});

export interface LoginCredential {
  username: string;
  password: string;
  role: UserRole;
}

export interface AuthSession {
  username: string;
  role: UserRole;
  issuedAt: string; // ISO string
}

const SESSION_STORAGE_KEY = "arabian_mills_session_v1";

let cachedCredentials: LoginCredential[] | null = null;

/**
 * Parse a single CSV row into fields.
 * Supports:
 * - quoted fields with escaped quotes ("")
 * - commas inside quotes
 * - CRLF line endings handled upstream
 */
function parseCsvRow(row: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const ch = row[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = row[i + 1];
        if (next === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ",") {
      out.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }

  out.push(cur);
  return out.map((s) => s.trim());
}

function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

export function getLoginCredentials(): LoginCredential[] {
  if (cachedCredentials) return cachedCredentials;

  const lines = rawCredentialsCsv
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) {
    cachedCredentials = [];
    return cachedCredentials;
  }

  const header = parseCsvRow(lines[0]).map((h) => h.toLowerCase());
  const idxUsername = header.indexOf("username");
  const idxPassword = header.indexOf("password");
  const idxRole = header.indexOf("role");

  if (idxUsername === -1 || idxPassword === -1 || idxRole === -1) {
    cachedCredentials = [];
    return cachedCredentials;
  }

  const creds: LoginCredential[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvRow(lines[i]);
    const username = row[idxUsername] ?? "";
    const password = row[idxPassword] ?? "";
    const role = (row[idxRole] ?? "") as UserRole;

    if (!username || !password || !role) continue;
    creds.push({ username, password, role });
  }

  cachedCredentials = creds;
  return cachedCredentials;
}

export function validateLogin(args: {
  identifier: string; // email or username field in UI
  password: string;
}): { ok: true; session: AuthSession } | { ok: false } {
  const identifier = normalizeIdentifier(args.identifier);
  const password = args.password;

  if (!identifier || !password) return { ok: false };

  const creds = getLoginCredentials();

  // For this mock auth, treat "email/username" as username match (case-insensitive).
  const match = creds.find((c) => normalizeIdentifier(c.username) === identifier);
  if (!match) return { ok: false };
  if (match.password !== password) return { ok: false };

  return {
    ok: true,
    session: {
      username: match.username,
      role: match.role,
      issuedAt: new Date().toISOString(),
    },
  };
}

export function setSession(session: AuthSession): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.username || !parsed?.role || !parsed?.issuedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function getCurrentUser(): AuthSession | null {
  return getSession();
}

export function login(identifier: string, password: string): { ok: true; session: AuthSession } | { ok: false } {
  const result = validateLogin({ identifier, password });
  if (!result.ok) return { ok: false };
  setSession(result.session);
  return result;
}

export function logout(): void {
  clearSession();
}


