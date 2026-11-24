import React from 'react';
import { ROUTES, linkClick } from '../lib/router';

export const Logo: React.FC<{ to?: string }> = ({ to = ROUTES.home }) => (
  <a
    href={to}
    onClick={linkClick(to)}
    className="flex items-center gap-2.5 whitespace-nowrap rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
  >
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 font-mono text-sm font-bold text-white">
      S
    </span>
    <span className="text-lg font-extrabold tracking-tight text-slate-900">
      Sentinel<span className="font-semibold text-blue-600"> · Trading</span>
    </span>
  </a>
);
