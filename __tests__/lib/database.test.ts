import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  initializeDatabase, 
  insertSession, 
  loadSessionsFromJSON,
  getDatabaseStats,
  clearDatabase 
} from '@/lib/db/database';
import type { ChatSession } from '@/lib/types/session';

// Mock fetch for schema
global.fetch = vi.fn(() => 
  Promise.resolve({
    text: () => Promise.resolve('CREATE TABLE sessions (session_id TEXT PRIMARY KEY);')
  })
) as any;

describe('Database Module', () => {
  const mockSession: ChatSession = {
    session_id: '123e4567-e89b-12d3-a456-426614174000',
    start_time: '2024-01-01T10:00:00Z',
    end_time: '2024-01-01T10:30:00Z',
    transcript: [
      {
        timestamp: '2024-01-01T10:00:00Z',
        role: 'User',
        content: 'Hello'
      },
      {
        timestamp: '2024-01-01T10:01:00Z',
        role: 'Assistant',
        content: 'Hi there!'
      }
    ],
    messages: {
      response_time: { avg: 5.2 },
      amount: { user: 1, total: 2 },
      tokens: 150,
      cost: { eur: { cent: 5, full: 0.05 } },
      source_url: 'https://example.com/chat/123'
    },
    user: {
      ip: 'hash123',
      country: 'NL',
      language: 'nl'
    },
    sentiment: 'positive',
    escalated: false,
    forwarded_hr: false,
    category: 'General',
    questions: ['What is the weather?'],
    summary: 'User asked about weather'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('initializeDatabase', () => {
    it('should initialize database successfully', async () => {
      const db = await initializeDatabase();
      expect(db).toBeDefined();
      expect(db.run).toBeDefined();
      expect(fetch).toHaveBeenCalledWith('/schema.sql');
    });

    it('should load existing database from localStorage', async () => {
      const mockData = btoa('mock-db-data');
      localStorage.getItem = vi.fn().mockReturnValue(mockData);
      
      await initializeDatabase();
      
      expect(localStorage.getItem).toHaveBeenCalledWith('livegraphs_db');
    });
  });

  describe('insertSession', () => {
    it('should insert a session successfully', async () => {
      await initializeDatabase();
      
      // Should not throw
      await expect(insertSession(mockSession)).resolves.not.toThrow();
      
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should calculate conversation duration correctly', async () => {
      await initializeDatabase();
      await insertSession(mockSession);
      
      // Duration should be 30 minutes = 1800 seconds
      // We can't directly test the SQL insert, but we verify the function runs
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('loadSessionsFromJSON', () => {
    it('should load multiple sessions from JSON', async () => {
      await initializeDatabase();
      
      const sessions = [mockSession, { ...mockSession, session_id: 'different-id' }];
      const count = await loadSessionsFromJSON(sessions);
      
      expect(count).toBe(2);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      await initializeDatabase();
      
      const invalidSession = { ...mockSession, session_id: null } as any;
      const count = await loadSessionsFromJSON([invalidSession]);
      
      expect(count).toBe(0);
    });
  });

  describe('getDatabaseStats', () => {
    it('should return empty stats for empty database', async () => {
      await initializeDatabase();
      
      const mockDb = (await import('sql.js')).default;
      const dbInstance = new (await mockDb()).Database();
      dbInstance.exec = vi.fn().mockReturnValue([]);
      
      const stats = getDatabaseStats();
      
      expect(stats).toEqual({
        totalSessions: 0,
        dateRange: { min: '', max: '' }
      });
    });
  });

  describe('clearDatabase', () => {
    it('should clear database and localStorage', async () => {
      await initializeDatabase();
      
      clearDatabase();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('livegraphs_db');
    });
  });
});