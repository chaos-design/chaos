"use client";

import { OrbitalSystem } from "./orbital-system";

type HeroOrbitalSystemProps = {
  orbitSize: number;
  coreSize: number;
  imageScale: number;
  centerImage?: string;
};

export function HeroOrbitalSystem({
  orbitSize,
  coreSize,
  imageScale,
  centerImage,
}: HeroOrbitalSystemProps) {
  const orbitInsets = [146, 122, 86, 56, 32, 14, 0];
  const orbitLineColors = [
    "rgba(212, 175, 55, 0.5)",
    "rgba(59, 130, 246, 0.35)",
    "rgba(168, 85, 247, 0.3)",
    "rgba(16, 185, 129, 0.25)",
    "rgba(245, 158, 11, 0.2)",
    "rgba(14, 165, 233, 0.16)",
    "rgba(212, 175, 55, 0.12)",
  ];
  const orbitDurations = [42, 36, 30, 24, 20, 17, 14];
  const orbitDirections = [
    "normal",
    "reverse",
    "normal",
    "reverse",
    "normal",
    "reverse",
    "normal",
  ] as const;
  const planetConfigs = [
    {
      color: "rgba(245, 158, 11, 0.95)",
      shadow: "0 0 18px rgba(245, 158, 11, 0.95)",
      show: true,
      hasSatellite: false,
    },
    {
      color: "rgba(16, 185, 129, 0.9)",
      shadow: "0 0 18px rgba(16, 185, 129, 0.9)",
      show: true,
      hasSatellite: false,
      angleDeg: 215,
    },
    {
      color: "rgba(59, 130, 246, 0.9)",
      shadow: "0 0 18px rgba(59, 130, 246, 0.9)",
      show: true,
      hasSatellite: true,
      angleDeg: 235,
    },
    {
      color: "rgba(149, 168, 194, 0.9)",
      shadow: "0 0 16px rgba(148, 163, 184, 0.9)",
      show: true,
      hasSatellite: false,
    },
    {
      color: "rgba(20, 163, 229, 0.9)",
      shadow: "0 0 16px rgba(14, 165, 233, 0.9)",
      show: true,
      hasSatellite: false,
    },
    {
      color: "rgba(201, 174, 84, 0.9)",
      shadow: "0 0 16px rgba(212, 175, 55, 0.9)",
      show: true,
      hasSatellite: false,
    },
    {
      color: "rgba(56, 189, 248, 0.9)",
      shadow: "0 0 16px rgba(56, 189, 248, 0.9)",
      show: true,
      hasSatellite: false,
    },
  ];
  const innerInset = orbitInsets[orbitInsets.length - 1] ?? 164;
  const imageMaxSize = Math.max(120, orbitSize - innerInset * 2 - 24);
  const imageSize = Math.min(coreSize * imageScale, imageMaxSize);

  return (
    <OrbitalSystem
      orbitSize={orbitSize}
      coreSize={coreSize}
      imageSize={imageSize}
      centerImage={centerImage}
      orbitInsets={orbitInsets}
      orbitLineColors={orbitLineColors}
      orbitDurations={orbitDurations}
      orbitDirections={orbitDirections}
      planetConfigs={planetConfigs}
      maxPlanetSize={20}
      minPlanetSize={8}
    />
  );
}
