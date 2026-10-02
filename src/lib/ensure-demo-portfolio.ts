import { ObjectId } from 'mongodb';
import { collection } from './mongo';
import { demoPortfolioItems, demoPreUniversityEducation, demoProfile, type PortfolioRecord, type Profile } from './portfolio-types';

const SEED_VERSION = 'demo-portfolio-v4';

export async function ensureDemoPortfolio() {
  const metadata = await collection<{ _id: string; initializedAt?: Date }>('app_metadata');
  if (await metadata.findOne({ _id: SEED_VERSION })) return;

  const [items, profiles] = await Promise.all([
    collection<PortfolioRecord>('portfolio_items'),
    collection<Profile & { _id: string }>('profile'),
  ]);

  // Seed by stable type/title identity so upgrades preserve existing demo and user-edited items.
  const existingItems = await items.find({}, { projection: { type: 1, title: 1 } }).toArray();
  const existingKeys = new Set(existingItems.map(({ type, title }) => `${type}:${title.trim().toLocaleLowerCase()}`));
  const missingItems = demoPortfolioItems
    .filter((item) => !existingKeys.has(`${item.type}:${item.title.trim().toLocaleLowerCase()}`))
    .map((item) => ({ _id: new ObjectId(), ...item, createdAt: new Date() }));
  if (missingItems.length) await items.insertMany(missingItems);

  const currentProfile = await profiles.findOne({ _id: 'primary' });
  if (!currentProfile) {
    await profiles.insertOne({ _id: 'primary', ...demoProfile });
  } else if (!currentProfile.education.some((entry) => entry.school === demoPreUniversityEducation.school)) {
    await profiles.updateOne({ _id: 'primary' }, { $push: { education: demoPreUniversityEducation } });
  }

  await metadata.updateOne({ _id: SEED_VERSION }, { $setOnInsert: { initializedAt: new Date() } }, { upsert: true });
}
