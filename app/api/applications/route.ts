import { collection, databaseErrorResponse } from '@/src/lib/mongo';
import type { ApplicationRecord } from '@/src/lib/application-types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const requestStartedAt = performance.now();
  console.info('[applications] GET start');
  try {
    const applications = await collection<ApplicationRecord>('applications');
    const queryStartedAt = performance.now();
    const records = await applications.find({}, { projection: { job_text: 0 } }).sort({ created_at: -1 }).limit(100).toArray();
    console.info(`[applications] Mongo query: ${(performance.now() - queryStartedAt).toFixed(1)}ms (${records.length} records)`);
    console.info(`[applications] GET completed: ${(performance.now() - requestStartedAt).toFixed(1)}ms`);
    return Response.json({ applications: records.map(({ _id, ...record }) => ({ id: _id.toString(), ...record, created_at: record.created_at.toISOString() })) });
  } catch (error) {
    console.warn(`[applications] GET failed after ${(performance.now() - requestStartedAt).toFixed(1)}ms`);
    return databaseErrorResponse(error);
  }
}
