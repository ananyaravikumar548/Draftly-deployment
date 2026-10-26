'use client';
// Client-side flows for analyzing jobs, reviewing resumes, and browsing saved applications.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AppShell } from './layout/AppShell';
import { PageHeader } from './ui/PageHeader';
import { Badge } from './ui/Badge';
import { ResumePreview } from './resume/ResumePreview';
import { ArrowRight, ArrowUpRight, Check, FileText, Globe2, LoaderCircle, Mail } from './ui/icons';
import type { Analysis, ResumeData } from '@/src/lib/application-types';

type SavedApp = { id: string; company_name: string; job_title: string; location: string; status: string; analysis: Analysis; resume_json: ResumeData };
let applicationsRequestInFlight: Promise<{ applications: SavedApp[] }> | null = null;

async function jsonRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Something went wrong. Please try again.');
  return payload as T;
}

// Reuse one in-flight history request when multiple screens ask for recent applications.
function loadApplications() {
  if (!applicationsRequestInFlight) {
    applicationsRequestInFlight = jsonRequest<{ applications: SavedApp[] }>('/api/applications')
      .finally(() => { applicationsRequestInFlight = null; });
  }
  return applicationsRequestInFlight;
}

export function NewApplicationFlow() {
  const router = useRouter();
  const requestInFlight = useRef(false);
  const [mode, setMode] = useState<'url'|'text'>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = mode === 'url'
    ? (() => { try { const parsed = new URL(url); return ['http:', 'https:'].includes(parsed.protocol) && Boolean(parsed.hostname); } catch { return false; } })()
    : text.trim().length >= 80 && text.trim().length <= 12000;

  async function analyze(event: React.FormEvent) {
    event.preventDefault();
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await jsonRequest<{id:string}>('/api/analyze', {
        method: 'POST',
        body: JSON.stringify(mode === 'url' ? { jobUrl: url } : { jobText: text }),
      });
      router.push('/applications/' + result.id + '/review');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Analysis failed. Please try again.');
      requestInFlight.current = false;
      setBusy(false);
    }
  }

  const chooseUrl = (value: string) => {
    setMode('url');
    setError('');
    setUrl(value);
  };
  const chooseDemo = (slug: string) => chooseUrl(window.location.origin + '/demo-jobs/' + slug);

  return <AppShell>
    <div className={`content-wrap application-page app-start-page${busy ? ' is-analyzing' : ''}`}>
      <PageHeader
        eyebrow="APPLICATION STUDIO"
        title="Start with the role."
        subtitle="We’ll connect your experience to the opportunity and help you shape a thoughtful application."
        action={<span className="engine-status"><i/> Match engine ready</span>}
      />
      <nav className="application-steps card" aria-label="Application steps">
        <span className="application-step active"><i>01</i><b>Job details</b><small>Add a role to begin</small></span>
        <span className="application-step-line" aria-hidden="true"/>
        <span className="application-step"><i>02</i><b>Portfolio match</b><small>Connect relevant work</small></span>
        <span className="application-step-line" aria-hidden="true"/>
        <span className="application-step"><i>03</i><b>Application draft</b><small>Review and shape your draft</small></span>
      </nav>

      <div className="new-layout">
        <div className="primary-column">
          <form className="card job-input-card" onSubmit={analyze}>
            <div className="input-head">
              <div><span className="form-kicker">STEP 01 · ADD A JOB</span><h2>Where would you like to apply?</h2><p>Start with a public job link or paste the role details directly.</p></div>
            </div>
            <div className="source-tabs" role="tablist" aria-label="Job description source">
              <button id="job-link-tab" type="button" role="tab" aria-selected={mode === 'url'} className={mode === 'url' ? 'active' : ''} aria-controls="job-source-panel" onClick={() => { setMode('url'); setError(''); }}>
                <span className="source-tab-icon"><ArrowUpRight size={17}/></span><span><b>Job posting link</b><small>Use a public URL</small></span><i className="source-tab-check">{mode === 'url' ? <Check size={12}/> : ''}</i>
              </button>
              <button id="job-text-tab" type="button" role="tab" aria-selected={mode === 'text'} className={mode === 'text' ? 'active' : ''} aria-controls="job-source-panel" onClick={() => { setMode('text'); setError(''); }}>
                <span className="source-tab-icon"><FileText size={17}/></span><span><b>Paste job details</b><small>Add the description</small></span><i className="source-tab-check">{mode === 'text' ? <Check size={12}/> : ''}</i>
              </button>
            </div>
            <div id="job-source-panel" role="tabpanel" aria-labelledby={mode === 'url' ? 'job-link-tab' : 'job-text-tab'}>
              {mode === 'url' ? <>
                <label className="field-label" htmlFor="job-url">Public job posting URL</label>
                <div className="job-url-field"><Globe2 size={17} aria-hidden="true"/><input id="job-url" className="field-input" type="url" required value={url} onChange={event => setUrl(event.target.value)} placeholder="https://company.com/careers/job"/>{url && <button type="button" aria-label="Clear job URL" onClick={() => setUrl('')}>Clear</button>}</div>
                <div className="field-hint">Use a public posting. If it requires sign-in or blocks access, paste the details instead. <button type="button" onClick={() => { setMode('text'); setError(''); }}>Switch to paste</button></div>
              </> : <>
                <label className="field-label" htmlFor="job-text">Job description</label>
                <textarea id="job-text" className="field-input job-description" required minLength={80} maxLength={12000} value={text} onChange={event => setText(event.target.value)} placeholder="Paste the role responsibilities and requirements here…"/>
                <div className="field-hint textarea-meta"><span>Include the responsibilities and qualifications for a stronger match.</span><span>{text.length.toLocaleString()} / 12,000</span></div>
              </>}
            </div>
            {error && <div className="error-message job-analysis-error" role="alert"><span>{error}</span><button type="button" onClick={() => { setMode('text'); setError(''); }}>Paste the details instead</button></div>}
            <div className="form-submit-row"><span><FileText size={15}/> Review every suggestion before applying</span><button className="button primary analyze-button" disabled={busy || !canSubmit}>{busy ? <><LoaderCircle className="spin" size={17}/> Matching your portfolio…</> : <>Find my portfolio match <ArrowRight size={17}/></>}</button></div>
            {busy && <div className="matching-progress" role="status" aria-label="Matching your portfolio"><span><i/>Read the role</span><span><i/>Find relevant evidence</span><span><i/>Shape a draft</span></div>}
          </form>
        </div>

        <aside className="recent-column application-rail">
          <section className="card sample-role-card">
            <div className="rail-heading"><div><span className="form-kicker">QUICK START</span><h2>Try a sample role</h2><p>Choose a live posting or offline demo.</p></div></div>
            <div className="sample-role-list" aria-busy={busy}>
              {busy ? Array.from({length: 5}, (_, index) => <div className="sample-role-skeleton" key={index}><i/><span><b/><small/></span></div>) : <>
                <button type="button" disabled={busy} onClick={() => chooseUrl('https://jobs.ashbyhq.com/coinhako/ca138875-277c-4045-858c-3ee0cd5b44ed/')}><span className="sample-role-mark">C</span><span><b>Data Analyst Intern</b><small>Coinhako · Live example</small></span><span aria-hidden="true">›</span></button>
                <button type="button" disabled={busy} onClick={() => chooseUrl('https://jobs.ashbyhq.com/fundingcircle/363c58fa-a6f6-4fc3-8082-d9675110543c')}><span className="sample-role-mark">F</span><span><b>Data Analyst</b><small>Funding Circle · Live example</small></span><span aria-hidden="true">›</span></button>
                <button type="button" disabled={busy} onClick={() => chooseUrl('https://jobs.ashbyhq.com/clera/097bd39b-b268-456f-96dd-2bdcdd68a641/')}><span className="sample-role-mark">C</span><span><b>Full Stack Engineer</b><small>Clera · Live example</small></span><span aria-hidden="true">›</span></button>
                <button type="button" disabled={busy} onClick={() => chooseDemo('data-analyst')}><span className="sample-role-mark">N</span><span><b>Junior Data Analyst</b><small>Offline demo · opens instantly</small></span><span aria-hidden="true">›</span></button>
                <button type="button" disabled={busy} onClick={() => chooseDemo('frontend-engineer')}><span className="sample-role-mark">H</span><span><b>Frontend Engineer Intern</b><small>Offline demo · opens instantly</small></span><span aria-hidden="true">›</span></button>
              </>}
            </div>
          </section>
          <section className="portfolio-nudge"><span>PORTFOLIO TIP</span><p>Add measurable outcomes to your project descriptions to make your matches more useful.</p><Link href="/portfolio">Update portfolio <span aria-hidden="true">→</span></Link></section>
        </aside>
      </div>
    </div>
  </AppShell>;
}

