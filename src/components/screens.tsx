'use client';
// Screen-level components that connect route pages to the larger UI flows.

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check, FileText, Sparkles } from './ui/icons';
import { NewApplicationFlow, ReviewFlow, HistoryFlow } from './ApplicationFlows';
import { PortfolioManager } from './portfolio/PortfolioManager';

// Provide the demo workspace entry point and explain the sample-data context.
export function LoginScreen() {
  const router = useRouter();
  return <main className="login-page">
    <section className="login-brand">
      <Link className="login-brand-wordmark" href="/" aria-label="Draftly home"><span className="brand-mark"><Sparkles size={17}/></span><span>Draftly</span></Link>
      <span className="login-badge"><Sparkles size={12}/> YOUR WORK, IN THE RIGHT LIGHT</span>
      <div className="login-pitch"><h1><span>Make your next</span><span>move <em>with clarity.</em></span></h1><p>See how your experience connects to a role, then shape an application with evidence behind every claim.</p>
        <div className="feature-list"><div><span><Check size={14}/></span>Find relevant portfolio evidence</div><div><span><Check size={14}/></span>Review a focused resume draft</div><div><span><Check size={14}/></span>Keep every edit in your hands</div></div>
      </div>
      <div className="login-side-note"><span className="login-note-mark"><FileText size={17}/></span><span><b>A thoughtful starting point</b><small>One workspace for the role, your evidence, and your draft.</small></span><ArrowRight size={15}/></div>
    </section>
    <section className="login-side">
      <Link href="/" className="login-back"><span aria-hidden="true">←</span> Back to home</Link>
      <div className="login-card">
      <span className="login-card-kicker">YOUR SAMPLE WORKSPACE</span><h2>Start with the demo</h2><p>No account setup needed. Explore a complete sample profile and build a tailored application from a job posting.</p>
      <ol className="login-preview-list"><li><i>01</i><span><b>Choose a role</b><small>Use a live link or a sample job</small></span></li><li><i>02</i><span><b>Review your match</b><small>See the evidence behind the score</small></span></li><li><i>03</i><span><b>Shape your draft</b><small>Edit, save, and export your resume</small></span></li></ol>
      <button className="button primary wide" onClick={()=>router.push('/new-application')}>Get started <ArrowRight size={16}/></button>
      <Link className="login-portfolio-link" href="/portfolio"><FileText size={15}/> Preview the sample portfolio <ArrowRight size={14}/></Link>
      <div className="login-demo-foot"><span className="login-demo-dot"/> Fictional sample data · safe to explore</div>
      </div>
      <footer><span>Draftly sample workspace</span><span>© 2026 Draftly</span></footer>
    </section>
  </main>;
}

export { NewApplicationFlow as NewApplicationScreen };
export function ReviewScreen({ id }: { id: string }) { return <ReviewFlow id={id}/>; }
export { PortfolioManager as PortfolioScreen };
export { HistoryFlow as HistoryScreen };
