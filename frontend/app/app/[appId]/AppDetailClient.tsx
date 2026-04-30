"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CsvImportModal from "../../../components/CsvImportModal";
import ExportModal from "../../../components/ExportModal";
import ErrorBoundary from "../../../components/ErrorBoundary";
import FormRenderer from "../../../components/FormRenderer";
import TableRenderer from "../../../components/TableRenderer";
import { del, get, post } from "../../../lib/api";
import { isLoggedIn } from "../../../lib/auth";
import { healConfig } from "../../../lib/configHealer";
import type { ApiResponse, App, AppConfig, AppData } from "../../../types";

const AppDetailClient = () => {
  const params = useParams<{ appId: string }>();
  const router = useRouter();
  const appId = params?.appId ?? "";

  const [app, setApp] = useState<App | null>(null);
  const [healedConfig, setHealedConfig] = useState<AppConfig | null>(null);
  const [configWarnings, setConfigWarnings] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCsv, setShowCsv] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showWarnings, setShowWarnings] = useState(true);

  useEffect(() => {
    if (!appId) { setError("Missing app id"); setLoading(false); return; }
    if (!isLoggedIn()) { router.replace("/login"); return; }
    let active = true;

    const run = async () => {
      setError(null);
      try {
        const appResponse: ApiResponse<{ app: App }> = await get(`/api/apps/${appId}`);
        if (!active) return;
        if (!appResponse.success || !appResponse.data) {
          setError(appResponse.message || "Failed to load app");
          return;
        }

        const dataResponse: ApiResponse<{ submissions: AppData[] }> = await get(`/api/data/${appId}`);
        if (!active) return;
        if (!dataResponse.success || !dataResponse.data) {
          setError(dataResponse.message || "Failed to load submissions");
          return;
        }

        const loadedApp = appResponse.data.app;
        setApp(loadedApp);

        // Apply self-healing on load
        const { config, warnings } = healConfig(loadedApp.config);
        setHealedConfig(config);
        setConfigWarnings(warnings);
        setSubmissions(dataResponse.data.submissions ?? []);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load app");
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();
    return () => { active = false; };
  }, [appId, router]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSuccessMessage(null);
    const response: ApiResponse<{ submission: AppData }> = await post(`/api/data/${appId}`, values);
    if (!response.success || !response.data) throw new Error(response.message || "Failed to submit");
    setSuccessMessage("Submission saved successfully ✓");
    void refreshSubmissions();
  };

  const refreshSubmissions = async () => {
    try {
      const response: ApiResponse<{ submissions: AppData[] }> = await get(`/api/data/${appId}`);
      if (response.success && response.data) setSubmissions(response.data.submissions ?? []);
    } catch { return; }
  };

  const handleDelete = async (dataId: string) => {
    try {
      const response: ApiResponse<{ message: string }> = await del(`/api/data/${appId}/${dataId}`);
      if (!response.success) { setError(response.message || "Failed to delete submission"); return; }
      void refreshSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete submission");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-400">
          {error.toLowerCase().includes("not found") ? "App not found." : error}
        </div>
      </div>
    );
  }

  if (!app || !healedConfig) return null;

  return (
    <ErrorBoundary>
      <div className="min-h-screen mesh-bg bg-[#0d1117] px-4 py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <button
                onClick={() => router.push("/dashboard")}
                className="mb-3 text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-white">{healedConfig.appName}</h1>
              <p className="mt-1 text-sm text-slate-400">{healedConfig.description || "No description"}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowExport(true)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:border-violet-500/50 hover:text-violet-300 transition-colors"
              >
                📥 Export App
              </button>
              <button
                type="button"
                onClick={() => setShowCsv(true)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:border-violet-500/50 hover:text-violet-300 transition-colors"
              >
                ↑ Import CSV
              </button>
            </div>
          </motion.div>

          {/* Self-healing warnings */}
          <AnimatePresence>
            {configWarnings.length > 0 && showWarnings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-amber-400">
                      ⚡ Self-Healing Applied — {configWarnings.length} issue(s) auto-fixed
                    </p>
                    <ul className="mt-1.5 space-y-0.5">
                      {configWarnings.map((w, i) => (
                        <li key={i} className="text-xs text-amber-300/70">• {w}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => setShowWarnings(false)}
                    className="text-amber-500 hover:text-amber-300 text-sm leading-none"
                  >✕</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400"
              >
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <FormRenderer config={healedConfig} onSubmit={handleSubmit} darkMode />
          </motion.div>

          {/* Table */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <TableRenderer config={healedConfig} submissions={submissions} onDelete={handleDelete} />
          </motion.div>
        </div>

        <ExportModal
          config={healedConfig}
          isOpen={showExport}
          onClose={() => setShowExport(false)}
        />
        <CsvImportModal
          appId={app._id}
          isOpen={showCsv}
          onClose={() => setShowCsv(false)}
          onImported={() => void refreshSubmissions()}
        />
      </div>
    </ErrorBoundary>
  );
};

export default AppDetailClient;
