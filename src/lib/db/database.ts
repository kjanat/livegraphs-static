/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type initSqlJs from "sql.js";
import type { ChatSession } from "../types/session";
import { schema } from "./schema";

type Database = Awaited<ReturnType<typeof initSqlJs>>["Database"];
type SqlJsStatic = Awaited<ReturnType<typeof initSqlJs>>;

let SQL: SqlJsStatic | null = null;
let db: InstanceType<Database> | null = null;

// Initialize SQL.js with the WASM file
export async function initializeDatabase(): Promise<InstanceType<Database>> {
  if (db) return db;

  if (!SQL) {
    // Dynamic import to avoid SSR issues
    const initSqlJs = (await import("sql.js")).default;
    SQL = await initSqlJs({
      // Use CDN for WASM file to avoid bundling issues
      locateFile: (file) => `https://sql.js.org/dist/${file}`
    });
  }

  // Try to load existing database from localStorage first
  const savedDb = localStorage.getItem("livegraphs_db");
  if (savedDb) {
    try {
      const data = Uint8Array.from(atob(savedDb), (c) => c.charCodeAt(0));
      db = new SQL.Database(data);
      return db;
    } catch (error) {
      console.error("Failed to load saved database:", error);
      // Continue with new database
    }
  }

  // Create a new database
  db = new SQL.Database();

  // Load the schema
  try {
    db.run(schema);
  } catch (error) {
    console.error("Failed to load schema:", error);
    // Continue without schema - it will be created on first insert
  }

  return db;
}

// Save database to localStorage
export function saveDatabase(): void {
  if (!db) return;

  const data = db.export();
  const binary = String.fromCharCode(...new Uint8Array(data));
  localStorage.setItem("livegraphs_db", btoa(binary));
}

// Insert a chat session into the database
export async function insertSession(session: ChatSession): Promise<void> {
  if (!db) await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  // Calculate derived fields
  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);
  const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

  // Insert main session
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

  // Save to localStorage after each insert
  saveDatabase();
}

// Load sessions from JSON file
export async function loadSessionsFromJSON(jsonData: ChatSession[]): Promise<number> {
  if (!db) await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  let successCount = 0;

  // Wrap in transaction for performance
  db.run("BEGIN TRANSACTION");

  try {
    for (const session of jsonData) {
      try {
        await insertSession(session);
        successCount++;
      } catch (error) {
        console.error(`Failed to insert session ${session.session_id}:`, error);
      }
    }
    db.run("COMMIT");
  } catch (error) {
    db.run("ROLLBACK");
    throw error;
  }

  saveDatabase();
  return successCount;
}

// Get database statistics
export function getDatabaseStats(): {
  totalSessions: number;
  dateRange: { min: string; max: string };
} {
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
}

// Clear all data
export function clearDatabase(): void {
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
}
