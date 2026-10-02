import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDemoJob } from '@/src/lib/demo-jobs';

export default async function DemoJobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = getDemoJob(slug);
  if (!job) notFound();
  return <main className="demo-job-page"><header className="demo-job-nav"><Link href="/new-application" className="brand"><span className="brand-mark">D</span>Draftly</Link><Link href="/new-application" className="button outline small">Use in Draftly</Link></header><article className="demo-job-card"><div className="demo-fixture-label">FICTIONAL DEMO POSTING · SAFE LOCAL FIXTURE</div><div className="demo-company-icon">{job.company[0]}</div><p className="demo-job-company">{job.company}</p><h1>{job.title}</h1><div className="demo-job-meta"><span>{job.location}</span><i/><span>{job.source}</span></div><div className="demo-job-body">{job.text.split('\n').map((line, index) => line.startsWith('•') ? <p className="demo-job-bullet" key={index}>{line.slice(1).trim()}</p> : line ? <p key={index}>{line}</p> : <div className="demo-job-space" key={index}/>)}</div><Link href="/new-application" className="button primary">Analyze this job <span aria-hidden>→</span></Link><p className="demo-job-disclaimer">Demo fixture only. No external website is contacted.</p></article></main>;
}
