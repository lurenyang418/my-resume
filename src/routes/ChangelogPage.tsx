import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslations } from "@/i18n";
import ChangelogTimeline from "@/components/shared/ChangelogTimeline";
import { getChangelog } from "@/lib/getChangelog";
import { cn } from "@/lib/utils";
import LandingHeader from "@/components/home/LandingHeader";
import Footer from "@/components/home/Footer";

export default function ChangelogPage() {
  const t = useTranslations("home");
  const changelogEntries = getChangelog();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f8f9fb] to-white dark:from-gray-900 dark:to-gray-800">
      <LandingHeader />
      <main className="flex-grow py-16">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-center relative">
            <button
              onClick={() => navigate("/")}
              className="mb-5 flex items-center gap-2 self-start rounded-md bg-primary/10 p-2.5 transition-colors hover:bg-primary/15 sm:absolute sm:left-0 sm:top-1/2 sm:mb-0 sm:-translate-y-1/2"
              aria-label="返回"
            >
              <ArrowLeft className="h-5 w-5 text-primary" />
            </button>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 inline-block mb-4">
              {t("changelog")}
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-primary/80 to-primary/20 mx-auto rounded-full"></div>
          </div>
          <div
            className={cn(
              "relative mb-12 overflow-hidden rounded-xl p-4 sm:p-8",
              "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:via-primary/3 before:to-transparent before:rounded-xl",
              "after:absolute after:inset-0 after:bg-white/40 dark:after:bg-gray-900/40 after:backdrop-blur-sm after:rounded-xl after:-z-10",
              "border border-white/20 dark:border-gray-700/30 shadow-sm"
            )}
          >
            <div className="relative z-10 mx-auto">
              <ChangelogTimeline entries={changelogEntries} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
