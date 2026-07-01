import { useState, useEffect } from "react";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { SidePanel } from "@/components/editor/SidePanel";
import { EditPanel } from "@/components/editor/EditPanel";
import PreviewPanel from "@/components/preview";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { useResumeStore } from "@/store/useResumeStore";

const LAYOUT_CONFIG = {
  DEFAULT: [20, 32, 48],
  SIDE_COLLAPSED: [50, 50],
  EDIT_FOCUSED: [20, 80],
  PREVIEW_FOCUSED: [20, 80],
};

const DragHandle = ({ show = true }) => {
  if (!show) return null;

  return (
    <ResizableHandle className="relative w-1.5 group">
      <div
        className={cn(
          "absolute inset-y-0 left-1/2 w-1 -translate-x-1/2",
          "group-hover:bg-primary/20 group-data-[dragging=true]:bg-primary",
          "dark:bg-neutral-700/50 bg-gray-200"
        )}
      />
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-4 h-8 rounded-full opacity-0 group-hover:opacity-100",
          "flex items-center justify-center",
          "dark:bg-neutral-800 bg-gray-200"
        )}
      >
        <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
      </div>
    </ResizableHandle>
  );
};

export default function WorkbenchPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { resumes, activeResumeId, setActiveResume } = useResumeStore();
  const [sidePanelCollapsed, setSidePanelCollapsed] = useState(false);
  const [editPanelCollapsed, setEditPanelCollapsed] = useState(false);
  const [previewPanelCollapsed] = useState(false);
  const [panelSizes, setPanelSizes] = useState<number[]>(LAYOUT_CONFIG.DEFAULT);

  useEffect(() => {
    if (!id || !resumes[id]) {
      navigate("/app/dashboard/resumes", { replace: true });
      return;
    }
    if (activeResumeId !== id) setActiveResume(id);
  }, [activeResumeId, id, navigate, resumes, setActiveResume]);

  const toggleSidePanel = () => {
    setSidePanelCollapsed(!sidePanelCollapsed);
  };

  const toggleEditPanel = () => {
    setEditPanelCollapsed(!editPanelCollapsed);
  };

  const updateLayout = (sizes: number[]) => {
    setPanelSizes(sizes);
  };

  useEffect(() => {
    const newSizes: number[] = [];

    newSizes.push(sidePanelCollapsed ? 0 : 20);

    if (editPanelCollapsed) {
      newSizes.push(0);
    } else {
      if (sidePanelCollapsed) {
        newSizes.push(50);
      } else {
        if (previewPanelCollapsed) {
          newSizes.push(80);
        } else {
          newSizes.push(32);
        }
      }
    }

    if (previewPanelCollapsed) {
      newSizes.push(0);
    } else {
      if (editPanelCollapsed && sidePanelCollapsed) {
        newSizes.push(100);
      } else {
        if (editPanelCollapsed) {
          newSizes.push(80);
        } else {
          newSizes.push(48);
        }
      }
    }

    const total = newSizes.reduce((a, b) => a + b, 0);
    if (total < 100) {
      const lastNonZeroIndex = newSizes
        .map((size, index) => ({ size, index }))
        .filter(({ size }) => size > 0)
        .pop()?.index;

      if (lastNonZeroIndex !== undefined) {
        newSizes[lastNonZeroIndex] += 100 - total;
      }
    }
    updateLayout([...newSizes]);
  }, [sidePanelCollapsed, editPanelCollapsed, previewPanelCollapsed]);

  return (
    <main
      className={cn(
        "w-full h-dvh overflow-hidden",
        "bg-white text-gray-900",
        "dark:bg-neutral-900 dark:text-neutral-200"
      )}
    >
      <EditorHeader />
      <div className="hidden md:block h-[calc(100dvh-64px)]">
        <ResizablePanelGroup
          key={panelSizes?.join("-")}
          orientation="horizontal"
          className={cn(
            "h-full",
            "border border-gray-200 bg-white",
            "dark:border-neutral-800 dark:bg-neutral-900/50",
            "overflow-hidden"
          )}
        >
          {!sidePanelCollapsed && (
            <>
              <ResizablePanel
                id="side-panel"
                defaultSize={panelSizes?.[0]}
                minSize={20}
                className={cn(
                  "dark:bg-neutral-900 dark:border-r dark:border-neutral-800"
                )}
              >
                <div className="h-full overflow-y-auto min-w-0">
                  <SidePanel />
                </div>
              </ResizablePanel>
              <DragHandle />
            </>
          )}

          {!editPanelCollapsed && (
            <>
              <ResizablePanel
                id="edit-panel"
                minSize={32}
                defaultSize={panelSizes?.[1]}
                className={cn(
                  "dark:bg-neutral-900 dark:border-r dark:border-neutral-800"
                )}
              >
                <div className="h-full min-w-0">
                  <EditPanel />
                </div>
              </ResizablePanel>
              <DragHandle />
            </>
          )}

          {!previewPanelCollapsed && (
            <ResizablePanel
              id="preview-panel"
              collapsible={false}
              defaultSize={panelSizes?.[2]}
              minSize={48}
              className="bg-gray-100"
            >
              <div className="h-full overflow-y-auto min-w-0">
                <div className="min-w-0 h-full">
                  <PreviewPanel
                    sidePanelCollapsed={sidePanelCollapsed}
                    editPanelCollapsed={editPanelCollapsed}
                    previewPanelCollapsed={previewPanelCollapsed}
                    toggleSidePanel={toggleSidePanel}
                    toggleEditPanel={toggleEditPanel}
                  />
                </div>
              </div>
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>

      <div className="md:hidden h-[calc(100dvh-64px)]">
        <div className="h-full overflow-y-auto">
          <PreviewPanel
            sidePanelCollapsed={true}
            editPanelCollapsed={true}
            previewPanelCollapsed={false}
            toggleSidePanel={toggleSidePanel}
            toggleEditPanel={toggleEditPanel}
          />
        </div>
      </div>
    </main>
  );
}
