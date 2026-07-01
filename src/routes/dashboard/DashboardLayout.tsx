import { Outlet } from "react-router-dom";
import DashboardClient from "./DashboardClient";

export default function DashboardLayout() {
  return (
    <DashboardClient>
      <Outlet />
    </DashboardClient>
  );
}
