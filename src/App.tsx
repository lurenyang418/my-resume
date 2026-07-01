import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./routes/LandingPage";
import DashboardLayout from "./routes/dashboard/DashboardLayout";

const ChangelogPage = lazy(() => import("./routes/ChangelogPage"));
const ResumesPage = lazy(() => import("./routes/dashboard/ResumesPage"));
const TemplatesPage = lazy(() => import("./routes/dashboard/TemplatesPage"));
const AISettingsPage = lazy(() => import("./routes/dashboard/AISettingsPage"));
const SettingsPage = lazy(() => import("./routes/dashboard/SettingsPage"));
const WorkbenchPage = lazy(() => import("./routes/workbench/WorkbenchPage"));

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/changelog" element={<Lazy><ChangelogPage /></Lazy>} />
      <Route path="/app" element={<Navigate to="/app/dashboard/resumes" replace />} />
      <Route path="/app/dashboard" element={<Navigate to="/app/dashboard/resumes" replace />} />
      <Route element={<DashboardLayout />}>
        <Route path="/app/dashboard/resumes" element={<Lazy><ResumesPage /></Lazy>} />
        <Route path="/app/dashboard/templates" element={<Lazy><TemplatesPage /></Lazy>} />
        <Route path="/app/dashboard/ai" element={<Lazy><AISettingsPage /></Lazy>} />
        <Route path="/app/dashboard/settings" element={<Lazy><SettingsPage /></Lazy>} />
      </Route>
      <Route path="/app/workbench/:id" element={<Lazy><WorkbenchPage /></Lazy>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
