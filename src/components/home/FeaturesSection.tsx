import { useTranslations } from "@/i18n";
import {
  Check,
  Eye,
  FileJson,
  HardDrive,
  Palette,
  Sparkles,
} from "lucide-react";
import AnimatedFeature from "./client/AnimatedFeature";

const featureCards = [
  {
    key: "ai",
    icon: Sparkles,
    iconClass: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
    borderClass: "hover:border-violet-500/30",
    items: ["features.ai.item1", "features.ai.item2"],
  },
  {
    key: "storage",
    icon: HardDrive,
    iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    borderClass: "hover:border-emerald-500/30",
    items: ["features.storage.item1", "features.storage.item2"],
  },
  {
    key: "preview",
    icon: Eye,
    iconClass: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
    borderClass: "hover:border-blue-500/30",
    items: ["features.preview.item1", "features.preview.item2"],
  },
] as const;

const smallFeatures = [
  { icon: Palette, key: "template" },
  { icon: FileJson, key: "backup" },
  { icon: HardDrive, key: "local" },
] as const;

export default function FeaturesSection() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-clip border-y border-border/60 bg-muted/25 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedFeature>
          <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            <div className="mb-4 inline-flex rounded-full border bg-background px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm">
              {t("features.eyebrow")}
            </div>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {t("features.title")}
            </h2>
            <p className="mt-5 text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              {t("features.subtitle")}
            </p>
          </div>
        </AnimatedFeature>

        <div className="grid min-w-0 gap-5 lg:grid-cols-3">
          {featureCards.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <AnimatedFeature key={feature.key} delay={index * 0.08}>
                <article
                  className={`group h-full min-w-0 rounded-3xl border bg-background/90 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${feature.borderClass}`}
                >
                  <div className={`mb-6 flex size-12 items-center justify-center rounded-2xl ${feature.iconClass}`}>
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t(`features.${feature.key}.title`)}
                  </h3>
                  <p className="mt-3 min-h-20 text-sm leading-6 text-muted-foreground sm:text-base">
                    {t(`features.${feature.key}.description`)}
                  </p>
                  <ul className="mt-6 space-y-3 border-t pt-5">
                    {feature.items.map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm font-medium">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check className="size-3.5" />
                        </span>
                        {t(item)}
                      </li>
                    ))}
                  </ul>
                </article>
              </AnimatedFeature>
            );
          })}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {smallFeatures.map(({ icon: Icon, key }) => (
            <div key={key} className="flex min-w-0 gap-4 rounded-2xl border bg-background/60 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold">{t(`features.extras.${key}.title`)}</h3>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">{t(`features.extras.${key}.description`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
