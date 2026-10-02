'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BriefcaseBusiness, FolderKanban, LayoutDashboard, Menu, X, Sparkles } from '../ui/icons';
import { useState } from 'react';

const links = [
  { href: '/new-application', label: 'New Application', icon: LayoutDashboard },
  { href: '/applications', label: 'Application History', icon: BriefcaseBusiness },
  { href: '/portfolio', label: 'My Portfolio', icon: FolderKanban },
];
export function Sidebar() {
  const pathname = usePathname(); const [open, setOpen] = useState(false);
  return <>
    <button className="mobile-menu" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={19}/></button>
    {open && <button aria-label="Close navigation" className="drawer-scrim" onClick={() => setOpen(false)} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand"><Link href="/" onClick={() => setOpen(false)} aria-label="Draftly home" style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'inherit' }}><span className="brand-mark"><Sparkles size={17}/></span><span>Draftly</span></Link><button className="drawer-close" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={18}/></button></div>
      <div className="side-label">WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation">{links.map(({href,label,icon:Icon}) => <Link key={href} href={href} onClick={() => setOpen(false)} className={`side-link ${pathname === href || (href === '/applications' && pathname.includes('/applications/')) ? 'active' : ''}`}><Icon size={17}/><span>{label}</span></Link>)}</nav>
      <div className="side-rule"/><div className="side-label">DEMO WORKSPACE</div><div className="side-demo-note"><span className="side-demo-mark"><Sparkles size={13}/></span><span>Fictional sample profile<br/>Portfolio data is for demonstration.</span></div>
      <div className="profile"><div className="avatar">AM</div><div className="profile-copy"><b>Alex Morgan</b><span>Demo candidate</span></div></div>
    </aside>
  </>;
}
