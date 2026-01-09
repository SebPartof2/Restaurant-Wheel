import type { ReactNode } from 'react';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout wrapper component with navigation and consistent spacing
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-8">
        {children}
      </main>
    </div>
  );
}
