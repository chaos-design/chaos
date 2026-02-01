import type { Metadata } from "next/types";

export function createMetadata(override: Metadata): Metadata {
  const defaultOgImage = {
    width: 1200,
    height: 630,
    url: "",
    alt: "Cover",
  };

  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: "",
      images: [defaultOgImage],
      siteName: "ChaosDesign",
      locale: "en_US",
      type: "website",
      ...override.openGraph,
    },
    alternates: {
      ...override.alternates,
    },
  };
}

export const baseUrl =
  process.env.NODE_ENV === "development" ||
  !process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? new URL("http://localhost:3000")
    : new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
