"use client";

import { siteConfig } from "@/fumadocs.config";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden pt-12 pb-16">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center font-black font-title text-[clamp(3rem,20vw,12rem)] uppercase bg-gradient-to-b from-fd-primary/20 to-transparent bg-clip-text text-transparent"
      >
        {siteConfig.name}
      </span>
      {siteConfig?.links?.github && (
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <a
            className="group my-10 flex items-center gap-2 rounded-sm px-3 py-2 hover:bg-primary hover:shadow-custom hover:backdrop-blur-xs"
            href={siteConfig?.links?.github}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="whitespace-nowrap text-foreground text-sm">
              Made by
            </span>
            <span className="whitespace-nowrap font-medium text-foreground text-sm">
              {siteConfig.author}
            </span>
          </a>
        </div>
      )}
    </footer>
  );
}
