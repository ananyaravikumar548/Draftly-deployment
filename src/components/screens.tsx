'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check, FileText, Sparkles } from './ui/icons';
import { NewApplicationFlow, ReviewFlow, HistoryFlow } from './ApplicationFlows';
import { PortfolioManager } from './portfolio/PortfolioManager';

export function LoginScreen() {
  const router = useRouter();
  return <main className="login-page">
    <header className="login-topbar"><Link className="brand" href="/"><span className="brand-mark"><Sparkles size={17}/></span><span>Draftly</span></Link><Link href="/" className="login-back">Back to home</Link></header>
    <section className="login-brand">
      <span className="login-badge">YOUR NEXT CHAPTER, WELL PREPARED</span>
      <div className="login-pitch"><h1>Your portfolio,<br/><em>tailored.</em></h1><p>Bring your experience into focus, find the strongest evidence for each role, and draft an application that feels considered.</p>
        <div className="feature-list"><div><span><Check size={14}/></span>Clear job and portfolio alignment</div><div><span><Check size={14}/></span>A complete resume, ready to review</div><div><span><Check size={14}/></span>One calm place for your applications</div></div>
      </div>
      <div className="quote-card"><Sparkles size={16}/><span>Your portfolio, tailored. Your application, drafted.</span></div>
    </section>
    <section className="login-side"><div className="login-card"><div className="login-icon"><Sparkles size={19}/></div><span className="demo-entry-label">DRAFTLY DEMO WORKSPACE</span><h2>Welcome to Draftly</h2><p>Step into a complete sample workspace with a fictional portfolio and example roles.</p><button className="button primary wide" onClick={()=>router.push('/new-application')}>Continue to sample workspace <ArrowRight size={16}/></button><div className="auth-coming"><Sparkles size={14}/><span><b>Personal sign-in is coming soon</b><small>Google and email login will be connected in the final integration stage.</small></span></div><Link className="text-button login-portfolio-link" href="/portfolio"><FileText size={14}/> Preview the sample portfolio <ArrowRight size={13}/></Link></div><footer><span>Fictional sample data</span><span>© 2026 Draftly</span></footer></section>
  </main>;
}

export { NewApplicationFlow as NewApplicationScreen };
export function ReviewScreen({ id }: { id: string }) { return <ReviewFlow id={id}/>; }
export { PortfolioManager as PortfolioScreen };
export { HistoryFlow as HistoryScreen };
