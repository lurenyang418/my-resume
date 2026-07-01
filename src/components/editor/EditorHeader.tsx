import { useTranslations } from "@/i18n";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import PdfExport from "../shared/PdfExport";
import ThemeToggle from "../shared/ThemeToggle";
import { useResumeStore } from "@/store/useResumeStore";
import { useGrammarCheck } from "@/hooks/useGrammarCheck";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";

interface EditorHeaderProps {
  isMobile?: boolean;
}

export function EditorHeader({ isMobile: _isMobile }: EditorHeaderProps) {
  const { activeResume, updateResumeTitle } =
    useResumeStore();
  const { errors, selectError } = useGrammarCheck();
  const navigate = useNavigate();
  const t = useTranslations();

  return (
    <motion.header
      className="sticky top-0 z-20 h-16 border-b bg-background/90 backdrop-blur-xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
    >
      <div className="flex h-full min-w-0 items-center justify-between gap-2 px-2 sm:px-4">
        <div className="flex min-w-0 items-center scrollbar-hide">
          <motion.div
            className="flex items-center space-x-2 shrink-0 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              navigate("/app/dashboard");
            }}
          >
            <span className="truncate text-sm font-semibold sm:text-lg">{t("common.title")}</span>
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          </motion.div>
        </div>

        <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
          {errors.length > 0 && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-center space-x-1 cursor-pointer">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="hidden text-sm text-red-500 sm:inline">
                    发现 {errors.length} 个问题
                  </span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">语法检查结果</h4>
                  <div className="space-y-1">
                    {errors.map((error, index) => (
                      <div key={index} className="text-sm space-y-1">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p>{error.message}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => selectError(index)}
                              >
                                定位
                              </Button>
                            </div>
                            {error.suggestions.length > 0 && (
                              <div className="mt-1">
                                <p className="text-xs text-muted-foreground font-medium">
                                  建议修改：
                                </p>
                                {error.suggestions.map((suggestion, i) => (
                                  <p
                                    key={i}
                                    className="text-xs mt-1 px-2 py-1 bg-muted rounded"
                                  >
                                    {suggestion}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
          <Input
            defaultValue={activeResume?.title || ""}
            onBlur={(e) => {
              updateResumeTitle(e.target.value || "未命名简历");
            }}
            className="hidden w-40 text-sm lg:block xl:w-60"
            placeholder="简历名称"
          />

          <ThemeToggle></ThemeToggle>
          <div className="flex items-center">
            <PdfExport />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
