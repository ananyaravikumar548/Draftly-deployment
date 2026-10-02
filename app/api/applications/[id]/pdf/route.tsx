import { renderToBuffer } from '@react-pdf/renderer';
import { ObjectId } from 'mongodb';
import { ResumeDocument } from '@/src/components/resume/ResumeDocument';
import { ResumeSchema, type ApplicationRecord } from '@/src/lib/application-types';
import type { PortfolioRecord } from '@/src/lib/portfolio-types';
import { collection, databaseErrorResponse } from '@/src/lib/mongo';

export const dynamic = 'force-dynamic';
type RouteProps = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) return Response.json({ error: 'Application not found.' }, { status: 404 });
    const applications = await collection<ApplicationRecord>('applications');
    const record = await applications.findOne({ _id: new ObjectId(id) });
    if (!record) return Response.json({ error: 'Application not found.' }, { status: 404 });
    const resume = ResumeSchema.parse(record.resume_json);
    if (!resume.achievements.length) {
      const portfolio = await collection<PortfolioRecord>('portfolio_items');
      const achievements = await portfolio.find({ type: 'achievement' }, { projection: { title: 1, description: 1 } }).toArray();
      resume.achievements = achievements.map(({ title, description }) => ({ title, description }));
    }
    const pdf = await renderToBuffer(<ResumeDocument data={resume} />);
    const filename = `${record.company_name}-${record.job_title}-resume.pdf`.replace(/[^a-z0-9._-]+/gi, '-').slice(0, 100);
    return new Response(new Uint8Array(pdf), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${filename}"`, 'Cache-Control': 'no-store' } });
  } catch (error) { return databaseErrorResponse(error); }
}
