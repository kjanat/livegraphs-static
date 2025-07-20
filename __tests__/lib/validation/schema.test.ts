import { describe, expect, it } from "vitest";
import {
  ChatSessionArraySchema,
  ChatSessionSchema,
  validateSessionData
} from "../../../lib/validation/schema";

describe("ChatSessionSchema", () => {
  const validSession = {
    session_id: "123e4567-e89b-12d3-a456-426614174000",
    start_time: "2024-01-01T10:00:00Z",
    end_time: "2024-01-01T10:30:00Z",
    transcript: [
      {
        timestamp: "2024-01-01T10:00:00Z",
        role: "User",
        content: "Hello"
      },
      {
        timestamp: "2024-01-01T10:00:05Z",
        role: "Assistant",
        content: "Hi there!"
      }
    ],
    messages: {
      response_time: { avg: 2.5 },
      amount: { user: 5, total: 10 },
      tokens: 500,
      cost: { eur: { cent: 125, full: 1.25 } },
      source_url: "https://example.com"
    },
    user: {
      ip: "hash123",
      country: "USA",
      language: "en"
    },
    sentiment: "positive",
    escalated: false,
    forwarded_hr: false,
    category: "Technical Support",
    questions: ["How do I reset my password?"],
    summary: "User needed help with password reset",
    user_rating: 5
  };

  describe("Valid session validation", () => {
    it("should validate a complete valid session", () => {
      const result = ChatSessionSchema.parse(validSession);
      expect(result).toEqual({
        ...validSession,
        user: {
          ...validSession.user,
          ip: "ANONYMIZED" // IP is transformed since "hash123" is not a valid IP format
        }
      });
    });

    it("should validate session without optional user_rating", () => {
      const sessionWithoutRating: Partial<typeof validSession> = { ...validSession };
      delete sessionWithoutRating.user_rating;

      const result = ChatSessionSchema.parse(sessionWithoutRating);
      expect(result).toEqual({
        ...sessionWithoutRating,
        user: {
          ...sessionWithoutRating.user,
          ip: "ANONYMIZED" // IP is transformed since "hash123" is not a valid IP format
        }
      });
      expect(result.user_rating).toBeUndefined();
    });

    it("should anonymize real IP addresses", () => {
      const sessionWithRealIP = {
        ...validSession,
        user: {
          ...validSession.user,
          ip: "192.168.1.100"
        }
      };

      const result = ChatSessionSchema.parse(sessionWithRealIP);
      expect(result.user.ip).toBe("192.168.XXX.XXX");
    });

    it("should validate all sentiment values", () => {
      const sentiments = ["positive", "neutral", "negative"] as const;

      sentiments.forEach((sentiment) => {
        const session = { ...validSession, sentiment };
        const result = ChatSessionSchema.parse(session);
        expect(result.sentiment).toBe(sentiment);
      });
    });

    it("should validate all role values", () => {
      const roles = ["User", "Assistant"] as const;

      roles.forEach((role) => {
        const session = {
          ...validSession,
          transcript: [{ timestamp: "2024-01-01T10:00:00Z", role, content: "Test" }]
        };
        const result = ChatSessionSchema.parse(session);
        expect(result.transcript[0].role).toBe(role);
      });
    });
  });

  describe("Invalid session validation", () => {
    it("should reject invalid session_id (not UUID)", () => {
      const invalidSession = { ...validSession, session_id: "not-a-uuid" };
      expect(() => ChatSessionSchema.parse(invalidSession)).toThrow();
    });

    it("should reject invalid datetime format", () => {
      const invalidSession = { ...validSession, start_time: "2024-01-01" };
      expect(() => ChatSessionSchema.parse(invalidSession)).toThrow();
    });

    it("should reject invalid sentiment value", () => {
      const invalidSession = { ...validSession, sentiment: "angry" };
      expect(() => ChatSessionSchema.parse(invalidSession)).toThrow();
    });

    it("should reject invalid role value", () => {
      const invalidSession = {
        ...validSession,
        transcript: [{ timestamp: "2024-01-01T10:00:00Z", role: "Bot", content: "Test" }]
      };
      expect(() => ChatSessionSchema.parse(invalidSession)).toThrow();
    });

    it("should reject non-boolean escalated value", () => {
      const invalidSession = { ...validSession, escalated: "yes" };
      expect(() => ChatSessionSchema.parse(invalidSession)).toThrow();
    });

    it("should reject invalid URL in source_url", () => {
      const invalidSession = {
        ...validSession,
        messages: { ...validSession.messages, source_url: "not-a-url" }
      };
      expect(() => ChatSessionSchema.parse(invalidSession)).toThrow();
    });

    it("should reject missing required fields", () => {
      const requiredFields = [
        "session_id",
        "start_time",
        "end_time",
        "transcript",
        "messages",
        "user",
        "sentiment",
        "escalated",
        "forwarded_hr",
        "category",
        "questions",
        "summary"
      ];

      requiredFields.forEach((field) => {
        const incompleteSession = { ...validSession };
        delete (incompleteSession as Record<string, unknown>)[field];
        expect(() => ChatSessionSchema.parse(incompleteSession)).toThrow();
      });
    });

    it("should reject invalid nested structure", () => {
      const invalidSession = {
        ...validSession,
        messages: {
          ...validSession.messages,
          amount: { user: "five", total: 10 } // user should be number
        }
      };
      expect(() => ChatSessionSchema.parse(invalidSession)).toThrow();
    });

    it("should reject non-array questions", () => {
      const invalidSession = { ...validSession, questions: "How do I reset my password?" };
      expect(() => ChatSessionSchema.parse(invalidSession)).toThrow();
    });
  });
});

