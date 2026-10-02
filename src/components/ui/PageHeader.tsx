import type { ReactNode } from 'react';
export function PageHeader({title,subtitle,eyebrow,action}: {title:string;subtitle:string;eyebrow?:string;action?:ReactNode}) { return <header className="page-header"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1><p>{subtitle}</p></div>{action && <div className="header-action">{action}</div>}</header>; }
