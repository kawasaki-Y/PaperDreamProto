import { z } from 'zod';
import { insertGameSchema, insertCardSchema, balanceRequestSchema, balanceResponseSchema } from './schema.ts';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  games: {
    list: {
      method: 'GET' as const,
      path: '/api/games' as const,
    },
    get: {
      method: 'GET' as const,
      path: '/api/games/:id' as const,
    },
    create: {
      method: 'POST' as const,
      path: '/api/games' as const,
      input: insertGameSchema,
    },
    update: {
      method: 'PUT' as const,
      path: '/api/games/:id' as const,
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/games/:id' as const,
    },
  },
  cards: {
    listByGame: {
      method: 'GET' as const,
      path: '/api/games/:id/cards' as const,
    },
    create: {
      method: 'POST' as const,
      path: '/api/games/:id/cards' as const,
      input: insertCardSchema,
    },
    update: {
      method: 'PUT' as const,
      path: '/api/cards/:id' as const,
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/cards/:id' as const,
    },
  },
  balance: {
    suggest: {
      method: 'POST' as const,
      path: '/api/balance/suggest' as const,
      input: balanceRequestSchema,
      responses: {
        200: balanceResponseSchema,
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
