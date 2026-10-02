import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { collection, databaseErrorResponse } from '@/src/lib/mongo';
import { AnalysisSchema, ResumeSchema, type ApplicationRecord } from '@/src/lib/application-types';
import type { PortfolioRecord } from '@/src/lib/portfolio-types';

export const dynamic = 'force-dynamic';
type RouteProps = { params: Promise<{ id: string }> };
const EditSchema = z.object({ resume_json: ResumeSchema, analysis: AnalysisSchema.optional() });

export async function GET(_request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) return Response.json({ error: 'Application not found.' }, { status: 404 });
    const applications = await collection<ApplicationRecord>('applications');
    const record = await applications.findOne({ _id: new ObjectId(id) });
    if (!record) return Response.json({ error: 'Application not found.' }, { status: 404 });
    const { _id, ...application } = record;
    const resume = ResumeSchema.parse(application.resume_json);
    if (!resume.achievements.length) {
      const portfolio = await collection<PortfolioRecord>('portfolio_items');
      const achievements = await portfolio.find({ type: 'achievement' }, { projection: { title: 1, description: 1 } }).toArray();
      resume.achievements = achievements.map(({ title, description }) => ({ title, description }));
    }
    return Response.json({ application: { id: _id.toString(), ...application, resume_json: resume, created_at: application.created_at.toISOString() } });
  } catch (error) { return databaseErrorResponse(error); }
}

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) return Response.json({ error: 'Application not found.' }, { status: 404 });
    const raw: unknown = await request.json();
    const parsed = EditSchema.safeParse(raw);
    if (!parsed.success) return Response.json({ error: 'Check your resume edits and try saving again.' }, { status: 400 });
    const applications = await collection<ApplicationRecord>('applications');
    const result = await applications.updateOne({ _id: new ObjectId(id) }, { $set: { resume_json: parsed.data.resume_json, ...(parsed.data.analysis ? { analysis: parsed.data.analysis } : {}), updated_at: new Date() } });
    if (!result.matchedCount) return Response.json({ error: 'Application not found.' }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) { return databaseErrorResponse(error); }
}
