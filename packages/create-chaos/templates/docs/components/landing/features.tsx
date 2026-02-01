import { cn } from "@docs/utils/utils";
import Divider from "@docs/components/landing/divider";
import { ReactLogo } from "@docs/components/landing/logos/react-logo";
import { ShadcnLogo } from "@docs/components/landing/logos/shadcn-logo";
import { TailwindLogo } from "@docs/components/landing/logos/tailwind-logo";
import { siteConfig } from "@/fumadocs.config";

const FEATURE_ICON_MAP = {
  react: ReactLogo,
  tailwind: TailwindLogo,
  shadcn: ShadcnLogo,
} as const;

type FeatureIconName = keyof typeof FEATURE_ICON_MAP;
type FeatureItem = {
  title: string;
  description: string;
  icon: FeatureIconName;
};

export function Features() {
  const features = (siteConfig?.features?.items ?? []) as FeatureItem[];

  return (
    <section className="relative bg-background px-8 py-8 transition">
      <Divider />
      {siteConfig?.features?.name && (
        <h2 className="text-balance text-center font-semibold font-title text-3xl text-foreground transition">
          {siteConfig?.features?.title}
          <span className="text-brand">{siteConfig?.features?.name}</span>
        </h2>
      )}
      <div className="mt-16 grid w-full grid-cols-1 gap-8 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
        {features.map((feature) => {
          const Icon = FEATURE_ICON_MAP[feature.icon];
          return (
            <div
              className={cn(
                "group relative inset-ring-2 inset-ring-background flex h-full flex-col rounded-2xl bg-linear-to-b bg-transparent from-65% from-primary/30 to-transparent p-6 backdrop-blur-lg transition-all hover:from-primary",
                "border shadow-blue-800/10 shadow-sm hover:shadow-none"
              )}
              key={feature.title}
            >
              <div className="inset-ring inset-ring-background mb-4 flex h-8 w-8 items-center justify-center rounded-full border-[0.5px] border-brand bg-primary p-2">
                {Icon ? <Icon className="text-brand transition" /> : null}
              </div>
              <h3 className="mb-2 font-semibold text-foreground text-xl transition">
                {feature.title}
              </h3>
              <p className="text-primary-foreground transition">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
