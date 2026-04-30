"use client";

import { motion } from "framer-motion";
import { useMemo, useState, useRef } from "react";
import { post } from "../lib/api";
import { healConfig } from "../lib/configHealer";
import type { ApiResponse, App } from "../types";

type CreateAppModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (app: App) => void;
};

type CreateAppResponse = ApiResponse<{ app: App }>;

const CreateAppModal = ({ isOpen, onClose, onCreated }: CreateAppModalProps) => {
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        setJsonInput(result);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const healResult = useMemo(() => {
    if (!jsonInput.trim()) return null;
    try {
      const raw = JSON.parse(jsonInput);
      return healConfig(raw);
    } catch {
      return { status: "invalid" as const };
    }
  }, [jsonInput]);

  const handleCreate = async () => {
    if (!healResult || "status" in healResult) {
      setError("Please provide a valid JSON configuration.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { config } = healResult;
      const response: CreateAppResponse = await post("/api/apps", {
        appName: config.appName,
        description: config.description,
        config: config,
      });

      if (!response.success || !response.data) {
        setError(response.message || "Failed to create app.");
        return;
      }

      onCreated(response.data.app);
      setJsonInput("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create app.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl rounded-2xl border border-[#30363d] bg-[#161b22] p-7 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Forge New Application</h2>
            <p className="text-xs text-slate-400 mt-1">Paste JSON or upload a config file to generate your app.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] flex-1 overflow-hidden">
          {/* Input side */}
          <div className="flex flex-col gap-3 min-h-[300px]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">JSON Configuration</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
              >
                Upload File
              </button>
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{ "appName": "My App", "fields": [...] }'
              className="flex-1 w-full rounded-xl border border-[#30363d] bg-[#0d1117] p-4 text-sm font-mono text-slate-300 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all resize-none"
            />
            
            <div className="h-6">
              {healResult && !("status" in healResult) && (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Configuration valid
                </span>
              )}
              {healResult && "status" in healResult && (
                <span className="text-xs text-red-400 font-medium flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  Invalid JSON syntax
                </span>
              )}
            </div>
          </div>

          {/* Preview side */}
          <div className="flex flex-col gap-3 overflow-hidden">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Healing Preview</label>
            <div className="flex-1 rounded-xl border border-[#30363d] bg-[#0d1117]/50 p-5 overflow-y-auto space-y-4">
              {!healResult || "status" in healResult ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <span className="text-3xl mb-2">⚙️</span>
                  <p className="text-xs text-slate-400">Preview will appear here</p>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">{healResult.config.appName}</h3>
                    {healResult.config.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{healResult.config.description}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Inferred Fields</p>
                    {healResult.config.fields.map((f, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-slate-800/40 px-3 py-2 border border-slate-800">
                        <span className="text-xs text-slate-300">{f.label}</span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{f.type}</span>
                      </div>
                    ))}
                  </div>

                  {healResult.warnings.length > 0 && (
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                      <p className="text-[10px] font-bold text-amber-500 uppercase">Healer Logs</p>
                      <ul className="mt-1.5 space-y-1">
                        {healResult.warnings.map((w, i) => (
                          <li key={i} className="text-[10px] text-amber-400/80">• {w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-xs text-red-400 font-medium">{error}</p>}

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !healResult || "status" in healResult}
            className="btn-glow rounded-xl bg-violet-600 px-7 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Forging..." : "Create App"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateAppModal;
