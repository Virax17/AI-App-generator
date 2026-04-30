"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { getToken, getUserRaw, removeToken, subscribeAuth } from "../lib/auth";
import type { User } from "../types";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const token = useSyncExternalStore(subscribeAuth, getToken, () => null);
  const userRaw = useSyncExternalStore(subscribeAuth, getUserRaw, () => null);

  const user = userRaw ? (JSON.parse(userRaw) as User) : null;
  const loggedIn = Boolean(token);

  const handleLogout = () => {
    removeToken();
    setMenuOpen(false);
    router.push("/login");
  };

  const isPlayground = pathname === "/playground";

  return (
    <nav className="border-b border-slate-800 bg-[#0d1117] sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black tracking-tight">
            <span className="text-violet-400">App</span>
            <span className="text-white">Forge</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/playground"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isPlayground
                ? "bg-violet-500/20 text-violet-300"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            }`}
          >
            ⚡ Playground
          </Link>

          {loggedIn && user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                Dashboard
              </Link>
              <div className="ml-2 h-5 w-px bg-slate-700" />
              <span className="text-sm text-slate-400 ml-2">{user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button
          type="button"
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-slate-800 px-5 py-4 md:hidden bg-[#0d1117]">
          <div className="flex flex-col gap-3">
            <Link
              href="/playground"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-violet-300 hover:bg-slate-800 transition-colors"
            >
              ⚡ Playground
            </Link>
            {loggedIn && user ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm text-slate-300 hover:text-white px-3 py-2">
                  Dashboard
                </Link>
                <span className="text-sm text-slate-500 px-3">{user.name}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm text-slate-300">
                  Login
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white text-center">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
