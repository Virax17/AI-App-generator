import type { Metadata } from "next";
import AppDetailClient from "./AppDetailClient";

export const metadata: Metadata = {
  title: "App | AppForge",
  description: "View and manage your app data.",
};

export default function AppDetailPage() {
  return <AppDetailClient />;
}
