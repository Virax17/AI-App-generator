import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Login | AppForge",
  description: "Log in to your AppForge account.",
};

export default function LoginPage() {
  return <LoginClient />;
}
