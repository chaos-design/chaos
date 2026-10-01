import {
  ArrowRightIcon,
  BlocksIcon,
  CheckIcon,
  Code2Icon,
  Layers3Icon,
  SparklesIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const stack = [
  {
    icon: Layers3Icon,
    name: 'Next.js',
    detail: 'App Router and React Server Components',
  },
  {
    icon: BlocksIcon,
    name: 'shadcn/ui',
    detail: 'Editable components built on Base UI',
  },
  {
    icon: SparklesIcon,
    name: 'Tailwind CSS',
    detail: 'CSS-first configuration with semantic tokens',
  },
  {
    icon: Code2Icon,
    name: 'Biome',
    detail: 'One tool for formatting and code checks',
  },
] as const;

export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-5 py-10 sm:px-8 sm:py-16">
      <header className="flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-foreground text-background">
            <Code2Icon aria-hidden />
          </div>
          <div>
            <p className="font-medium">create-chaos</p>
            <p className="text-xs text-muted-foreground">Next.js workspace</p>
          </div>
        </div>
        <Badge variant="outline">
          <CheckIcon data-icon="inline-start" />
          Ready
        </Badge>
      </header>

      <section className="flex flex-1 flex-col justify-center py-14 sm:py-20">
        <div className="max-w-2xl">
          <Badge variant="secondary">Modern React starter</Badge>
          <h1 className="mt-5 text-balance font-heading text-4xl font-semibold tracking-normal sm:text-6xl">
            Start with the application, not the setup.
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
            A production-ready Next.js foundation with shadcn/ui, Tailwind CSS,
            lucide-react, and Biome already connected.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              className={buttonVariants({ size: 'lg' })}
              href="https://ui.shadcn.com/docs/components"
              rel="noreferrer"
              target="_blank"
            >
              Browse components
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
            <Link
              className={buttonVariants({ variant: 'outline', size: 'lg' })}
              href="https://nextjs.org/docs"
              rel="noreferrer"
              target="_blank"
            >
              Next.js docs
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          {stack.map(({ icon: Icon, name, detail }) => (
            <Card key={name} size="sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon aria-hidden />
                  <CardTitle>{name}</CardTitle>
                </div>
                <CardDescription>{detail}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <footer className="flex flex-col gap-3 border-t pt-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Edit <code className="text-foreground">app/page.tsx</code> to begin.
        </p>
        <code className="w-fit rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">
          pnpm dlx shadcn@latest add
        </code>
      </footer>
    </main>
  );
}