// Loads one saved application, lets the user adjust the resume, and exposes review actions.
export function ReviewFlow({ id }: { id: string }) {
  const [app, setApp] = useState<SavedApp|null>(null); const [resume, setResume] = useState<ResumeData|null>(null); const [busy, setBusy] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  useEffect(() => { jsonRequest<{application:SavedApp}>(`/api/applications/${id}`).then(({application})=>{setApp(application);setResume(application.resume_json);}).catch(e=>setError(e.message)).finally(()=>setBusy(false)); }, [id]);
  // Persist the edited resume and its current analysis together.
  async function save() { if(!app||!resume)return; setSaving(true);setError('');setNotice('');try { await jsonRequest(`/api/applications/${id}`,{method:'PATCH',body:JSON.stringify({resume_json:resume,analysis:app.analysis})});setNotice('Your resume edits are saved locally.'); } catch(e){setError(e instanceof Error?e.message:'Could not save changes.');} finally{setSaving(false);} }
  // Replace one bullet immutably so React can render the edited resume state.
  function updateBullet(itemIndex:number, bulletIndex:number, value:string) { if(!resume)return;setResume({...resume,items:resume.items.map((item,index)=>index===itemIndex?{...item,bullets:item.bullets.map((bullet,n)=>n===bulletIndex?value:bullet)}:item)}); }
  if(busy)return <AppShell><div className="content-wrap"><p>Loading saved application…</p></div></AppShell>;
  if(!app||!resume)return <AppShell><div className="content-wrap"><h1>Application unavailable</h1><p className="error-message">{error||'This saved application could not be found.'}</p><Link href="/applications">Back to application history</Link></div></AppShell>;
  const { analysis } = app;
  const resumeSections = [
    { title: 'Experience', items: resume.items.map((item, itemIndex) => ({ item, itemIndex })).filter(({ item }) => item.item_type === 'experience') },
    { title: 'Projects', items: resume.items.map((item, itemIndex) => ({ item, itemIndex })).filter(({ item }) => item.item_type === 'project') },
    { title: 'Certifications', items: resume.items.map((item, itemIndex) => ({ item, itemIndex })).filter(({ item }) => item.item_type === 'certification') },
  ];
  return <AppShell>
    <div className="content-wrap review-wrap">
      <Link href="/applications" className="back-link">← Application history</Link>
      <PageHeader eyebrow="APPLICATION / REVIEW" title={analysis.job_title} subtitle={`${analysis.company_name} · ${app.location || 'Location not listed'}`} action={<Badge tone="purple">{analysis.match_score}% match</Badge>} />
      <div className="review-grid">
        <div className="analysis-column">
          <section className="card">
            <h2>Match explanation</h2><p>{analysis.match_reasoning}</p>
            <h3>Relevant skills</h3><div className="skill-chips">{analysis.selected_skills.map(skill => <span key={skill} className="skill-chip matched">{skill}</span>)}</div>
            {analysis.skill_gaps.length > 0 && <><h3>Skills to strengthen</h3><div className="skill-chips">{analysis.skill_gaps.map(skill => <span key={skill} className="skill-chip missing">{skill}</span>)}</div></>}
          </section>
          <section className="card evidence-card">
            <h2>Suggested portfolio evidence</h2>
            {analysis.selected_items.length ? analysis.selected_items.map(item => <div className="evidence-row" key={item.item_id}><div><b>{resume.items.find(source => source.item_id === item.item_id)?.title || 'Portfolio item'}</b><p>{item.reason}</p></div></div>) : <p>No portfolio items were selected. Add project or experience descriptions, then run a new analysis.</p>}
          </section>
          <details className="card outreach-card review-outreach">
            <summary><span><b>Recruiter outreach</b><small>{analysis.email_subject}</small></span><span aria-hidden="true">＋</span></summary>
            <div className="outreach-details-body"><div className="outreach-copy">{analysis.email_body}</div>
              {analysis.hr_email ? <p className="field-hint">Recipient: {analysis.hr_email}</p> : <p className="field-hint">No recipient was found. The copied email will include the subject and message only.</p>}
              <button className="button outline" onClick={async () => {
                try {
                  setError(''); setNotice('');
                  const email = `${analysis.hr_email ? `To: ${analysis.hr_email}\n` : ''}Subject: ${analysis.email_subject}\n\n${analysis.email_body}`;
                  await navigator.clipboard.writeText(email);
                  setNotice('Email copied. Paste it into Gmail, then review and send.');
                } catch { setError('Could not access the clipboard. Check browser permissions and try again.'); }
              }}><Mail size={15}/>Copy email</button>
            </div>
          </details>
          <section className="card resume-content-card">
            <h2>Tailored resume content</h2>
            <label className="field-label" htmlFor="resume-summary">Summary</label>
            <textarea id="resume-summary" className="field-input" value={resume.summary} onChange={e => setResume({ ...resume, summary: e.target.value })}/>
            {resumeSections.map(section => section.items.length > 0 && <div className="resume-edit-group" key={section.title}>
              <h3>{section.title}</h3>
              {section.items.map(({ item, itemIndex }) => <div className="resume-edit-item" key={item.item_id}><h4>{item.title}</h4>
                {item.bullets.map((bullet, bulletIndex) => <textarea className="field-input resume-bullet" aria-label={`${item.title} bullet ${bulletIndex + 1}`} key={bulletIndex} value={bullet} onChange={e => updateBullet(itemIndex, bulletIndex, e.target.value)}/>)}
              </div>)}
            </div>)}
          </section>
        </div>
        <div className="tailoring-column">
          <section className="card resume-preview-card">
            <div className="resume-preview-heading"><div><h2>Resume preview</h2><p>Polished PDF · ready to download</p></div><a className="button outline small" href={`/api/applications/${id}/pdf`}>Download PDF <span aria-hidden="true">↓</span></a></div>
            <div className="resume-document-frame"><ResumePreview data={resume}/></div>
          </section>
        </div>
      </div>
      <div className="review-actions"><span>{notice && <span className="saved-note">{notice}</span>}{error && <span className="error-message" role="alert">{error}</span>}</span><button className="button primary" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save resume edits'}</button></div>
    </div>
  </AppShell>;
}

