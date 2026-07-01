
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TimelineEntry } from "@/lib/getChangelog";

interface ChangelogTimelineProps {
  entries?: TimelineEntry[];
}

const ChangelogTimeline = ({ entries = [] }: ChangelogTimelineProps) => {
  const getSectionTypeInfo = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("新增")) {
      return {
        type: "added",
        label: "新增",
        className:
          "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        icon: "✨",
      };
    } else if (lowerTitle.includes("变更")) {
      return {
        type: "changed",
        label: "变更",
        className:
          "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        icon: "🔄",
      };
    } else if (lowerTitle.includes("修复")) {
      return {
        type: "fixed",
        label: "修复",
        className:
          "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
        icon: "🛠️",
      };
    } else if (lowerTitle.includes("移除")) {
      return {
        type: "removed",
        label: "移除",
        className:
          "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
        icon: "🗑️",
      };
    } else if (lowerTitle.includes("优化")) {
      return {
        type: "optimized",
        label: "优化",
        className:
          "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
        icon: "⚡",
      };
    }
    return {
      type: "other",
      label: title,
      className: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
      icon: "📝",
    };
  };

  if (entries.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12 text-lg">
        暂无更新记录
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-14">
        {entries.map((entry, entryIndex) => (
          <div key={entryIndex} className="group relative">
            <div className="mb-4 flex items-center">
              <div className="h-3 w-3 rounded-full bg-gradient-to-br from-primary to-primary/70 mr-2.5 shadow-sm relative z-10"></div>
              <span className="text-sm font-medium text-primary/80 dark:text-primary/70">
                {entry.date}
              </span>
            </div>

            <div className="pl-5 border-l border-primary/20 dark:border-primary/10 space-y-10 relative -mt-5 pt-5 ml-[6px]">
              {entry.sections.map((section, sIndex) => {
                const { label, className, icon } = getSectionTypeInfo(
                  section.title
                );
                return (
                  <div key={sIndex} className="space-y-4">
                    <Badge
                      className={cn(
                        "capitalize text-xs font-medium px-2.5 py-1 rounded-md",
                        className
                      )}
                    >
                      {icon} {label}
                    </Badge>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                      {section.items.map((item, iIndex) => (
                        <li
                          key={iIndex}
                          className="flex items-baseline gap-2.5 group/item hover:text-primary/90 transition-colors duration-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/30 dark:bg-primary/20 mt-1.5 flex-shrink-0 group-hover/item:bg-primary/60 transition-colors duration-200"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChangelogTimeline;
