import "server-only";
import { Pool, type PoolConfig, type QueryResultRow } from "pg";

declare global {
  // Reuse one pool per runtime instance to avoid excess DB connections.
  var pgPool: Pool | undefined;
}

function getPool() {
  if (globalThis.pgPool) {
    return globalThis.pgPool;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  const poolConfig: PoolConfig = {
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: { rejectUnauthorized: true },
  };

  const pool = new Pool(poolConfig);
  globalThis.pgPool = pool;

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  return getPool().query<T>(text, params);
}
