"use client";

import Divider from "@docs/components/landing/divider";
import { siteConfig } from "@/fumadocs.config";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue } from "motion/react";
import Link from "next/link";

import { GridBackground } from "./grid-background";
import { HeroOrbitalSystem } from "./hero-orbital-system";

export function Hero() {
  const orbitSize = siteConfig.hero?.orbitSize ?? 360;
  const coreSize = siteConfig.hero?.coreSize ?? 22;
  const imageScale = siteConfig.hero?.imageScale ?? 16;
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const relX = useMotionValue(0.5);
  const relY = useMotionValue(0.5);
  const highlightOpacity = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    mouseX.set(x);
    mouseY.set(y);
    relX.set(width ? x / width : 0.5);
    relY.set(height ? y / height : 0.5);
    highlightOpacity.set(1);
  }

  function handleMouseLeave() {
    highlightOpacity.set(0);
  }

  return (
    <section
      className="bg-background transition relative overflow-hidden min-h-[520px] flex items-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <GridBackground
        mouseX={mouseX}
        mouseY={mouseY}
        relX={relX}
        relY={relY}
        highlightOpacity={highlightOpacity}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-fd-primary/5 via-fd-primary/10 to-background blur-3xl -z-10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-fd-primary/20 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] -z-10 animate-pulse delay-1000" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/15 rounded-full blur-[110px] -z-10 animate-pulse delay-500" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-400/15 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />

      <div className="relative w-full py-8 md:py-14">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="space-y-8 max-w-3xl flex-1 text-center lg:text-left z-10"
              initial={{
                opacity: 0,
                y: 20,
              }}
              transition={{
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <h1 className="text-balance font-bold text-4xl md:text-5xl lg:text-6xl lg:leading-tight tracking-tight bg-gradient-to-r from-foreground via-foreground/80 to-foreground/40 bg-clip-text text-transparent drop-shadow-sm">
                {siteConfig.hero.title}
              </h1>

              <p className="text-balance text-foreground/70 sm:text-lg md:text-xl font-light">
                {siteConfig.hero.subtitle}
              </p>

              <div className="flex flex-col gap-4 sm:flex-row justify-center lg:justify-start">
                <Button asChild size="lg" className="bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90 shadow-lg shadow-fd-primary/20 transition-all hover:scale-105">
                  <Link href="/docs/guides">Explore Docs</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-fd-primary/20 hover:bg-fd-primary/5 hover:border-fd-primary/40 backdrop-blur-sm transition-all hover:scale-105">
                  <Link href="/docs/components">Explore components</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              animate={{ opacity: 1, x: 0, scale: 1 }}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 relative w-full max-w-[280px] lg:max-w-none flex justify-center lg:justify-end"
            >
              <HeroOrbitalSystem
                orbitSize={orbitSize}
                coreSize={coreSize}
                imageScale={imageScale}
                centerImage={siteConfig.hero?.centerImage}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
