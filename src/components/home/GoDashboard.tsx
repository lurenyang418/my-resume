
import { useNavigate } from "react-router-dom";

export default function GoDashboard({
  children,
  type = "dashboard",
}: {
  children: React.ReactNode;
  type?: "dashboard" | "templates" | "resumes";
}) {
  const navigate = useNavigate();
  const pathMap: Record<string, string> = {
    dashboard: "/app/dashboard/resumes",
    resumes: "/app/dashboard/resumes",
    templates: "/app/dashboard/templates",
  };

  return (
    <div
      className="cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        navigate(pathMap[type]);
      }}
    >
      {children}
    </div>
  );
}
