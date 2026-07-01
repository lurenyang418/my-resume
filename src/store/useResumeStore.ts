import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getFileHandle,
  verifyPermission,
  writeResumeToDirectory,
} from "@/utils/fileSystem";
import {
  BasicInfo,
  Education,
  Experience,
  GlobalSettings,
  Project,
  CustomItem,
  ResumeData,
  MenuSection,
} from "../types/resume";
import { DEFAULT_TEMPLATES } from "@/config";
import {
  initialResumeState,
  initialResumeStateEn,
} from "@/config/initialResumeData";
import { generateUUID } from "@/utils/uuid";
import { sanitizeResumeData } from "@/lib/resumeData";

function getLocale() {
  if (typeof document === "undefined") return "zh";
  const stored = localStorage.getItem("my-resume-locale");
  if (stored === "en" || stored === "zh") return stored;
  return "zh";
}
interface ResumeStore {
  resumes: Record<string, ResumeData>;
  activeResumeId: string | null;
  activeResume: ResumeData | null;

  createResume: (templateId: string | null) => string;
  deleteResume: (resume: ResumeData) => void;
  duplicateResume: (resumeId: string) => string;
  updateResume: (resumeId: string, data: Partial<ResumeData>) => void;
  setActiveResume: (resumeId: string) => void;
  updateResumeFromFile: (resume: ResumeData) => void;

  updateResumeTitle: (title: string) => void;
  updateBasicInfo: (data: Partial<BasicInfo>) => void;
  updateEducation: (data: Education) => void;
  updateEducationBatch: (educations: Education[]) => void;
  deleteEducation: (id: string) => void;
  updateExperience: (data: Experience) => void;
  updateExperienceBatch: (experiences: Experience[]) => void;
  deleteExperience: (id: string) => void;
  updateProjects: (project: Project) => void;
  updateProjectsBatch: (projects: Project[]) => void;
  deleteProject: (id: string) => void;
  setDraggingProjectId: (id: string | null) => void;
  updateSkillContent: (skillContent: string) => void;
  reorderSections: (newOrder: ResumeData["menuSections"]) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  setActiveSection: (sectionId: string) => void;
  updateMenuSections: (sections: ResumeData["menuSections"]) => void;
  addCustomData: (sectionId: string) => void;
  updateCustomData: (sectionId: string, items: CustomItem[]) => void;
  removeCustomData: (sectionId: string) => void;
  addCustomItem: (sectionId: string) => void;
  updateCustomItem: (
    sectionId: string,
    itemId: string,
    updates: Partial<CustomItem>
  ) => void;
  removeCustomItem: (sectionId: string, itemId: string) => void;
  updateGlobalSettings: (settings: Partial<GlobalSettings>) => void;
  setThemeColor: (color: string) => void;
  setTemplate: (templateId: string) => void;
  addResume: (resume: ResumeData) => string;
}

const syncTimers = new Map<string, ReturnType<typeof setTimeout>>();
const syncChains = new Map<string, Promise<void>>();

const writeResumeToFile = async (resumeData: ResumeData) => {
  try {
    const handle = await getFileHandle("syncDirectory");
    if (!handle) {
      console.warn("No directory handle found");
      return;
    }

    const hasPermission = await verifyPermission(handle);
    if (!hasPermission) {
      console.warn("No permission to write to directory");
      return;
    }

    const dirHandle = handle as FileSystemDirectoryHandle;

    await writeResumeToDirectory(dirHandle, resumeData);
  } catch (error) {
    console.error("Error syncing resume to file:", error);
  }
};

// Debounce edits and serialize writes per resume so an older write cannot win a race.
const syncResumeToFile = (resumeData: ResumeData) => {
  const existingTimer = syncTimers.get(resumeData.id);
  if (existingTimer) clearTimeout(existingTimer);

  const snapshot = structuredClone(resumeData);
  const timer = setTimeout(() => {
    syncTimers.delete(snapshot.id);
    const previous = syncChains.get(snapshot.id) ?? Promise.resolve();
    const next = previous
      .catch(() => undefined)
      .then(() => writeResumeToFile(snapshot))
      .finally(() => {
        if (syncChains.get(snapshot.id) === next) syncChains.delete(snapshot.id);
      });
    syncChains.set(snapshot.id, next);
  }, 300);

  syncTimers.set(resumeData.id, timer);
};

