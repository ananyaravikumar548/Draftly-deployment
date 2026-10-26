/**
 * Shared MongoDB-backed daily cap for billable job analyses.
 */
import type { Document } from 'mongodb';
import { collection } from './mongo';

const DEFAULT_DAILY_LIMIT = 10;
const MIN_DAILY_LIMIT = 10;
const MAX_DAILY_LIMIT = 15;

type DailyUsageRecord = Document & {
  _id: string;
  count: number;
  createdAt: Date;
  updatedAt?: Date;
};

function dailyLimit() {
  const configured = Number(process.env.ANALYZE_DAILY_LIMIT ?? DEFAULT_DAILY_LIMIT);
  return Number.isInteger(configured) && configured >= MIN_DAILY_LIMIT && configured <= MAX_DAILY_LIMIT
    ? configured
    : DEFAULT_DAILY_LIMIT;
}

function isDuplicateKey(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

// Atomically reserve one analysis from a shared UTC-day counter across app instances.
export async function reserveDailyAnalysis() {
  const now = new Date();
  const dayKey = now.toISOString().slice(0, 10);
  const limit = dailyLimit();
  const resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const usage = await collection<DailyUsageRecord>('analysis_usage');

  // Concurrent first requests can race to create the daily row; the _id index resolves that safely.
  try {
    await usage.updateOne(
      { _id: dayKey },
      { $setOnInsert: { count: 0, createdAt: now } },
      { upsert: true },
    );
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
  }

  const reservation = await usage.updateOne(
    { _id: dayKey, count: { $lt: limit } },
    { $inc: { count: 1 }, $set: { updatedAt: now } },
  );
  const current = await usage.findOne({ _id: dayKey }, { projection: { count: 1 } });
  const used = current?.count ?? 0;

  return { allowed: reservation.modifiedCount === 1, limit, used, remaining: Math.max(0, limit - used), resetAt };
}
