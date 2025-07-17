import { z } from 'zod';

// Zod schemas for validating imported JSON data

const TranscriptMessageSchema = z.object({
  timestamp: z.string().datetime(),
  role: z.enum(['User', 'Assistant']),
  content: z.string()
});

const MessageMetricsSchema = z.object({
  response_time: z.object({
    avg: z.number()
  }),
  amount: z.object({
    user: z.number(),
    total: z.number()
  }),
  tokens: z.number(),
  cost: z.object({
    eur: z.object({
      cent: z.number(),
      full: z.number()
    })
  }),
  source_url: z.string().url()
});

const UserInfoSchema = z.object({
  ip: z.string(),
  country: z.string(),
  language: z.string()
});

export const ChatSessionSchema = z.object({
  session_id: z.string().uuid(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  transcript: z.array(TranscriptMessageSchema),
  messages: MessageMetricsSchema,
  user: UserInfoSchema,
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  escalated: z.boolean(),
  forwarded_hr: z.boolean(),
  category: z.string(),
  questions: z.array(z.string()),
  summary: z.string(),
  user_rating: z.number().optional()
});

export const ChatSessionArraySchema = z.array(ChatSessionSchema);

// Validate and parse JSON data
export function validateSessionData(data: unknown): z.infer<typeof ChatSessionArraySchema> {
  try {
    return ChatSessionArraySchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join('\n');
      throw new Error(`Validation failed:\n${issues}`);
    }
    throw error;
  }
}