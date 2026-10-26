/**
 * Small reusable label whose visual tone is selected by a CSS class.
 */
import type { ReactNode } from 'react';
export function Badge({children,tone='neutral'}:{children:ReactNode;tone?:string}) { return <span className={`badge badge-${tone}`}>{children}</span>; }
