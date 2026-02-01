"use client";

import { cn } from "@docs/utils/cn";
import { siteConfig } from "@/fumadocs.config";
import Image from "next/image";

export default function Logo({
  classNameIcon,
  className,
}: {
  classNameIcon?: string;
  className?: string;
}) {
  return (
    <>
      <Image
        src={siteConfig.icon}
        alt={siteConfig.name}
        width={24}
        height={24}
        className={cn("h-6 w-auto cursor-grabbing", classNameIcon)}
      />
      <span
        className={cn(
          "mt-0.5 select-none text-center font-medium font-title text-foreground text-xl transition",
          className
        )}
      >
        {siteConfig.name}
      </span>
    </>
  );
}
