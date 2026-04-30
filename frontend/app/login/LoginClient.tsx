"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GoogleAuthButton from "../../components/GoogleAuthButton";
import { post } from "../../lib/api";
import { setToken, setUser } from "../../lib/auth";
import type { ApiResponse, User } from "../../types";

type LoginResponse = ApiResponse<{ token: string; user: User | { id: string; name: string; email: string } }>;

const LoginClient = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = (token: string, user: User) => {
    setToken(token);
    setUser(user);
    router.push("/dashboard");
  };

  const normalizeUser = (raw: User | { id: string; name: string; email: string }): User => ({
    _id: "_id" in raw ? raw._id : raw.id,
    name: raw.name,
    email: raw.email,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response: LoginResponse = await post("/api/auth/login", { email, password });
      setLoading(false);

      if (!response.success || !response.data) {
        setError(response.message || "Login failed");
        return;
      }

      handleSuccess(response.data.token, normalizeUser(response.data.user));
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1117] mesh-bg px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-[#30363d] bg-[#161b22] p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-sm text-slate-400">Continue your journey with AppForge.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 font-medium text-center">
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-glow w-full rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-black text-white hover:bg-violet-700 disabled:opacity-50 transition-all"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4 text-slate-600 text-xs font-bold uppercase tracking-widest before:h-px before:flex-1 before:bg-slate-800 after:h-px after:flex-1 after:bg-slate-800">
          Or
        </div>

        <div className="mt-8">
          <GoogleAuthButton onSuccess={handleSuccess} />
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-violet-400 hover:text-violet-300 transition-colors">
            Forge One Now
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginClient;
