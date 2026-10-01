'use client';

import { RootProvider } from 'fumadocs-ui/provider/base';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Provider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RootProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </RootProvider>
    </ThemeProvider>
  );
}
