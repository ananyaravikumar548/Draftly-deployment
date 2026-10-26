/**
 * Renders submitted resume data into a PDF preview response.
 */
import { createElement } from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { ResumeDocument } from '@/src/components/resume/ResumeDocument';
import { ResumeSchema } from '@/src/lib/application-types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validate browser-supplied resume data and stream back a freshly rendered PDF.
export async function POST(request: Request) {
  const requestStartedAt = performance.now();
  console.info('[resume-preview] POST start');
  try {
    const raw: unknown = await request.json();
    const parsed = ResumeSchema.safeParse(raw);
    if (!parsed.success) return Response.json({ error: 'Resume content is invalid.' }, { status: 400 });

    console.info('[resume-preview] PDF render start');
    const renderStartedAt = performance.now();
    const resumeElement = createElement(ResumeDocument, { data: parsed.data }) as unknown as Parameters<typeof renderToBuffer>[0];
    const pdf = await renderToBuffer(resumeElement);
    console.info(`[resume-preview] PDF render completion: ${(performance.now() - renderStartedAt).toFixed(1)}ms`);
    console.info(`[resume-preview] POST completed: ${(performance.now() - requestStartedAt).toFixed(1)}ms`);
    return new Response(new Uint8Array(pdf), { headers: { 'Content-Type': 'application/pdf', 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error(`[resume-preview] POST failed after ${(performance.now() - requestStartedAt).toFixed(1)}ms`, error);
    const diagnostic = request.headers.get('x-draftly-render-diagnostic') === 'enabled';
    const detail = error instanceof Error ? `${error.name}: ${error.message}`.replace(/(?:mongodb(?:\+srv)?:\/\/)[^\s]+/gi, '[database connection]').slice(0, 240) : 'Unknown rendering error.';
    return Response.json({ error: 'Could not create resume preview.', ...(diagnostic ? { detail } : {}) }, { status: 500 });
  }
}