describe("ChatSessionArraySchema", () => {
  const validSession = {
    session_id: "123e4567-e89b-12d3-a456-426614174000",
    start_time: "2024-01-01T10:00:00Z",
    end_time: "2024-01-01T10:30:00Z",
    transcript: [],
    messages: {
      response_time: { avg: 2.5 },
      amount: { user: 5, total: 10 },
      tokens: 500,
      cost: { eur: { cent: 125, full: 1.25 } },
      source_url: "https://example.com"
    },
    user: {
      ip: "hash123",
      country: "USA",
      language: "en"
    },
    sentiment: "positive",
    escalated: false,
    forwarded_hr: false,
    category: "Technical Support",
    questions: [],
    summary: "Test summary"
  };

  it("should validate an array of sessions", () => {
    const sessions = [
      validSession,
      { ...validSession, session_id: "223e4567-e89b-12d3-a456-426614174001" }
    ];
    const result = ChatSessionArraySchema.parse(sessions);
    expect(result).toHaveLength(2);
  });

  it("should validate an empty array", () => {
    const result = ChatSessionArraySchema.parse([]);
    expect(result).toHaveLength(0);
  });

  it("should reject non-array input", () => {
    expect(() => ChatSessionArraySchema.parse(validSession)).toThrow();
    expect(() => ChatSessionArraySchema.parse("not an array")).toThrow();
    expect(() => ChatSessionArraySchema.parse(123)).toThrow();
  });

  it("should reject array with invalid sessions", () => {
    const invalidSessions = [validSession, { ...validSession, session_id: "invalid" }];
    expect(() => ChatSessionArraySchema.parse(invalidSessions)).toThrow();
  });
});

describe("validateSessionData", () => {
  const validSession = {
    session_id: "123e4567-e89b-12d3-a456-426614174000",
    start_time: "2024-01-01T10:00:00Z",
    end_time: "2024-01-01T10:30:00Z",
    transcript: [],
    messages: {
      response_time: { avg: 2.5 },
      amount: { user: 5, total: 10 },
      tokens: 500,
      cost: { eur: { cent: 125, full: 1.25 } },
      source_url: "https://example.com"
    },
    user: {
      ip: "hash123",
      country: "USA",
      language: "en"
    },
    sentiment: "positive",
    escalated: false,
    forwarded_hr: false,
    category: "Technical Support",
    questions: [],
    summary: "Test summary"
  };

  it("should validate and return valid data", () => {
    const data = [validSession];
    const result = validateSessionData(data);
    expect(result).toEqual([
      {
        ...validSession,
        user: {
          ...validSession.user,
          ip: "ANONYMIZED" // IP is transformed since "hash123" is not a valid IP format
        }
      }
    ]);
  });

  it("should throw formatted error for validation failures", () => {
    const invalidData = [{ ...validSession, session_id: "not-a-uuid" }];

    expect(() => validateSessionData(invalidData)).toThrow("Validation failed:");

    try {
      validateSessionData(invalidData);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain("0.session_id");
    }
  });

  it("should handle multiple validation errors", () => {
    const invalidData = [
      {
        ...validSession,
        session_id: "not-a-uuid",
        sentiment: "angry",
        escalated: "yes"
      }
    ];

    try {
      validateSessionData(invalidData);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      const message = (error as Error).message;
      expect(message).toContain("0.session_id");
      expect(message).toContain("0.sentiment");
      expect(message).toContain("0.escalated");
    }
  });

  it("should handle nested validation errors", () => {
    const invalidData = [
      {
        ...validSession,
        messages: {
          ...validSession.messages,
          cost: { eur: { cent: "invalid", full: "invalid" } }
        }
      }
    ];

    try {
      validateSessionData(invalidData);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      const message = (error as Error).message;
      expect(message).toContain("0.messages.cost.eur.cent");
      expect(message).toContain("0.messages.cost.eur.full");
    }
  });

  it("should handle non-Zod errors", () => {
    // Mock parse to throw non-Zod error
    const originalParse = ChatSessionArraySchema.parse;
    ChatSessionArraySchema.parse = () => {
      throw new Error("Non-Zod error");
    };

    expect(() => validateSessionData([])).toThrow("Non-Zod error");

    // Restore original
    ChatSessionArraySchema.parse = originalParse;
  });
});
