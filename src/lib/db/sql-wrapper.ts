/**
 * Type-safe wrapper for sql.js
 */

// Define sql.js types locally to avoid import issues
export interface Database {
  run(sql: string): void;
  prepare(sql: string): Statement;
  exec(sql: string): QueryExecResult[];
  export(): Uint8Array;
  close(): void;
  getRowsModified(): number;
}

export interface Statement {
  bind(values: unknown[]): void;
  step(): boolean;
  getAsObject(): Record<string, unknown>;
  free(): void;
  run(values?: unknown[]): void;
}

export interface QueryExecResult {
  columns: string[];
  values: unknown[][];
}

export interface SqlJsStatic {
  Database: new (data?: Uint8Array) => Database;
}

export type TypedDatabase = Database;

export interface SqlConfig {
  locateFile?: (file: string) => string;
}

let SQL: SqlJsStatic | null = null;
let initPromise: Promise<SqlJsStatic> | null = null;

/**
 * Initialize sql.js with local files for GitHub Pages compatibility
 */
export async function initSqlJs(config?: SqlConfig): Promise<SqlJsStatic> {
  // Return existing instance if already initialized
  if (SQL) return SQL;

  // Return existing promise if initialization is in progress
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (typeof window === "undefined") {
      throw new Error("sql.js can only be initialized in browser environment");
    }

    // For static hosting, load from our public directory
    const baseUrl =
      process.env.NODE_ENV === "production" ? `${window.location.origin}/sql-js` : "/sql-js";

    const defaultConfig: SqlConfig = {
      locateFile: (file: string) => `${baseUrl}/${file}`
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Load sql.js from script tag
    const script = document.createElement("script");
    script.src = `${baseUrl}/sql-wasm.js`;

    await new Promise<void>((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load sql.js"));
      document.head.appendChild(script);
    });

    // Access the global initSqlJs function
    const initSqlJsFunc = (
      window as Window & { initSqlJs?: (config: SqlConfig) => Promise<SqlJsStatic> }
    ).initSqlJs;
    if (!initSqlJsFunc) {
      throw new Error("initSqlJs not found on window");
    }

    SQL = await initSqlJsFunc(finalConfig);
    return SQL;
  })();

  return initPromise;
}

/**
 * Create a new database instance with type safety
 */
export async function createDatabase(data?: Uint8Array): Promise<TypedDatabase> {
  const sql = await initSqlJs();
  return new sql.Database(data) as TypedDatabase;
}

/**
 * Type-safe query execution
 */
export function executeQuery<T = Record<string, unknown>>(
  db: Database,
  query: string,
  params?: unknown[]
): T[] {
  const stmt = db.prepare(query);

  if (params) {
    stmt.bind(params);
  }

  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }

  stmt.free();
  return results;
}

/**
 * Type-safe single row query
 */
export function queryOne<T = Record<string, unknown>>(
  db: Database,
  query: string,
  params?: unknown[]
): T | null {
  const results = executeQuery<T>(db, query, params);
  return results[0] || null;
}

/**
 * Execute a query without returning results (INSERT, UPDATE, DELETE)
 */
export function executeUpdate(db: Database, query: string, params?: unknown[]): number {
  const stmt = db.prepare(query);

  if (params) {
    stmt.bind(params);
  }

  stmt.run();
  stmt.free();

  return db.getRowsModified();
}

/**
 * Transaction helper with automatic rollback on error
 */
export async function transaction<T>(db: Database, callback: () => T | Promise<T>): Promise<T> {
  db.run("BEGIN TRANSACTION");

  try {
    const result = await callback();
    db.run("COMMIT");
    return result;
  } catch (error) {
    db.run("ROLLBACK");
    throw error;
  }
}

/**
 * Export database to Uint8Array for persistence
 */
export function exportDatabase(db: Database): Uint8Array {
  return db.export();
}

/**
 * Close database and free resources
 */
export function closeDatabase(db: Database): void {
  db.close();
}
