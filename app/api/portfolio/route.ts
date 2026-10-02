import { ObjectId } from 'mongodb';
import { collection, databaseErrorResponse } from '@/src/lib/mongo';
import { PortfolioItemSchema, type PortfolioRecord } from '@/src/lib/portfolio-types';
import { ensureDemoPortfolio } from '@/src/lib/ensure-demo-portfolio';

export const dynamic = 'force-dynamic';

function serialize(item: PortfolioRecord) {
  return { id: item._id.toString(), type: item.type, title: item.title, description: item.description, technologies: item.technologies, dateRange: item.dateRange, createdAt: item.createdAt?.toISOString() };
}

export async function GET() {
  try {
    const items = await collection<PortfolioRecord>('portfolio_items');
    await ensureDemoPortfolio();
    const records = await items.find().sort({ type: 1, title: 1 }).toArray();
    return Response.json({ items: records.map(serialize) });
  } catch (error) { return databaseErrorResponse(error); }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = PortfolioItemSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: 'Add a name and check the portfolio item fields.' }, { status: 400 });
    const items = await collection<PortfolioRecord>('portfolio_items');
    const result = await items.insertOne({ _id: new ObjectId(), ...parsed.data, createdAt: new Date() });
    const saved = await items.findOne({ _id: result.insertedId });
    if (!saved) return Response.json({ error: 'The item could not be loaded after saving.' }, { status: 500 });
    return Response.json({ item: serialize(saved) }, { status: 201 });
  } catch (error) { return databaseErrorResponse(error); }
}