// Presents saved applications with filtering, sorting, and pagination controls.
export function HistoryFlow() {
  const router = useRouter(); const [applications, setApplications] = useState<SavedApp[]>([]); const [query, setQuery] = useState(''); const [status, setStatus] = useState('All statuses'); const [page, setPage] = useState(1); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { loadApplications().then(({applications:data})=>setApplications(data)).catch(e=>setError(e.message)).finally(()=>setLoading(false)); }, []);
  const visible = applications.filter(app=>`${app.company_name} ${app.job_title}`.toLowerCase().includes(query.toLowerCase())&&(status==='All statuses'||app.status===status));
  const pageSize = 8; const pageCount = Math.max(1, Math.ceil(visible.length / pageSize)); const pageItems = visible.slice((page - 1) * pageSize, page * pageSize);
  const averageMatch = applications.length ? Math.round(applications.reduce((sum, app) => sum + app.analysis.match_score, 0) / applications.length) : 0;
  const topMatch = applications.reduce<SavedApp | null>((top, app) => !top || app.analysis.match_score > top.analysis.match_score ? app : top, null);
  return <AppShell><div className="content-wrap history-page"><PageHeader eyebrow="YOUR JOB SEARCH" title="Application History" subtitle="Applications analyzed and saved to your workspace." action={<button className="button primary" onClick={()=>router.push('/new-application')}><span aria-hidden="true">＋</span> New application</button>}/><section className="history-stats" aria-label="Application summary"><article className="history-stat card"><span>TOTAL APPLICATIONS</span><div><b>{loading?'—':applications.length}</b><small>saved</small></div></article><article className="history-stat card"><span>AVG. MATCH RATE</span><div><b>{loading?'—':`${averageMatch}%`}</b><small>fit score</small></div></article><article className="history-stat card"><span>TOP MATCH</span><div><b>{loading?'—':topMatch?`${topMatch.analysis.match_score}%`:'—'}</b><small>{topMatch?.company_name||'No matches yet'}</small></div></article><article className="history-stat card"><span>DATABASE STATUS</span><div className="database-state"><i/> {loading?'Loading':error?'Unavailable':'Connected'}</div></article></section><section className="card history-card"><div className="history-toolbar"><label className="search-box"><span aria-hidden="true">⌕</span><input aria-label="Search company or role" placeholder="Search company or role" value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}}/></label><select className="field-input" aria-label="Filter by status" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option>All statuses</option>{['Analyzed','Draft Created','Applied','Interview','Rejected'].map(value=><option key={value}>{value}</option>)}</select></div>{error&&<p className="error-message history-error" role="alert">{error}</p>}{loading?<div className="history-loading">Loading applications…</div>:visible.length===0?<div className="empty-state"><b>{applications.length?'No matching applications':'No applications yet'}</b><span>{applications.length?'Adjust your search or filter.':'Analyze a sample posting to create your first saved review.'}</span><button className="button primary" onClick={()=>router.push('/new-application')}>Analyze a job</button></div>:<><div className="table-scroll"><table className="applications-table"><thead><tr><th>COMPANY / ROLE</th><th>MATCH</th><th>STATUS</th><th><span className="sr-only">Action</span></th></tr></thead><tbody>{pageItems.map((app,index)=><tr key={app.id} onClick={()=>router.push(`/applications/${app.id}/review`)} tabIndex={0} onKeyDown={e=>e.key==='Enter'&&router.push(`/applications/${app.id}/review`)} aria-label={`Review ${app.job_title} at ${app.company_name}`}><td><div className="table-company"><span className={`company-mark mark-${index%3}`}>{app.company_name.slice(0,1)}</span><span><b>{app.company_name}</b><small>{app.job_title}</small></span></div></td><td><div className="table-match"><b>{app.analysis.match_score}%</b><span className="mini-progress"><i style={{width:`${app.analysis.match_score}%`}}/></span></div></td><td><Badge tone="purple">{app.status}</Badge></td><td><span className="row-open" aria-hidden="true">↗</span></td></tr>)}</tbody></table></div><div className="history-footer"><span>Showing <b>{(page-1)*pageSize+1}–{Math.min(page*pageSize,visible.length)}</b> of <b>{visible.length}</b> applications</span><nav className="history-pagination" aria-label="Application history pages"><button type="button" disabled={page===1} onClick={()=>setPage(current=>Math.max(1,current-1))}>Previous</button>{Array.from({length:pageCount},(_,index)=><button type="button" key={index+1} className={page===index+1?'current':''} aria-current={page===index+1?'page':undefined} onClick={()=>setPage(index+1)}>{index+1}</button>)}<button type="button" disabled={page===pageCount} onClick={()=>setPage(current=>Math.min(pageCount,current+1))}>Next</button></nav></div></>}</section></div></AppShell>;
}
