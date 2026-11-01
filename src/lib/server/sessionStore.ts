import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

export interface Session { token: string; refreshToken: string; expiresAt: number; idleUntil: number }
export interface SessionStore {
  get(id: string): Promise<Session | null>;
  set(id: string, session: Session, owner?: string): Promise<void>;
  delete(id: string): Promise<void>;
  lock(id: string, owner: string): Promise<boolean>;
  unlock(id: string, owner: string): Promise<void>;
}

// Development/tests only. Production requires a shared store.
export class MemorySessionStore implements SessionStore {
  private sessions = new Map<string, Session>();
  private locks = new Map<string, string>();
  async get(id: string) {
    const value = this.sessions.get(id);
    if (value && Math.min(value.expiresAt, value.idleUntil) > Date.now()) return { ...value };
    this.sessions.delete(id);
    return null;
  }
  async set(id: string, session: Session, owner?: string) {
    if (owner && this.locks.get(id) !== owner) throw new Error('Session lock lost');
    this.sessions.set(id, { ...session });
  }
  async delete(id: string) { this.sessions.delete(id); }
  async lock(id: string, owner: string) {
    if (this.locks.has(id)) return false;
    this.locks.set(id, owner);
    return true;
  }
  async unlock(id: string, owner: string) {
    if (this.locks.get(id) === owner) this.locks.delete(id);
  }
}

export class RedisSessionStore implements SessionStore {
  constructor(private url: string, private credential: string, private key: Buffer) {
    if (new URL(url).protocol !== 'https:' || key.length !== 32) throw new Error('Invalid session store configuration');
  }
  private name(id: string) { return `mystudents:session:${createHash('sha256').update(id).digest('hex')}`; }
  private async command(...args: (string | number)[]): Promise<unknown> {
    const response = await fetch(this.url, {
      method: 'POST', headers: { Authorization: `Bearer ${this.credential}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args), cache: 'no-store', signal: AbortSignal.timeout(5000), redirect: 'error',
    });
    if (!response.ok) throw new Error('Session store unavailable');
    const data = await response.json() as { result: unknown; error?: string };
    if (data.error) throw new Error('Session store command failed');
    return data.result;
  }
  private encrypt(session: Session) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const payload = Buffer.concat([cipher.update(JSON.stringify(session)), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), payload]).toString('base64');
  }
  async get(id: string): Promise<Session | null> {
    const value = await this.command('GET', this.name(id));
    if (typeof value !== 'string') return null;
    const bytes = Buffer.from(value, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', this.key, bytes.subarray(0, 12));
    decipher.setAuthTag(bytes.subarray(12, 28));
    const session = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString()) as Session;
    return Math.min(session.expiresAt, session.idleUntil) > Date.now() ? session : null;
  }
  async set(id: string, session: Session, owner?: string) {
    const ttl = Math.max(1, Math.ceil((Math.min(session.expiresAt, session.idleUntil) - Date.now()) / 1000));
    const value = this.encrypt(session);
    if (owner) {
      const result = await this.command('EVAL', "if redis.call('GET', KEYS[2]) ~= ARGV[1] then return 0 end redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3]); return 1", 2, this.name(id), `${this.name(id)}:lock`, owner, value, ttl);
      if (result !== 1) throw new Error('Session lock lost');
    } else await this.command('SET', this.name(id), value, 'EX', ttl);
  }
  async delete(id: string) { await this.command('DEL', this.name(id)); }
  async lock(id: string, owner: string) {
    return await this.command('SET', `${this.name(id)}:lock`, owner, 'NX', 'PX', 60000) === 'OK';
  }
  async unlock(id: string, owner: string) {
    await this.command('EVAL', "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0", 1, `${this.name(id)}:lock`, owner);
  }
}

const globalStore = globalThis as typeof globalThis & { myStudentsSessionStore?: SessionStore };
export function getSessionStore(): SessionStore {
  if (globalStore.myStudentsSessionStore) return globalStore.myStudentsSessionStore;
  const { SESSION_REDIS_REST_URL: url, SESSION_REDIS_REST_TOKEN: credential, SESSION_ENCRYPTION_KEY: key } = process.env;
  if (url && credential && key) globalStore.myStudentsSessionStore = new RedisSessionStore(url, credential, Buffer.from(key, 'base64'));
  else if (process.env.NODE_ENV !== 'production') globalStore.myStudentsSessionStore = new MemorySessionStore();
  else throw new Error('Production requires Redis REST credentials and a 32-byte SESSION_ENCRYPTION_KEY');
  return globalStore.myStudentsSessionStore;
}