const deleteResumeFiles = async (resume: ResumeData) => {
  const handle = await getFileHandle("syncDirectory");
  if (!handle) return;

  const hasPermission = await verifyPermission(handle);
  if (!hasPermission) return;

  const dirHandle = handle as FileSystemDirectoryHandle;
  await Promise.allSettled([
    dirHandle.removeEntry(`${resume.id}.json`),
    dirHandle.removeEntry(`${resume.title}.json`),
  ]);
};

// Cancel debounced writes and place deletion after any write already in progress.
const queueResumeFileDeletion = (resume: ResumeData) => {
  const timer = syncTimers.get(resume.id);
  if (timer) clearTimeout(timer);
  syncTimers.delete(resume.id);

  const previous = syncChains.get(resume.id) ?? Promise.resolve();
  const deletion = previous
    .catch(() => undefined)
    .then(() => deleteResumeFiles(resume))
    .catch((error) => {
      console.error("Error deleting resume file:", error);
    })
    .finally(() => {
      if (syncChains.get(resume.id) === deletion) {
        syncChains.delete(resume.id);
      }
    });
  syncChains.set(resume.id, deletion);
};

export const useResumeStore = create(
  persist<ResumeStore>(
    (set, get) => ({
      resumes: {},
      activeResumeId: null,
      activeResume: null,

      createResume: (templateId = null) => {
        const locale = getLocale();

        const initialResumeData =
          locale === "en" ? initialResumeStateEn : initialResumeState;

        const id = generateUUID();
        const template = templateId
          ? DEFAULT_TEMPLATES.find((t) => t.id === templateId)
          : DEFAULT_TEMPLATES[0];

        const newResume: ResumeData = {
          ...initialResumeData,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          templateId: template?.id,
          title: `${locale === "en" ? "New Resume" : "新建简历"} ${id.slice(
            0,
            6
          )}`,
        };

        set((state) => ({
          resumes: {
            ...state.resumes,
            [id]: newResume,
          },
          activeResumeId: id,
          activeResume: newResume,
        }));

        syncResumeToFile(newResume);

        return id;
      },

      updateResume: (resumeId, data) => {
        const prev = get().resumes[resumeId];
        if (!prev) return;

        const updatedResume = {
          ...prev,
          ...data,
          updatedAt: new Date().toISOString(),
        };

        set({
          resumes: { ...get().resumes, [resumeId]: updatedResume },
          activeResume:
            get().activeResumeId === resumeId ? updatedResume : get().activeResume,
        });

        syncResumeToFile(updatedResume);
      },

      // 从文件更新，直接更新resumes
      updateResumeFromFile: (resume) => {
        const safeResume = sanitizeResumeData(resume);
        set((state) => ({
          resumes: {
            ...state.resumes,
            [safeResume.id]: safeResume,
          },
        }));
        syncResumeToFile(safeResume);
      },

      updateResumeTitle: (title) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          get().updateResume(activeResumeId, { title });
        }
      },

      deleteResume: (resume) => {
        const resumeId = resume.id;
        queueResumeFileDeletion(resume);

        set((state) => {
          const { [resumeId]: _unused, ...rest } = state.resumes;
          return {
            resumes: rest,
            activeResumeId: null,
            activeResume: null,
          };
        });

      },

      duplicateResume: (resumeId) => {
        const newId = generateUUID();
        const originalResume = get().resumes[resumeId];

        const locale = getLocale();

        const duplicatedResume = {
          ...originalResume,
          id: newId,
          title: `${originalResume.title} (${
            locale === "en" ? "Copy" : "复制"
          })`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          resumes: {
            ...state.resumes,
            [newId]: duplicatedResume,
          },
          activeResumeId: newId,
          activeResume: duplicatedResume,
        }));

        syncResumeToFile(duplicatedResume);

        return newId;
      },

      setActiveResume: (resumeId) => {
        const resume = get().resumes[resumeId];
        if (resume) {
          set({ activeResume: resume, activeResumeId: resumeId });
        }
      },

      updateBasicInfo: (data) => {
        const prev = get().activeResume;
        if (!prev) return;

        const updatedResume = {
          ...prev,
          basic: { ...prev.basic, ...data },
        };

        set({
          resumes: { ...get().resumes, [prev.id]: updatedResume },
          activeResume: updatedResume,
        });

        syncResumeToFile(updatedResume);
      },

      updateEducation: (education) => {
        const { activeResumeId, resumes } = get();
        if (!activeResumeId) return;

        const currentResume = resumes[activeResumeId];
        const newEducation = currentResume.education.some(
          (e) => e.id === education.id
        )
          ? currentResume.education.map((e) =>
              e.id === education.id ? education : e
            )
          : [...currentResume.education, education];

        get().updateResume(activeResumeId, { education: newEducation });
      },

      updateEducationBatch: (educations) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          get().updateResume(activeResumeId, { education: educations });
        }
      },

      deleteEducation: (id) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          const resume = get().resumes[activeResumeId];
          const updatedEducation = resume.education.filter((e) => e.id !== id);
          get().updateResume(activeResumeId, { education: updatedEducation });
        }
      },

      updateExperience: (experience) => {
        const { activeResumeId, resumes } = get();
        if (!activeResumeId) return;

        const currentResume = resumes[activeResumeId];
        const newExperience = currentResume.experience.find(
          (e) => e.id === experience.id
        )
          ? currentResume.experience.map((e) =>
              e.id === experience.id ? experience : e
            )
          : [...currentResume.experience, experience];

        get().updateResume(activeResumeId, { experience: newExperience });
      },

      updateExperienceBatch: (experiences: Experience[]) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          const updateData = { experience: experiences };
          get().updateResume(activeResumeId, updateData);
        }
      },
      deleteExperience: (id) => {
        const { activeResumeId, resumes } = get();
        if (!activeResumeId) return;

        const currentResume = resumes[activeResumeId];
        const updatedExperience = currentResume.experience.filter(
          (e) => e.id !== id
        );

        get().updateResume(activeResumeId, { experience: updatedExperience });
      },

      updateProjects: (project) => {
        const { activeResumeId, resumes } = get();
        if (!activeResumeId) return;
        const currentResume = resumes[activeResumeId];
        const newProjects = currentResume.projects.some(
          (p) => p.id === project.id
        )
          ? currentResume.projects.map((p) =>
              p.id === project.id ? project : p
            )
          : [...currentResume.projects, project];

        get().updateResume(activeResumeId, { projects: newProjects });
      },

      updateProjectsBatch: (projects: Project[]) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          const updateData = { projects };
          get().updateResume(activeResumeId, updateData);
        }
      },

      deleteProject: (id) => {
        const { activeResumeId } = get();
        if (!activeResumeId) return;
        const currentResume = get().resumes[activeResumeId];
        const updatedProjects = currentResume.projects.filter(
          (p) => p.id !== id
        );
        get().updateResume(activeResumeId, { projects: updatedProjects });
      },

      setDraggingProjectId: (id: string | null) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          get().updateResume(activeResumeId, { draggingProjectId: id });
        }
      },

      updateSkillContent: (skillContent) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          get().updateResume(activeResumeId, { skillContent });
        }
      },

      reorderSections: (newOrder) => {
        const { activeResumeId, resumes } = get();
        if (activeResumeId) {
          const currentResume = resumes[activeResumeId];
          const basicInfoSection = currentResume.menuSections.find(
            (section) => section.id === "basic"
          );
          const reorderedSections = [
            basicInfoSection,
            ...newOrder.filter((section) => section.id !== "basic"),
          ].map((section, index) => ({
            ...section,
            order: index,
          }));
          get().updateResume(activeResumeId, {
            menuSections: reorderedSections as MenuSection[],
          });
        }
      },

      toggleSectionVisibility: (sectionId) => {
        const { activeResumeId, resumes } = get();
        if (activeResumeId) {
          const currentResume = resumes[activeResumeId];
          const updatedSections = currentResume.menuSections.map((section) =>
            section.id === sectionId
              ? { ...section, enabled: !section.enabled }
              : section
          );
          get().updateResume(activeResumeId, { menuSections: updatedSections });
        }
      },

      setActiveSection: (sectionId) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          get().updateResume(activeResumeId, { activeSection: sectionId });
        }
      },

      updateMenuSections: (sections) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          get().updateResume(activeResumeId, { menuSections: sections });
        }
      },

      addCustomData: (sectionId) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          const currentResume = get().resumes[activeResumeId];
          const updatedCustomData = {
            ...currentResume.customData,
            [sectionId]: [
              {
                id: generateUUID(),
                title: "未命名模块",
                subtitle: "",
                dateRange: "",
                description: "",
                visible: true,
              },
            ],
          };
          get().updateResume(activeResumeId, { customData: updatedCustomData });
        }
      },

      updateCustomData: (sectionId, items) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          const currentResume = get().resumes[activeResumeId];
          const updatedCustomData = {
            ...currentResume.customData,
            [sectionId]: items,
          };
          get().updateResume(activeResumeId, { customData: updatedCustomData });
        }
      },

      removeCustomData: (sectionId) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          const currentResume = get().resumes[activeResumeId];
          const { [sectionId]: _, ...rest } = currentResume.customData;
          get().updateResume(activeResumeId, { customData: rest });
        }
      },

      addCustomItem: (sectionId) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          const currentResume = get().resumes[activeResumeId];
          const updatedCustomData = {
            ...currentResume.customData,
            [sectionId]: [
              ...(currentResume.customData[sectionId] || []),
              {
                id: generateUUID(),
                title: "未命名模块",
                subtitle: "",
                dateRange: "",
                description: "",
                visible: true,
              },
            ],
          };
          get().updateResume(activeResumeId, { customData: updatedCustomData });
        }
      },

      updateCustomItem: (sectionId, itemId, updates) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          const currentResume = get().resumes[activeResumeId];
          const updatedCustomData = {
            ...currentResume.customData,
            [sectionId]: currentResume.customData[sectionId].map((item) =>
              item.id === itemId ? { ...item, ...updates } : item
            ),
          };
          get().updateResume(activeResumeId, { customData: updatedCustomData });
        }
      },

      removeCustomItem: (sectionId, itemId) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          const currentResume = get().resumes[activeResumeId];
          const updatedCustomData = {
            ...currentResume.customData,
            [sectionId]: currentResume.customData[sectionId].filter(
              (item) => item.id !== itemId
            ),
          };
          get().updateResume(activeResumeId, { customData: updatedCustomData });
        }
      },

      updateGlobalSettings: (settings: Partial<GlobalSettings>) => {
        const { activeResumeId, updateResume, activeResume } = get();
        if (activeResumeId) {
          updateResume(activeResumeId, {
            globalSettings: {
              ...activeResume?.globalSettings,
              ...settings,
            },
          });
        }
      },

      setThemeColor: (color) => {
        const { activeResumeId, updateResume } = get();
        if (activeResumeId) {
          updateResume(activeResumeId, {
            globalSettings: {
              ...get().activeResume?.globalSettings,
              themeColor: color,
            },
          });
        }
      },

      setTemplate: (templateId) => {
        const { activeResumeId, resumes } = get();
        if (!activeResumeId) return;

        const template = DEFAULT_TEMPLATES.find((t) => t.id === templateId);
        if (!template) return;

        const updatedResume = {
          ...resumes[activeResumeId],
          templateId,
          globalSettings: {
            ...resumes[activeResumeId].globalSettings,
            themeColor: template.colorScheme.primary,
            sectionSpacing: template.spacing.sectionGap,
            paragraphSpacing: template.spacing.itemGap,
            pagePadding: template.spacing.contentPadding,
          },
          basic: {
            ...resumes[activeResumeId].basic,
            layout: template.basic.layout,
          },
        };

        get().updateResume(activeResumeId, updatedResume);
      },
      addResume: (resume: ResumeData) => {
        const safeResume = sanitizeResumeData(resume);
        set((state) => ({
          resumes: {
            ...state.resumes,
            [safeResume.id]: safeResume,
          },
          activeResumeId: safeResume.id,
          activeResume: safeResume,
        }));

        syncResumeToFile(safeResume);
        return safeResume.id;
      },
    }),
    {
      name: "resume-storage",
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as ResumeStore;
        return {
          ...state,
          resumes: Object.fromEntries(
            Object.entries(state.resumes ?? {}).map(([id, resume]) => [
              id,
              sanitizeResumeData(resume),
            ])
          ),
          activeResume: state.activeResume
            ? sanitizeResumeData(state.activeResume)
            : null,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.resumes = Object.fromEntries(
            Object.entries(state.resumes).map(([id, resume]) => [
              id,
              sanitizeResumeData(resume),
            ])
          );
        }
        if (state && state.activeResumeId && state.resumes[state.activeResumeId]) {
          state.activeResume = state.resumes[state.activeResumeId];
        }
      },
    }
  )
);
