import { createElement } from 'react';
import { ResumeSchema } from '@/src/lib/application-types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const requestStartedAt = performance.now();
  console.info('[resume-preview] POST start');
  try {
    const raw: unknown = await request.json();
    const parsed = ResumeSchema.safeParse(raw);
    if (!parsed.success) return Response.json({ error: 'Resume content is invalid.' }, { status: 400 });

    const moduleStartedAt = performance.now();
    const [{ renderToBuffer }, { ResumeDocument }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('@/src/components/resume/ResumeDocument'),
    ]);
    console.info(`[resume-preview] PDF module initialization: ${(performance.now() - moduleStartedAt).toFixed(1)}ms`);

    console.info('[resume-preview] PDF render start');
    const renderStartedAt = performance.now();
    const resumeElement = createElement(ResumeDocument, { data: parsed.data }) as unknown as Parameters<typeof renderToBuffer>[0];
    const pdf = await renderToBuffer(resumeElement);
    console.info(`[resume-preview] PDF render completion: ${(performance.now() - renderStartedAt).toFixed(1)}ms`);
    console.info(`[resume-preview] POST completed: ${(performance.now() - requestStartedAt).toFixed(1)}ms`);
    return new Response(new Uint8Array(pdf), { headers: { 'Content-Type': 'application/pdf', 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error(`[resume-preview] POST failed after ${(performance.now() - requestStartedAt).toFixed(1)}ms`, error);
    return Response.json({ error: 'Could not create resume preview.' }, { status: 500 });
  }
}
