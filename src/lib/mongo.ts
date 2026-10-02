import { MongoClient, type Collection, type Document } from 'mongodb';

const uri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/careerflow';
const databaseName = process.env.MONGODB_DATABASE ?? 'careerflow';

declare global {
  // Reuse one connection promise across requests and Next.js hot reloads.
  var careerflowMongo: Promise<MongoClient> | undefined;
}

function getClientPromise() {
  if (globalThis.careerflowMongo) return globalThis.careerflowMongo;

  const client = new MongoClient(uri, {
    connectTimeoutMS: 5_000,
    serverSelectionTimeoutMS: 5_000,
  });
  const promise = client.connect().catch((error: unknown) => {
    if (globalThis.careerflowMongo === promise) globalThis.careerflowMongo = undefined;
    void client.close().catch(() => {});
    throw error;
  });
  globalThis.careerflowMongo = promise;
  return promise;
}

export async function collection<T extends Document>(name: string): Promise<Collection<T>> {
  const startedAt = performance.now();
  try {
    const client = await getClientPromise();
    console.info(`[mongo] client acquisition (${name}): ${(performance.now() - startedAt).toFixed(1)}ms`);
    return client.db(databaseName).collection<T>(name);
  } catch (error) {
    console.warn(`[mongo] client acquisition failed (${name}) after ${(performance.now() - startedAt).toFixed(1)}ms`);
    throw error;
  }
}

export class DatabaseUnavailableError extends Error {
  constructor() {
    super('Local MongoDB is not running. Start MongoDB, then retry.');
    this.name = 'DatabaseUnavailableError';
  }
}

export function databaseErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'The local database request failed.';
  const errorName = error instanceof Error ? error.name : '';
  const unavailable = error instanceof DatabaseUnavailableError
    || errorName === 'MongoServerSelectionError'
    || errorName === 'MongoNetworkError'
    || message.includes('ECONNREFUSED')
    || message.includes('connect EPERM')
    || message.includes('ETIMEDOUT');
  const status = unavailable ? 503 : 500;
  return Response.json({ error: status === 503 ? 'Draftly could not connect to local MongoDB. Start the database and retry.' : 'Draftly could not save this change. Please retry.' }, { status });
}
