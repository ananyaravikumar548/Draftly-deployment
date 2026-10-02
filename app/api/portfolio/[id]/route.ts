import { ObjectId } from 'mongodb';
import { collection, databaseErrorResponse } from '@/src/lib/mongo';
import { PortfolioItemSchema, type PortfolioRecord } from '@/src/lib/portfolio-types';

export const dynamic = 'force-dynamic';

type RouteProps = { params: Promise<{ id: string }> };
function serialize(item: PortfolioRecord) { return { id: item._id.toString(), type: item.type, title: item.title, description: item.description, technologies: item.technologies, dateRange: item.dateRange, createdAt: item.createdAt?.toISOString() }; }

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) return Response.json({ error: 'Portfolio item not found.' }, { status: 404 });
    const body: unknown = await request.json();
    const parsed = PortfolioItemSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: 'Check the portfolio item fields and try again.' }, { status: 400 });
    const items = await collection<PortfolioRecord>('portfolio_items');
    const item = await items.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: parsed.data }, { returnDocument: 'after' });
    if (!item) return Response.json({ error: 'Portfolio item not found.' }, { status: 404 });
    return Response.json({ item: serialize(item) });
  } catch (error) { return databaseErrorResponse(error); }
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) return Response.json({ error: 'Portfolio item not found.' }, { status: 404 });
    const items = await collection<PortfolioRecord>('portfolio_items');
    const result = await items.deleteOne({ _id: new ObjectId(id) });
    if (!result.deletedCount) return Response.json({ error: 'Portfolio item not found.' }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) { return databaseErrorResponse(error); }
}
