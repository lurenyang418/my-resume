import { useTranslations } from "@/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAIConfigStore } from "@/store/useAIConfigStore";
import { cn } from "@/lib/utils";
import IconOpenAi from "@/components/ai/icon/IconOpenAi";

const AISettingsPage = () => {
  const {
    openaiApiKey,
    openaiModelId,
    openaiApiEndpoint,
    setOpenaiApiKey,
    setOpenaiModelId,
    setOpenaiApiEndpoint,
  } = useAIConfigStore();

  const t = useTranslations();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <IconOpenAi className="h-6 w-6 text-blue-500 shrink-0" />
            {t("dashboard.settings.ai.openai.title")}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t("dashboard.settings.ai.openai.description")}
          </p>
        </div>

        <div className="space-y-6 rounded-3xl border bg-card p-5 shadow-sm sm:p-8">
          <div className="space-y-4">
            <Label className="text-base font-medium">
              {t("dashboard.settings.ai.openai.apiKey")}
            </Label>
            <Input
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              type="password"
              placeholder={t("dashboard.settings.ai.openai.apiKey")}
              className={cn(
                "h-11",
                "bg-white dark:bg-gray-900",
                "border-gray-200 dark:border-gray-800",
                "focus:ring-2 focus:ring-primary/20"
              )}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">
              {t("dashboard.settings.ai.openai.modelId")}
            </Label>
            <Input
              value={openaiModelId}
              onChange={(e) => setOpenaiModelId(e.target.value)}
              placeholder={t("dashboard.settings.ai.openai.modelId")}
              className={cn(
                "h-11",
                "bg-white dark:bg-gray-900",
                "border-gray-200 dark:border-gray-800",
                "focus:ring-2 focus:ring-primary/20"
              )}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-medium">
              {t("dashboard.settings.ai.openai.apiEndpoint")}
            </Label>
            <Input
              value={openaiApiEndpoint}
              onChange={(e) => setOpenaiApiEndpoint(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className={cn(
                "h-11",
                "bg-white dark:bg-gray-900",
                "border-gray-200 dark:border-gray-800",
                "focus:ring-2 focus:ring-primary/20"
              )}
            />
            <p className="text-xs text-muted-foreground">
              {t("dashboard.settings.ai.openai.apiEndpointHint")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettingsPage;
