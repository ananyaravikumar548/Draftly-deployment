import { collection, databaseErrorResponse } from '@/src/lib/mongo';
import { demoProfile, ProfileSchema, type Profile } from '@/src/lib/portfolio-types';
import { ensureDemoPortfolio } from '@/src/lib/ensure-demo-portfolio';

export const dynamic = 'force-dynamic';

type ProfileDocument = Profile & { _id: string };

export async function GET() {
  try {
    await ensureDemoPortfolio();
    const profiles = await collection<ProfileDocument>('profile');
    let profile = await profiles.findOne({ _id: 'primary' });
    if (!profile) {
      await profiles.updateOne({ _id: 'primary' }, { $setOnInsert: { ...demoProfile, _id: 'primary' } }, { upsert: true });
      profile = await profiles.findOne({ _id: 'primary' });
    }
    return Response.json({ profile });
  } catch (error) { return databaseErrorResponse(error); }
}

export async function PUT(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = ProfileSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: 'Check the profile fields and try again.' }, { status: 400 });
    const profiles = await collection<ProfileDocument>('profile');
    await profiles.updateOne({ _id: 'primary' }, { $set: parsed.data }, { upsert: true });
    return Response.json({ profile: { _id: 'primary', ...parsed.data } });
  } catch (error) { return databaseErrorResponse(error); }
}
