import Link from 'next/link';
import { ArrowRight, Check, FileText, Sparkles, Target } from '@/src/components/ui/icons';

const steps = [
  { number: '01', title: 'Add a role', text: 'Paste a job description or explore one of the sample postings.' },
  { number: '02', title: 'Find your fit', text: 'See where your portfolio matches the role and what evidence supports it.' },
  { number: '03', title: 'Draft with care', text: 'Review a tailored resume and export a polished PDF.' },
];

export default function HomePage() {
  return <main className="landing-page">
    <header className="landing-nav">
      <Link className="brand" href="/"><span className="brand-mark"><Sparkles size={17}/></span><span>Draftly</span></Link>
      <nav aria-label="Main navigation"><Link className="landing-login" href="/login">Log in</Link><Link className="button primary small" href="/login">Get started <ArrowRight size={15}/></Link></nav>
    </header>
    <section className="landing-hero">
      <div className="landing-copy">
        <div className="landing-eyebrow"><span className="status-dot"/> A calmer way to apply</div>
        <h1>Your experience,<br/><em>in the right light.</em></h1>
        <p className="landing-tagline">Your portfolio, tailored.<br/>Your application, drafted.</p>
        <p className="landing-description">Make every application feel considered. Draftly connects the work you have done to the opportunities you want, then helps you shape a clear, honest application.</p>
        <div className="landing-actions"><Link href="/login" className="button primary landing-cta">Get started <ArrowRight size={16}/></Link><Link href="/new-application" className="landing-secondary">Explore the demo <span aria-hidden>→</span></Link></div>
        <div className="landing-proof"><span><Check size={14}/> Evidence-led suggestions</span><i/><span><Check size={14}/> Your portfolio stays yours</span></div>
      </div>
      <div className="landing-art" aria-label="Illustration of a tailored application workspace">
        <div className="art-glow"/>
        <div className="art-sheet art-sheet-back"><div className="art-sheet-top"><span/><span/><span/></div><div className="art-back-content"><b/><i/><i/><i/><b/><i/><i/></div></div>
        <div className="art-sheet art-sheet-front"><div className="art-document-brand"><span className="art-document-mark"><Sparkles size={12}/></span> DRAFTLY <small>APPLICATION BRIEF</small></div><div className="art-document-title">A clearer story<br/>for your next step.</div><div className="art-document-rule"/><div className="art-document-lines"><i/><i/><i/><i/></div><div className="art-document-tags"><span>PRODUCT</span><span>RESEARCH</span><span>IMPACT</span></div><div className="art-match"><div className="art-match-icon"><Target size={15}/></div><div><b>Strong alignment</b><small>3 portfolio projects identified</small></div><span className="art-match-score">88%</span></div></div>
        <div className="art-float art-float-left"><span className="art-float-icon"><FileText size={16}/></span><span><b>Resume draft</b><small>Ready to review</small></span><Check size={15}/></div>
        <div className="art-float art-float-right"><span className="art-sparkle-small"><Sparkles size={15}/></span><span><b>Made for this role</b><small>Grounded in your work</small></span></div>
        <div className="art-caption">A thoughtful start to a better application.</div>
      </div>
    </section>
    <section className="landing-process" aria-labelledby="process-title"><div className="process-heading"><span className="eyebrow">A SIMPLE, THOUGHTFUL FLOW</span><h2 id="process-title">From portfolio to prepared.</h2><p>Everything you need to make the next application feel more like you.</p></div><div className="process-grid">{steps.map((step) => <article className="process-card" key={step.number}><span className="process-number">{step.number}</span><h3>{step.title}</h3><p>{step.text}</p><span className="process-arrow" aria-hidden>↗</span></article>)}</div></section>
    <footer className="landing-footer"><Link className="brand" href="/"><span className="brand-mark"><Sparkles size={15}/></span><span>Draftly</span></Link><span>Your portfolio, tailored. Your application, drafted.</span><span>Fictional demo workspace</span></footer>
  </main>;
}
