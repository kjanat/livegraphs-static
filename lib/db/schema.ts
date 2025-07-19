/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// SQLite schema for Notso AI
// This schema is designed to efficiently store and query chat session data
export const schema = `
-- Main sessions table
CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    ip_hash TEXT NOT NULL,
    country TEXT,
    language TEXT,
    sentiment TEXT CHECK(sentiment IN ('positive', 'neutral', 'negative')),
    escalated BOOLEAN DEFAULT 0,
    forwarded_hr BOOLEAN DEFAULT 0,
    category TEXT,
    summary TEXT,
    user_rating INTEGER,
    -- Computed fields for efficiency
    conversation_duration_seconds INTEGER,
    total_messages INTEGER,
    user_messages INTEGER,
    avg_response_time REAL,
    total_tokens INTEGER,
    cost_eur_cents INTEGER,
    source_url TEXT,
    -- Indexes for common queries
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transcript messages table
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    role TEXT CHECK(role IN ('User', 'Assistant')),
    content TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

-- Questions table (normalized)
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    question TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_end_time ON sessions(end_time);
CREATE INDEX IF NOT EXISTS idx_sessions_category ON sessions(category);
CREATE INDEX IF NOT EXISTS idx_sessions_sentiment ON sessions(sentiment);
CREATE INDEX IF NOT EXISTS idx_sessions_ip_hash ON sessions(ip_hash);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_questions_session_id ON questions(session_id);

-- View for daily statistics
CREATE VIEW IF NOT EXISTS daily_stats AS
SELECT 
    DATE(start_time) as date,
    COUNT(*) as total_conversations,
    COUNT(DISTINCT ip_hash) as unique_users,
    AVG(conversation_duration_seconds) / 60.0 as avg_conversation_minutes,
    AVG(avg_response_time) as avg_response_seconds,
    SUM(CASE WHEN escalated = 0 AND forwarded_hr = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as resolved_percentage,
    SUM(cost_eur_cents) / 100.0 as total_cost_eur
FROM sessions
GROUP BY DATE(start_time);
`;
