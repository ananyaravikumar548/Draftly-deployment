/**
 * Shared application frame that places the sidebar beside each workspace screen.
 */
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
export function AppShell({ children }: { children: ReactNode }) { return <div className="app-shell"><Sidebar/><main className="main-area">{children}</main></div>; }
