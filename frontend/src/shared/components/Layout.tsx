import Link from 'next/link';
import type { ReactNode } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/uploads', label: 'Uploads' },
  { href: '/uploads/new', label: 'Subir CSV' },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
          <span className="font-semibold text-slate-900">Procesador de CSV</span>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-slate-600 hover:text-blue-700">
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
