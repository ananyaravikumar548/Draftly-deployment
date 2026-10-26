'use client';
// Workspace navigation with active-route highlighting.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BriefcaseBusiness, FolderKanban, LayoutDashboard, Sparkles } from '../ui/icons';

const links = [
  { href: '/new-application', label: 'New application', icon: LayoutDashboard },
  { href: '/applications', label: 'Applications', icon: BriefcaseBusiness },
  { href: '/portfolio', label: 'Portfolio', icon: FolderKanban },
];

export function Sidebar() {
  const pathname = usePathname();

  return <header className={`workspace-header${pathname === '/new-application' || pathname.startsWith('/applications') || pathname.startsWith('/portfolio') ? ' application-top-nav' : ''}`}>
    <Link className="workspace-brand" href="/" aria-label="Draftly home">
      <span className="brand-mark"><Sparkles size={17}/></span>
      <span className="workspace-brand-name">Draftly</span>
      <span className="workspace-brand-divider" aria-hidden="true"/>
      <span className="workspace-brand-context">Career workspace</span>
    </Link>
    <nav className="workspace-nav" aria-label="Workspace navigation">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href === '/applications' && pathname.includes('/applications/'));
        return <Link key={href} href={href} className={`workspace-nav-link ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined}>
          <Icon size={16}/><span>{label}</span>
        </Link>;
      })}
    </nav>
    <div className="workspace-header-tools">
      <span className="workspace-demo-pill"><i/> Sample workspace</span>
      <div className="workspace-user" aria-label="Signed in as Alex Morgan">
        <span className="workspace-user-avatar">AM</span>
        <span className="workspace-user-copy"><b>Alex Morgan</b><small>Demo profile</small></span>
      </div>
    </div>
  </header>;
}
