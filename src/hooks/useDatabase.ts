/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useCallback, useEffect, useState } from "react";
import { schema } from "@/lib/db/schema";
import type { Database } from "@/lib/db/sql-wrapper";
import {
  closeDatabase,
  createDatabase,
  executeUpdate,
  exportDatabase,
  initSqlJs,
  queryOne,
  transaction
} from "@/lib/db/sql-wrapper";
import type { ChatSession } from "@/lib/types/session";

interface DatabaseStats {
  totalSessions: number;
  dateRange: {
    min: string;
    max: string;
  };
}

interface DatabaseHook {
  db: Database | null;
  isInitialized: boolean;
  error: Error | null;
  loadSessionsFromJSON: (jsonData: ChatSession[]) => Promise<number>;
  getDatabaseStats: () => DatabaseStats;
  clearDatabase: () => void;
}

const STORAGE_KEY = "livegraphs_db";

export function useDatabase(): DatabaseHook {
  const [db, setDb] = useState<Database | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize database
  useEffect(() => {
    const initDb = async () => {
      try {
        // Initialize sql.js with local files
        await initSqlJs();

        // Try to load existing database from localStorage
        const savedData = localStorage.getItem(STORAGE_KEY);
        let database: Database;

        if (savedData) {
          try {
            const dataArray = Uint8Array.from(atob(savedData), (c) => c.charCodeAt(0));
            database = await createDatabase(dataArray);
            console.log("Loaded existing database from localStorage");
          } catch (err) {
            console.warn("Failed to load saved database, creating new one", err);
            database = await createDatabase();
          }
        } else {
          database = await createDatabase();
        }

        // Initialize schema
        database.run(schema);

        setDb(database);
        setIsInitialized(true);
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setError(err instanceof Error ? err : new Error("Database initialization failed"));
      }
    };

    initDb();

    // Cleanup on unmount
    return () => {
      if (db) {
        closeDatabase(db);
      }
    };
  }, [db]);

  // Save database to localStorage
  const saveDatabase = useCallback(() => {
    if (!db) return;

    try {
      const data = exportDatabase(db);
      const base64 = btoa(String.fromCharCode.apply(null, Array.from(data)));
      localStorage.setItem(STORAGE_KEY, base64);
    } catch (err) {
      console.error("Failed to save database:", err);
    }
  }, [db]);

  // Insert a single session (internal helper)
  const insertSessionSync = useCallback(
    (session: ChatSession) => {
      if (!db) throw new Error("Database not initialized");

      // Calculate conversation duration in seconds
      const startTime = new Date(session.start_time).getTime();
      const endTime = new Date(session.end_time).getTime();
      const durationSeconds = Math.round((endTime - startTime) / 1000);

      // Insert session
      executeUpdate(
        db,
        `INSERT INTO sessions (
          session_id, start_time, end_time, ip_hash, country, language,
          sentiment, escalated, forwarded_hr, category, summary,
          conversation_duration_seconds, avg_response_time, total_messages,
          user_messages, total_tokens, cost_eur_cents, user_rating, source_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
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
          durationSeconds,
          session.messages.response_time.avg,
          session.messages.amount.total,
          session.messages.amount.user,
          session.messages.tokens,
          Math.round(session.messages.cost.eur.cent),
          session.user_rating || null,
          session.messages.source_url
        ]
      );

      // Insert messages
      session.transcript.forEach((msg) => {
        executeUpdate(
          db,
          `INSERT INTO messages (session_id, timestamp, role, content)
           VALUES (?, ?, ?, ?)`,
          [session.session_id, msg.timestamp, msg.role, msg.content]
        );
      });

      // Insert questions
      session.questions.forEach((question) => {
        executeUpdate(db, `INSERT INTO questions (session_id, question) VALUES (?, ?)`, [
          session.session_id,
          question
        ]);
      });
    },
    [db]
  );

  // Load sessions from JSON
  const loadSessionsFromJSON = useCallback(
    async (jsonData: ChatSession[]): Promise<number> => {
      if (!db) throw new Error("Database not initialized");

      let successCount = 0;

      await transaction(db, () => {
        // Clear existing data
        db.run("DELETE FROM messages");
        db.run("DELETE FROM questions");
        db.run("DELETE FROM sessions");

        // Insert new sessions
        for (const session of jsonData) {
          try {
            insertSessionSync(session);
            successCount++;
          } catch (err) {
            console.error(`Failed to insert session ${session.session_id}:`, err);
          }
        }
      });

      // Save to localStorage after successful load
      saveDatabase();

      return successCount;
    },
    [db, insertSessionSync, saveDatabase]
  );

  // Get database statistics
  const getDatabaseStats = useCallback((): DatabaseStats => {
    if (!db) {
      return {
        totalSessions: 0,
        dateRange: { min: "", max: "" }
      };
    }

    try {
      const stats = queryOne<{
        total_sessions: number;
        min_date: string | null;
        max_date: string | null;
      }>(
        db,
        `SELECT 
          COUNT(*) as total_sessions,
          MIN(DATE(start_time)) as min_date,
          MAX(DATE(start_time)) as max_date
        FROM sessions`
      );

      return {
        totalSessions: stats?.total_sessions || 0,
        dateRange: {
          min: stats?.min_date || "",
          max: stats?.max_date || ""
        }
      };
    } catch (err) {
      console.error("Error getting database stats:", err);
      return {
        totalSessions: 0,
        dateRange: { min: "", max: "" }
      };
    }
  }, [db]);

  // Clear database
  const clearDatabase = useCallback(() => {
    if (!db) return;

    try {
      db.run("DELETE FROM messages");
      db.run("DELETE FROM questions");
      db.run("DELETE FROM sessions");
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Error clearing database:", err);
    }
  }, [db]);

  return {
    db,
    isInitialized,
    error,
    loadSessionsFromJSON,
    getDatabaseStats,
    clearDatabase
  };
}
