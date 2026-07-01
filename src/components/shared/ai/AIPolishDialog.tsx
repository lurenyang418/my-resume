import { useEffect, useState, useRef } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "@/i18n";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAIConfigStore } from "@/store/useAIConfigStore";
import { cn } from "@/lib/utils";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";

interface AIPolishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  onApply: (content: string) => void;
}

export default function AIPolishDialog({
  open,
  onOpenChange,
  content,
  onApply
}: AIPolishDialogProps) {
  const t = useTranslations("aiPolishDialog");
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishedContent, setPolishedContent] = useState("");
  const {
    openaiApiKey,
    openaiModelId,
    openaiApiEndpoint,
  } = useAIConfigStore();
  const abortControllerRef = useRef<AbortController | null>(null);
  const polishedContentRef = useRef<HTMLDivElement>(null);

  const handlePolish = async () => {
    try {
      const isConfigured = openaiApiKey && openaiModelId && openaiApiEndpoint;

      if (!isConfigured) {
        toast.error(t("error.configRequired"));
        onOpenChange(false);
        return;
      }

      setIsPolishing(true);
      setPolishedContent("");

      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/polish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content,
          apiKey: openaiApiKey,
          apiEndpoint: openaiApiEndpoint,
          model: openaiModelId,
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error("Failed to polish content");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setPolishedContent((prev) => {
          const newContent = prev + chunk;
          requestAnimationFrame(() => {
            if (polishedContentRef.current) {
              polishedContentRef.current.scrollTop = polishedContentRef.current.scrollHeight;
            }
          });
          return newContent;
        });
      }

      const trailingContent = decoder.decode();
      if (trailingContent) {
        setPolishedContent((prev) => prev + trailingContent);
      }
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(t("error.polishFailed"));
    } finally {
      setIsPolishing(false);
    }
  };

  const handleRegenerate = () => {
    handlePolish();
  };

  const handleApply = () => {
    onApply(sanitizeRichHtml(polishedContent));
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      setPolishedContent("");
      handlePolish();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(720px,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>
            {t(
              isPolishing
                ? "description.polishing"
                : "description.finished"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 md:overflow-hidden">
          <div className="flex min-h-56 flex-col md:min-h-0">
            <label className="text-sm font-medium mb-2 text-muted-foreground">
              {t("content.original")}
            </label>
            <div
              className="flex-1 p-4 rounded-lg bg-muted/30 border overflow-y-auto text-sm"
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(content) }}
            />
          </div>

          <div className="flex min-h-56 flex-col md:min-h-0">
            <label className="text-sm font-medium mb-2 text-muted-foreground">
              {t("content.polished")}
            </label>
            <div
              ref={polishedContentRef}
              className={cn(
                "flex-1 p-4 rounded-lg border overflow-y-auto whitespace-pre-wrap text-sm",
                isPolishing && polishedContent === ""
                  ? "flex items-center justify-center"
                  : ""
              )}
            >
              {isPolishing && polishedContent === "" ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>{t("description.polishing")}</span>
                </div>
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizeRichHtml(polishedContent),
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="outline"
            onClick={handleRegenerate}
            disabled={isPolishing}
          >
            {t("button.regenerate")}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("button.cancel")}
            </Button>
            <Button
              onClick={handleApply}
              disabled={!polishedContent || isPolishing}
            >
              {t("button.apply")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
