"use client";

import { BlurMagic } from "@docs/components/blurmagic/blurmagic";
import { FloatNav } from "@docs/components/float-nav";
import { Icon as NotFoundIcon } from "@docs/components/icon";
import { BgLines } from "@docs/components/landing/bg-lines";
import Divider from "@docs/components/landing/divider";
import Footer from "@docs/components/landing/footer";
import Navbar from "@docs/components/landing/navbar/navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CONTAINER_DURATION = 0.24;
const CONTAINER_EASE_X0 = 0.22;
const CONTAINER_EASE_X1 = 0.8;
const CONTAINER_EASE_X2 = 0.2;
const CONTAINER_EASE_X3 = 1;
const CONTAINER_EASE = [
  CONTAINER_EASE_X0,
  CONTAINER_EASE_X1,
  CONTAINER_EASE_X2,
  CONTAINER_EASE_X3,
] as const;

export default function NotFound() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const containerMotion = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: CONTAINER_DURATION, ease: CONTAINER_EASE },
      };

  return (
    <div className="relative isolate bg-primary transition">
      <BgLines />
      <main className="relative mx-auto min-h-screen w-full max-w-7xl overflow-y-auto">
        <BlurMagic
          background="var(--color-background)"
          blur="4px"
          className="-translate-x-1/2! left-1/2! z-20 h-[120px]! w-full! max-w-[inherit]!"
          side="top"
          stop="50%"
        />
        <Navbar className="mx-auto w-full" />
        <Divider orientation="vertical" />
        <Divider className="right-auto left-0" orientation="vertical" />
        <section className="flex flex-col overflow-hidden">
          <div className="relative mx-auto flex w-full flex-1 flex-col items-center pt-32 pb-24 text-center">
            <motion.div
              {...containerMotion}
              className="flex w-full flex-col items-center gap-8 border bg-background/80 p-10 backdrop-blur"
            >
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-border/50 bg-muted/40">
                <NotFoundIcon className="h-20 w-20 text-foreground" />
              </div>
              <div className="space-y-3">
                <p className="font-semibold text-brand text-sm uppercase tracking-[0.3em]">
                  Error 404
                </p>
                <h1 className="text-balance font-semibold font-title text-4xl text-foreground tracking-tight sm:text-5xl">
                  You found Nothing.
                </h1>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button onClick={() => router.back()} variant="outline">
                  <ArrowLeft aria-hidden className="h-4 w-4" />
                  Go back
                </Button>
                <Button asChild variant="default">
                  <Link href="/">
                    <Home aria-hidden className="h-4 w-4" />
                    Take me home
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
          <Footer />
        </section>
        <BlurMagic
          background="var(--color-background)"
          className="-translate-x-1/2! left-1/2! z-20 h-[120px]! w-full! max-w-[inherit]!"
          side="bottom"
        />
        <FloatNav />
      </main>
    </div>
  );
}
