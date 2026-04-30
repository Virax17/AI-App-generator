import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "App Details | AppForge",
};

const AppLayout = ({ children }: { children: React.ReactNode }) => children;

export default AppLayout;
