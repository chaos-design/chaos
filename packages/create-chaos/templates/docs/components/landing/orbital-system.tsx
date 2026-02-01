"use client";

import Image from "next/image";
import { motion } from "motion/react";

type PlanetConfig = {
  color: string;
  shadow: string;
  show: boolean;
  hasSatellite: boolean;
  angleDeg?: number;
};

type OrbitalSystemProps = {
  orbitSize: number;
  coreSize: number;
  imageSize: number;
  centerImage?: string;
  orbitInsets: number[];
  orbitLineColors: string[];
  orbitDurations: number[];
  orbitDirections: ReadonlyArray<"normal" | "reverse">;
  planetConfigs: PlanetConfig[];
  maxPlanetSize: number;
  minPlanetSize: number;
};

type SatelliteProps = {
  ringColor: string;
  satelliteColor: string;
  satelliteShadow: string;
};

function Satellite({ ringColor, satelliteColor, satelliteShadow }: SatelliteProps) {
  return (
    <span
      className="absolute -inset-2 rounded-full"
      style={{
        animation: "spin 6s linear infinite",
        border: `1px solid ${ringColor}`,
      }}
    >
      <span
        className="absolute -right-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
        style={{ backgroundColor: satelliteColor, boxShadow: satelliteShadow }}
      />
    </span>
  );
}

export function OrbitalSystem({
  orbitSize,
  coreSize,
  imageSize,
  centerImage,
  orbitInsets,
  orbitLineColors,
  orbitDurations,
  orbitDirections,
  planetConfigs,
  maxPlanetSize,
  minPlanetSize,
}: OrbitalSystemProps) {
  const planetSizeStep =
    (maxPlanetSize - minPlanetSize) / Math.max(orbitInsets.length - 1, 1);

  return (
    <div className="relative mx-auto" style={{ width: orbitSize, height: orbitSize }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="rounded-full bg-[#facc15] shadow-[0_0_50px_rgba(250,204,21,1)]"
          style={{ width: coreSize * 1.2, height: coreSize * 1.2 }}
        />
        <span
          className="absolute rounded-full bg-[#facc15]/50 blur-2xl"
          style={{ width: coreSize * 4.5, height: coreSize * 4.5 }}
        />
      </div>
      {orbitInsets.map((inset, index) => (
        <div
          key={`orbit-${inset}`}
          className="absolute rounded-full border"
          style={{
            inset,
            borderColor: orbitLineColors[index],
            animation: `spin ${orbitDurations[index]}s linear infinite`,
            animationDirection: orbitDirections[index],
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-tr from-fd-primary/30 to-purple-500/30 rounded-full blur-3xl animate-pulse" />
      {orbitInsets.map((inset, index) => {
        const config = planetConfigs[index];
        const size = Math.max(
          minPlanetSize,
          Math.round(maxPlanetSize - index * planetSizeStep)
        );
        if (!config?.show) {
          return null;
        }
        return (
          <div
            key={`planet-${inset}`}
            className="absolute"
            style={{
              inset,
              animation: `spin ${orbitDurations[index]}s linear infinite`,
              animationDirection: orbitDirections[index],
            }}
          >
            <div
              className="absolute inset-0"
              style={{ transform: `rotate(${config.angleDeg ?? 0}deg)` }}
            >
              <span
                className="absolute top-1/2 -translate-y-1/2 rounded-full"
                style={{
                  right: -size / 2,
                  width: size,
                  height: size,
                  backgroundColor: config.color,
                  boxShadow: config.shadow,
                }}
              >
                {config.hasSatellite && (
                  <Satellite
                    ringColor="rgba(59, 130, 246, 0.4)"
                    satelliteColor="rgba(186, 230, 253, 0.85)"
                    satelliteShadow="0 0 8px rgba(186,230,253,0.9)"
                  />
                )}
              </span>
            </div>
          </div>
        );
      })}
      <motion.div
        className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100/80 shadow-[0_0_8px_rgba(252,211,77,0.6)]"
        animate={{
          x: [-190, -40, 90],
          y: [-210, -30, 110],
          opacity: [0, 1, 1, 0],
          scale: [1, 1.05, 1.6, 0.2],
        }}
        transition={{ duration: 2.9, repeat: Infinity, ease: "linear" }}
      >
        <span
          className="absolute left-1/2 top-1/2 h-0.5 w-10 -translate-y-1/2 bg-gradient-to-r from-transparent via-amber-200/60 to-amber-100/10 blur-[1px]"
          style={{
            transform: "translate(-100%, -50%) rotate(49deg)",
            transformOrigin: "100% 50%",
          }}
        />
      </motion.div>
      <motion.div
        className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-100/80 shadow-[0_0_8px_rgba(186,230,253,0.6)]"
        animate={{
          x: [200, -170],
          y: [-130, 200],
          opacity: [0, 1, 0],
          scale: [1, 1.05, 0.2],
        }}
        transition={{ duration: 3.3, repeat: Infinity, ease: "linear", delay: 0.6 }}
      >
        <span
          className="absolute left-1/2 top-1/2 h-0.5 w-12 -translate-y-1/2 bg-gradient-to-r from-transparent via-sky-200/60 to-sky-100/10 blur-[1px]"
          style={{
            transform: "translate(-100%, -50%) rotate(147deg)",
            transformOrigin: "100% 50%",
          }}
        />
      </motion.div>
      <motion.div
        className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-100/80 shadow-[0_0_8px_rgba(221,214,254,0.6)]"
        animate={{
          x: [-150, 180],
          y: [160, -140],
          opacity: [0, 1, 0],
          scale: [1, 1.05, 0.2],
        }}
        transition={{ duration: 3.1, repeat: Infinity, ease: "linear", delay: 1.2 }}
      >
        <span
          className="absolute left-1/2 top-1/2 h-0.5 w-9 -translate-y-1/2 bg-gradient-to-r from-transparent via-purple-200/60 to-purple-100/10 blur-[1px]"
          style={{
            transform: "translate(-100%, -50%) rotate(-48deg)",
            transformOrigin: "100% 50%",
          }}
        />
      </motion.div>
      {centerImage && (
        <Image
          src={centerImage}
          alt="Slogan Image"
          width={imageSize}
          height={imageSize}
          className="object-contain absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_50px_rgba(var(--primary),0.5)] hover:drop-shadow-[0_0_80px_rgba(var(--primary),0.8)] transition-all duration-500"
          priority
        />
      )}
    </div>
  );
}
