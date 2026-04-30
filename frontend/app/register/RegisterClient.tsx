"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GoogleAuthButton from "../../components/GoogleAuthButton";
import { post } from "../../lib/api";
import { setToken, setUser } from "../../lib/auth";
import type { ApiResponse, User } from "../../types";

type RegisterResponse = ApiResponse<{ token: string; user: User | { id: string; name: string; email: string } }>;

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

const RegisterClient = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const normalizeUser = (raw: User | { id: string; name: string; email: string }): User => ({
    _id: "_id" in raw ? raw._id : raw.id,
    name: raw.name,
    email: raw.email,
  });

  const handleSuccess = (token: string, user: User) => {
    setToken(token);
    setUser(user);
    router.push("/dashboard");
  };

  const validate = () => {
    const nextErrors: FieldErrors = {};
    if (!name.trim()) nextErrors.name = "Name is required";
    if (!email.trim()) nextErrors.email = "Email is required";
    if (!password.trim()) nextErrors.password = "Password is required";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const response: RegisterResponse = await post("/api/auth/register", {
        name,
        email,
        password,
      });
      setLoading(false);

      if (!response.success || !response.data) {
        setError(response.message || "Registration failed");
        return;
      }

      handleSuccess(response.data.token, normalizeUser(response.data.user));
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Registration failed");
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
          <h1 className="text-3xl font-black text-white tracking-tight">Create Account</h1>
          <p className="mt-2 text-sm text-slate-400">Start your forge in seconds.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
            {fieldErrors.name && <p className="mt-1 text-[10px] text-red-400 ml-1">{fieldErrors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
            {fieldErrors.email && <p className="mt-1 text-[10px] text-red-400 ml-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
            {fieldErrors.password && <p className="mt-1 text-[10px] text-red-400 ml-1">{fieldErrors.password}</p>}
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
            {loading ? "Forging Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4 text-slate-600 text-xs font-bold uppercase tracking-widest before:h-px before:flex-1 before:bg-slate-800 after:h-px after:flex-1 after:bg-slate-800">
          Or
        </div>

        <div className="mt-8">
          <GoogleAuthButton onSuccess={handleSuccess} />
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-violet-400 hover:text-violet-300 transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterClient;
