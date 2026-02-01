"use client";

import { motion, useMotionTemplate, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";

type GridBackgroundProps = {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  relX: MotionValue<number>;
  relY: MotionValue<number>;
  highlightOpacity: MotionValue<number>;
};

export function GridBackground({
  mouseX,
  mouseY,
  relX,
  relY,
  highlightOpacity,
}: GridBackgroundProps) {
  const rotateX = useTransform(relY, [0, 1], [8, -8]);
  const rotateY = useTransform(relX, [0, 1], [-8, 8]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-screen opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0%, rgba(var(--primary), 0.35) 50%, transparent 100%), linear-gradient(0deg, transparent 0%, rgba(var(--primary), 0.25) 50%, transparent 100%)",
          backgroundSize: "200% 2px, 2px 200%",
        }}
        animate={{ backgroundPosition: ["0% 0%, 0% 0%", "200% 0%, 0% 200%"] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: highlightOpacity,
          transformPerspective: 800,
          rotateX,
          rotateY,
        }}
      >
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                280px circle at ${mouseX}px ${mouseY}px,
                rgba(var(--primary), 0.35),
                transparent 80%
              )
            `,
          }}
        />
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--primary),0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--primary),0.35)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none mix-blend-screen"
          style={{
            maskImage: useMotionTemplate`
              radial-gradient(
                200px circle at ${mouseX}px ${mouseY}px,
                black,
                transparent
              )
            `,
            WebkitMaskImage: useMotionTemplate`
              radial-gradient(
                200px circle at ${mouseX}px ${mouseY}px,
                black,
                transparent
              )
            `,
          }}
        />
      </motion.div>
    </div>
  );
}
