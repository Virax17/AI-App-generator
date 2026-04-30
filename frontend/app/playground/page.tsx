import type { Metadata } from "next";
import PlaygroundClient from "./PlaygroundClient";

export const metadata: Metadata = {
  title: "Live Playground – AppForge",
  description: "Edit JSON config in real-time and watch your app generate instantly.",
};

export default function PlaygroundPage() {
  return <PlaygroundClient />;
}
