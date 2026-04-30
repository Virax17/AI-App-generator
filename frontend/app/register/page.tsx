import type { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Register | AppForge",
  description: "Create your AppForge account and start building apps.",
};

export default function RegisterPage() {
  return <RegisterClient />;
}
