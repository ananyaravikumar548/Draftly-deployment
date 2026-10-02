import { ObjectId } from 'mongodb';
import { collection } from './mongo';
import { demoPortfolioItems, demoProfile, type PortfolioRecord, type Profile } from './portfolio-types';

const SEED_VERSION = 'demo-portfolio-v3';

export async function ensureDemoPortfolio() {
  const metadata = await collection<{ _id: string; initializedAt?: Date }>('app_metadata');
  if (await metadata.findOne({ _id: SEED_VERSION })) return;

  const [items, profiles] = await Promise.all([
    collection<PortfolioRecord>('portfolio_items'),
    collection<Profile & { _id: string }>('profile'),
  ]);
  await items.deleteMany({});
  await items.insertMany(demoPortfolioItems.map((item) => ({ _id: new ObjectId(), ...item, createdAt: new Date() })));
  await profiles.updateOne({ _id: 'primary' }, { $set: demoProfile }, { upsert: true });
  await metadata.updateOne({ _id: SEED_VERSION }, { $setOnInsert: { initializedAt: new Date() } }, { upsert: true });
}
