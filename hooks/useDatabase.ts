/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useCallback, useEffect, useState } from "react";
import type { ChatSession } from "@/lib/types/session";

// Type definitions for sql.js loaded from CDN
interface SqlJsStatic {
  Database: new (data?: ArrayLike<number> | Buffer | null) => SqlJsDatabase;
}

interface SqlJsDatabase {
  run(sql: string): void;
  exec(sql: string): Array<{ columns: string[]; values: unknown[][] }>;
  prepare(sql: string): SqlJsStatement;
  export(): Uint8Array;
  close(): void;
}

interface SqlJsStatement {
  run(params?: unknown[]): void;
  step(): boolean;
  get(params?: unknown[]): unknown[];
  getColumnNames(): string[];
  bind(params?: unknown[]): boolean;
  getAsObject(params?: unknown[]): Record<string, unknown>;
  free(): void;
}

declare global {
  interface Window {
    initSqlJs?: (config?: { locateFile?: (file: string) => string }) => Promise<SqlJsStatic>;
  }
}

type Database = SqlJsDatabase;
type SqlJsStaticType = SqlJsStatic;

let SQL: SqlJsStaticType | null = null;
let db: Database | null = null;

export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDb = async () => {
      // Ensure we're in the browser environment
      if (typeof window === "undefined") {
        return;
      }

      try {
        if (!SQL) {
          // Load sql.js from CDN to avoid webpack build issues
          // This approach completely bypasses webpack static analysis
          const script = document.createElement("script");
          script.src = "https://sql.js.org/dist/sql-wasm.js";

          // Wait for script to load
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
          });

          // Access the global initSqlJs function
          const initSqlJs = window.initSqlJs;
          if (!initSqlJs) {
            throw new Error("Failed to load sql.js from CDN");
          }

          SQL = await initSqlJs({
            // will load sql-wasm.wasm from sql.js.org CDN
            locateFile: (file: string) => `https://sql.js.org/dist/${file}`
          });
        }

        // guard against SQL being null after import
        if (SQL === null) {
          throw new Error("SQL.js failed to initialize");
        }
        const SQLStatic = SQL;

        // Try to load existing database from localStorage
        const savedDb = localStorage.getItem("livegraphs_db");
        if (savedDb && !db) {
          try {
            const data = Uint8Array.from(atob(savedDb), (c) => c.charCodeAt(0));
            db = new SQLStatic.Database(data);
          } catch (error) {
            console.error("Failed to load saved database:", error);
            db = new SQLStatic.Database();
          }
        } else if (!db) {
          db = new SQLStatic.Database();
        }

        // Load schema
        try {
          const schemaResponse = await fetch("/schema.sql");
          if (schemaResponse.ok) {
            const schema = await schemaResponse.text();
            db.run(schema);
          }
        } catch (error) {
          console.error("Failed to load schema:", error);
        }

        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize database");
        console.error("Database initialization error:", err);
      }
    };

    if (typeof window !== "undefined") {
      initDb();
    }
  }, []);

  const saveDatabase = useCallback(() => {
    if (!db) return;

    const data = db.export();
    const binary = String.fromCharCode(...new Uint8Array(data));
    localStorage.setItem("livegraphs_db", btoa(binary));
  }, []);

  const _insertSession = useCallback(
    async (session: ChatSession): Promise<void> => {
      if (!db) throw new Error("Database not initialized");

      const startTime = new Date(session.start_time);
      const endTime = new Date(session.end_time);
      const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      const stmt = db.prepare(`
      INSERT INTO sessions (
        session_id, start_time, end_time, ip_hash, country, language,
        sentiment, escalated, forwarded_hr, category, summary, user_rating,
        conversation_duration_seconds, total_messages, user_messages,
        avg_response_time, total_tokens, cost_eur_cents, source_url
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

      stmt.run([
        session.session_id,
        session.start_time,
        session.end_time,
        session.user.ip,
        session.user.country,
        session.user.language,
        session.sentiment,
        session.escalated ? 1 : 0,
        session.forwarded_hr ? 1 : 0,
        session.category,
        session.summary,
        session.user_rating || null,
        durationSeconds,
        session.messages.amount.total,
        session.messages.amount.user,
        session.messages.response_time.avg,
        session.messages.tokens,
        session.messages.cost.eur.cent,
        session.messages.source_url
      ]);
      stmt.free();

      // Insert transcript messages
      const msgStmt = db.prepare(
        "INSERT INTO messages (session_id, timestamp, role, content) VALUES (?, ?, ?, ?)"
      );

      session.transcript.forEach((msg) => {
        msgStmt.run([session.session_id, msg.timestamp, msg.role, msg.content]);
      });
      msgStmt.free();

      // Insert questions
      const qStmt = db.prepare("INSERT INTO questions (session_id, question) VALUES (?, ?)");

      session.questions.forEach((question) => {
        qStmt.run([session.session_id, question]);
      });
      qStmt.free();

      saveDatabase();
    },
    [saveDatabase]
  );

  // Need to define insertSessionSync before using it in loadSessionsFromJSON
  const insertSessionSync = useCallback((session: ChatSession): void => {
    if (!db) throw new Error("Database not initialized");

    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    const stmt = db.prepare(`
      INSERT INTO sessions (
        session_id, start_time, end_time, ip_hash, country, language,
        sentiment, escalated, forwarded_hr, category, summary, user_rating,
        conversation_duration_seconds, total_messages, user_messages,
        avg_response_time, total_tokens, cost_eur_cents, source_url
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run([
      session.session_id,
      session.start_time,
      session.end_time,
      session.user.ip,
      session.user.country,
      session.user.language,
      session.sentiment,
      session.escalated ? 1 : 0,
      session.forwarded_hr ? 1 : 0,
      session.category,
      session.summary,
      session.user_rating || null,
      durationSeconds,
      session.messages.amount.total,
      session.messages.amount.user,
      session.messages.response_time.avg,
      session.messages.tokens,
      session.messages.cost.eur.cent,
      session.messages.source_url
    ]);
    stmt.free();

    // Insert transcript messages
    const msgStmt = db.prepare(
      "INSERT INTO messages (session_id, timestamp, role, content) VALUES (?, ?, ?, ?)"
    );

    session.transcript.forEach((msg) => {
      msgStmt.run([session.session_id, msg.timestamp, msg.role, msg.content]);
    });
    msgStmt.free();

    // Insert questions
    const qStmt = db.prepare("INSERT INTO questions (session_id, question) VALUES (?, ?)");

    session.questions.forEach((question) => {
      qStmt.run([session.session_id, question]);
    });
    qStmt.free();
  }, []);

  const loadSessionsFromJSON = useCallback(
    async (jsonData: ChatSession[]): Promise<number> => {
      if (!db) throw new Error("Database not initialized");

      let successCount = 0;
      let transactionStarted = false;

      try {
        db.run("BEGIN TRANSACTION");
        transactionStarted = true;

        for (const session of jsonData) {
          try {
            // Don't use await inside transaction - sql.js is synchronous
            insertSessionSync(session);
            successCount++;
          } catch (error) {
            console.error(`Failed to insert session ${session.session_id}:`, error);
          }
        }

        db.run("COMMIT");
      } catch (error) {
        if (transactionStarted) {
          try {
            db.run("ROLLBACK");
          } catch (rollbackError) {
            console.error("Rollback failed:", rollbackError);
          }
        }
        throw error;
      }

      saveDatabase();
      return successCount;
    },
    [saveDatabase, insertSessionSync]
  );

  const getDatabaseStats = useCallback((): {
    totalSessions: number;
    dateRange: { min: string; max: string };
  } => {
    if (!db) return { totalSessions: 0, dateRange: { min: "", max: "" } };

    try {
      const result = db.exec(`
        SELECT 
          COUNT(*) as total,
          MIN(start_time) as min_date,
          MAX(start_time) as max_date
        FROM sessions
      `);

      if (!result || result.length === 0) {
        return { totalSessions: 0, dateRange: { min: "", max: "" } };
      }

      const row = result[0];
      if (!row.values || row.values.length === 0) {
        return { totalSessions: 0, dateRange: { min: "", max: "" } };
      }

      const [total, min_date, max_date] = row.values[0];

      return {
        totalSessions: Number(total) || 0,
        dateRange: {
          min: (min_date as string) || "",
          max: (max_date as string) || ""
        }
      };
    } catch (error) {
      console.error("Error getting database stats:", error);
      return { totalSessions: 0, dateRange: { min: "", max: "" } };
    }
  }, []);

  const clearDatabase = useCallback((): void => {
    if (!db) return;

    try {
      db.run("DELETE FROM sessions");
      db.run("DELETE FROM messages");
      db.run("DELETE FROM questions");
    } catch (error) {
      console.error("Error clearing database:", error);
    }

    localStorage.removeItem("livegraphs_db");
    saveDatabase();
  }, [saveDatabase]);

  return {
    isInitialized,
    error,
    loadSessionsFromJSON,
    getDatabaseStats,
    clearDatabase,
    // Export the database instance for advanced usage
    db
  };
}
