import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | AppForge",
  description: "Manage your generated apps and data.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}

