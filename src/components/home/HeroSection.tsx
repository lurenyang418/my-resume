import { useTranslations } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Check, ShieldCheck } from "lucide-react";
import ScrollBackground from "./client/ScrollBackground";
import AnimatedFeature from "./client/AnimatedFeature";
import GoDashboard from "./GoDashboard";

export default function HeroSection() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-clip pb-20 pt-28 sm:pb-24 sm:pt-32 lg:pb-28 lg:pt-36">
      <ScrollBackground />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-w-0 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <AnimatedFeature>
            <div className="relative mx-auto min-w-0 max-w-2xl text-center lg:mx-0 lg:text-left">
              <div className="relative">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3.5 py-1.5 text-primary shadow-sm backdrop-blur-sm">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">{t("hero.badge")}</span>
                </div>
                <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                  {t("hero.title")}
                </h1>
                <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg lg:mx-0">
                  {t("hero.subtitle")}
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                  <GoDashboard>
                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 gap-2 rounded-xl px-7 text-base shadow-lg shadow-primary/15"
                    >
                      {t("hero.cta")}
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </GoDashboard>

                  <GoDashboard type="templates">
                    <Button
                      type="submit"
                      size="lg"
                      variant="outline"
                      className="h-12 gap-2 rounded-xl bg-background/70 px-7 text-base backdrop-blur"
                    >
                      {t("hero.secondary")}
                    </Button>
                  </GoDashboard>
                </div>
                <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground lg:justify-start">
                  <span className="inline-flex items-center gap-1.5"><Check className="size-4 text-emerald-500" />{t("hero.benefit1")}</span>
                  <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-emerald-500" />{t("hero.benefit2")}</span>
                  <span className="inline-flex items-center gap-1.5"><Check className="size-4 text-emerald-500" />{t("hero.benefit3")}</span>
                </div>
              </div>
            </div>
          </AnimatedFeature>

          <AnimatedFeature delay={0.2}>
            <div className="relative mx-auto min-w-0 max-w-3xl">
              <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-tr from-violet-500/20 via-blue-500/10 to-transparent blur-3xl" />
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-background/80 p-2 shadow-2xl shadow-black/20 ring-1 ring-black/5 backdrop-blur sm:rounded-3xl sm:p-3">
                <img
                  src="/web-shot.png"
                  alt="Resume Editor"
                  className="aspect-[16/10] w-full rounded-xl object-cover object-top sm:rounded-2xl"
                />
              </div>
              <div className="absolute -bottom-5 left-5 hidden items-center gap-3 rounded-2xl border bg-background/95 px-4 py-3 shadow-xl backdrop-blur sm:flex">
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500"><Check className="size-5" /></div>
                <div><div className="text-sm font-semibold">{t("hero.saveTitle")}</div><div className="text-xs text-muted-foreground">{t("hero.saveDescription")}</div></div>
              </div>
            </div>
          </AnimatedFeature>
        </div>
      </div>
    </section>
  );
}
