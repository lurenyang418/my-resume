import { sanitizeRichHtml } from "@/lib/sanitizeHtml";
import type { BasicInfo, ResumeData } from "@/types/resume";

type LegacyBasicInfo = BasicInfo & { githubKey?: string };

export function sanitizeResumeData(resume: ResumeData): ResumeData {
  const { githubKey: _legacyGithubKey, ...basic } = resume.basic as LegacyBasicInfo;

  return {
    ...resume,
    basic,
    skillContent: sanitizeRichHtml(resume.skillContent),
    education: resume.education.map((item) => ({
      ...item,
      description: sanitizeRichHtml(item.description),
    })),
    experience: resume.experience.map((item) => ({
      ...item,
      details: sanitizeRichHtml(item.details),
    })),
    projects: resume.projects.map((item) => ({
      ...item,
      description: sanitizeRichHtml(item.description),
    })),
    customData: Object.fromEntries(
      Object.entries(resume.customData).map(([sectionId, items]) => [
        sectionId,
        items.map((item) => ({
          ...item,
          description: sanitizeRichHtml(item.description),
        })),
      ])
    ),
  };
}

export function isResumeData(value: unknown): value is ResumeData {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  const basic = data.basic;

  const objectArray = (candidate: unknown) =>
    Array.isArray(candidate) &&
    candidate.every(
      (item) => !!item && typeof item === "object" && !Array.isArray(item)
    );
  const customDataIsValid =
    !!data.customData &&
    typeof data.customData === "object" &&
    !Array.isArray(data.customData) &&
    Object.values(data.customData).every(objectArray);

  return (
    typeof data.id === "string" &&
    typeof data.title === "string" &&
    typeof data.createdAt === "string" &&
    typeof data.updatedAt === "string" &&
    typeof data.skillContent === "string" &&
    !!basic &&
    typeof basic === "object" &&
    !Array.isArray(basic) &&
    objectArray(data.education) &&
    objectArray(data.experience) &&
    objectArray(data.projects) &&
    objectArray(data.menuSections) &&
    customDataIsValid &&
    !!data.globalSettings &&
    typeof data.globalSettings === "object" &&
    !Array.isArray(data.globalSettings)
  );
}
