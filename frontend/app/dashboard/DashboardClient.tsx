"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CreateAppModal from "../../components/CreateAppModal";
import { del, get } from "../../lib/api";
import { isLoggedIn } from "../../lib/auth";
import type { ApiResponse, App } from "../../types";

const DashboardClient = () => {
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    let active = true;

    const run = async () => {
      setError(null);
      try {
        const response: ApiResponse<{ apps: App[] }> = await get("/api/apps");
        if (!active) return;
        if (!response.success || !response.data) {
          setError(response.message || "Failed to load apps.");
          return;
        }
        setApps(response.data.apps);
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : "Failed to load apps.";
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();
    return () => { active = false; };
  }, [router]);

  const handleDelete = async (appId: string) => {
    setDeletingId(appId);
    try {
      const response: ApiResponse<{ message: string }> = await del(`/api/apps/${appId}`);
      if (!response.success) {
        setError(response.message || "Failed to delete app.");
        return;
      }
      setApps((prev) => prev.filter((app) => app._id !== appId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete app.";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreated = (app: App) => {
    setApps((prev) => [app, ...prev]);
  };

  return (
    <div className="min-h-screen mesh-bg bg-[#0d1117] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-1">App Generator</p>
            <h1 className="text-3xl font-bold text-white">Your Apps</h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Build and manage apps generated from JSON config.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn-glow rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> New App
          </button>
        </motion.div>

        {/* Stats bar */}
        {!loading && !error && apps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3"
          >
            {[
              { label: "Total Apps", value: apps.length },
              { label: "Fields Configured", value: apps.reduce((acc, a) => acc + (a.config?.fields?.length ?? 0), 0) },
              { label: "Latest", value: apps[0] ? new Date(apps[0].createdAt).toLocaleDateString() : "—" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl px-5 py-4">
                <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-10 flex justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !error && apps.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-16 text-center"
          >
            <p className="text-5xl mb-4">🚀</p>
            <h2 className="text-xl font-semibold text-white">No apps yet</h2>
            <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
              Create your first app by pasting a JSON config. It'll generate a fully working UI instantly.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 btn-glow rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
            >
              Create First App
            </button>
          </motion.div>
        )}

        {/* App grid */}
        {!loading && !error && apps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {apps.map((app, idx) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  className="glass rounded-2xl p-5 flex flex-col gap-4 hover:border-violet-500/40 transition-colors group"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-base font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                        {app.appName}
                      </h2>
                      <span className="shrink-0 rounded-full bg-violet-500/15 px-2 py-0.5 text-xs font-medium text-violet-400">
                        {app.config?.fields?.length ?? 0} fields
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-slate-400 line-clamp-2">
                      {app.description || "No description provided."}
                    </p>
                    <p className="mt-2 text-xs text-slate-600">
                      Created {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/app/${app._id}`)}
                      className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-violet-500 hover:text-violet-300 transition-colors"
                    >
                      Open App →
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(app._id)}
                      disabled={deletingId === app._id}
                      className="rounded-lg border border-red-900/50 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {deletingId === app._id ? "…" : "Delete"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <CreateAppModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleCreated}
      />
    </div>
  );
};

export default DashboardClient;
