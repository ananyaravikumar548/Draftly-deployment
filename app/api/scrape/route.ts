import { z } from 'zod';
import { extractJobPosting, JobScrapeError } from '@/src/lib/job-scraper';

const InputSchema = z.object({ url: z.string().trim().url().max(2048) });

export async function POST(request: Request) {
  try {
    const input: unknown = await request.json();
    const parsed = InputSchema.safeParse(input);
    if (!parsed.success) return Response.json({ error: 'Enter a valid job posting URL.' }, { status: 400 });

    const job = await extractJobPosting(parsed.data.url);
    return Response.json(job);
  } catch (error) {
    if (error instanceof JobScrapeError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: 'We could not read that job posting. Paste the job description to continue.' }, { status: 400 });
  }
}
