/** Public landing page for the Draftly sample workspace. */
import Link from 'next/link';
import { ArrowRight, Check, FileText, Sparkles, Target } from '@/src/components/ui/icons';

const steps = [
  { number: '01', title: 'Bring a role', text: 'Paste a job link or choose a sample posting to get started.' },
  { number: '02', title: 'See your evidence', text: 'Connect the work in your portfolio to the role requirements.' },
  { number: '03', title: 'Make it yours', text: 'Review the tailored resume and prepare a thoughtful outreach.' },
];

export default function HomePage() {
  return <main className="landing-page">
    <header className="landing-nav">
      <Link className="landing-brand" href="/" aria-label="Draftly home">
        <span className="brand-mark"><Sparkles size={17}/></span><span>Draftly</span>
      </Link>
      <nav className="landing-nav-links" aria-label="Main navigation">
        <a href="#how-it-works">How it works</a>
        <Link href="/portfolio">Explore portfolio</Link>
        <Link className="landing-login" href="/new-application">Open workspace</Link>
        <Link className="button primary landing-nav-cta" href="/login">Get started <ArrowRight size={15}/></Link>
      </nav>
    </header>

    <section className="landing-hero">
      <div className="landing-copy">
        <div className="landing-eyebrow"><span className="status-dot"/> A more considered job search</div>
        <h1><span>Let your work</span><em>lead the way.</em></h1>
        <p className="landing-description">Draftly helps you find the strongest evidence for a role, shape a clear resume, and write an introduction that sounds like you.</p>
        <div className="landing-actions">
          <Link href="/login" className="button primary landing-cta">Start with the demo <ArrowRight size={16}/></Link>
          <Link href="/new-application" className="landing-secondary">Go straight to a job <span aria-hidden>→</span></Link>
        </div>
        <div className="landing-proof"><span><Check size={14}/> Grounded in your portfolio</span><span><Check size={14}/> Review every suggestion</span></div>
      </div>

      <div className="landing-product-wrap" role="img" aria-label="Sample preview of the Draftly application workspace, showing fictional role match and portfolio evidence details.">
        <div className="landing-product-stack">
          <div className="landing-product-back" aria-hidden="true" />
          <div className="landing-product">
            <div className="landing-product-top"><span className="product-window-dots"><i/><i/><i/></span><span>APPLICATION WORKSPACE</span><span className="product-window-status"><i/> Ready</span></div>
            <div className="product-job-card">
              <div className="product-company-mark">N</div>
              <div className="product-job-copy"><small>ROLE MATCH</small><b>Product Designer</b><span>Northstar Studio · Remote</span></div>
              <span className="product-match-score">86%<small>match</small></span>
            </div>
            <div className="product-evidence-heading"><span>PORTFOLIO EVIDENCE</span><span>View all ↗</span></div>
            <article className="product-evidence"><span className="product-evidence-icon"><Target size={15}/></span><span><b>Mobile banking redesign</b><small>Research · Prototyping · Accessibility</small></span><Check size={15}/></article>
            <article className="product-evidence"><span className="product-evidence-icon muted"><FileText size={15}/></span><span><b>Checkout conversion study</b><small>Experiment design · 18% lift</small></span><Check size={15}/></article>
            <div className="product-resume-bar"><span className="product-resume-icon"><FileText size={16}/></span><span><b>Tailored resume</b><small>Ready for your review</small></span><ArrowRight size={15}/></div>
            <div className="product-note"><Sparkles size={14}/><span>Every suggestion connects back to your work.</span></div>
          </div>
        </div>
        <span className="product-sample-note">SAMPLE WORKSPACE · ILLUSTRATIVE DETAILS</span>
      </div>
      <div className="landing-hero-index"><span>01</span><i/><span>03</span><small>FROM WORK TO APPLICATION</small></div>
    </section>

    <section className="landing-process" id="how-it-works" aria-labelledby="process-title">
      <div className="process-heading"><span className="eyebrow">A CLEARER WAY FORWARD</span><h2 id="process-title">A strong application starts with your work.</h2><p>One focused flow takes you from a job posting to a tailored, reviewable draft.</p></div>
      <div className="process-grid">{steps.map((step) => <article className="process-card" key={step.number}><span className="process-number">{step.number}</span><h3>{step.title}</h3><p>{step.text}</p><span className="process-arrow" aria-hidden>↗</span></article>)}</div>
    </section>

    <section className="landing-start-panel"><div><span className="eyebrow">YOUR NEXT APPLICATION</span><h2>Start with what you’ve already done.</h2><p>Explore the sample workspace and see how your portfolio can support a real opportunity.</p></div><Link href="/login" className="button primary">Open the workspace <ArrowRight size={16}/></Link></section>
    <footer className="landing-footer"><Link className="landing-brand" href="/"><span className="brand-mark"><Sparkles size={15}/></span><span>Draftly</span></Link><span>Thoughtful applications, grounded in your work.</span><span>Fictional sample workspace</span></footer>
  </main>;
}
