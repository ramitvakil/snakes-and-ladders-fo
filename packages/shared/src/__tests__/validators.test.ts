import { describe, it, expect } from 'vitest';
import {
  MarketViewSchema,
  ConvictionSchema,
  SetViewSchema,
  SetConvictionSchema,
  RollDiceSchema,
  RegisterSchema,
  LoginSchema,
  CreateGameSchema,
} from '@game/shared';

describe('validators', () => {
  describe('MarketViewSchema', () => {
    it('accepts valid views', () => {
      expect(MarketViewSchema.parse('Bullish')).toBe('Bullish');
      expect(MarketViewSchema.parse('Bearish')).toBe('Bearish');
      expect(MarketViewSchema.parse('Neutral')).toBe('Neutral');
    });

    it('rejects invalid views', () => {
      expect(() => MarketViewSchema.parse('Sideways')).toThrow();
    });
  });

  describe('ConvictionSchema', () => {
    it('accepts 1-5', () => {
      for (let i = 1; i <= 5; i++) {
        expect(ConvictionSchema.parse(i)).toBe(i);
      }
    });

    it('rejects out-of-range', () => {
      expect(() => ConvictionSchema.parse(0)).toThrow();
      expect(() => ConvictionSchema.parse(6)).toThrow();
    });
  });

  describe('SetViewSchema', () => {
    it('accepts valid payload', () => {
      const result = SetViewSchema.parse({ view: 'Bullish' });
      expect(result.view).toBe('Bullish');
    });
  });

  describe('SetConvictionSchema', () => {
    it('accepts valid payload', () => {
      const result = SetConvictionSchema.parse({ level: 3 });
      expect(result.level).toBe(3);
    });
  });

  describe('RollDiceSchema', () => {
    it('accepts empty object', () => {
      const result = RollDiceSchema.parse({});
      expect(result).toEqual({});
    });
  });

  describe('RegisterSchema', () => {
    it('accepts valid registration', () => {
      const result = RegisterSchema.parse({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'TestUser',
      });
      expect(result.email).toBe('test@example.com');
    });

    it('rejects short password', () => {
      expect(() =>
        RegisterSchema.parse({ email: 'test@example.com', password: 'short', displayName: 'Test' }),
      ).toThrow();
    });

    it('rejects invalid email', () => {
      expect(() =>
        RegisterSchema.parse({ email: 'notanemail', password: 'password123', displayName: 'Test' }),
      ).toThrow();
    });
  });

  describe('LoginSchema', () => {
    it('accepts valid login', () => {
      const result = LoginSchema.parse({ email: 'test@example.com', password: 'pass1234' });
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('CreateGameSchema', () => {
    it('accepts valid game creation', () => {
      const result = CreateGameSchema.parse({ mode: 'single' });
      expect(result.mode).toBe('single');
    });

    it('accepts multiplayer mode', () => {
      const result = CreateGameSchema.parse({ mode: 'multiplayer' });
      expect(result.mode).toBe('multiplayer');
    });
  });
});
