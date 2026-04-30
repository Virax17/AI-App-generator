"use client";

import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import FormRenderer from "../../components/FormRenderer";
import { healConfig } from "../../lib/configHealer";
import type { AppConfig } from "../../types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const DEFAULT_JSON = JSON.stringify(
  {
    appName: "AppForge Demo",
    description: "A premium form generated in real-time from JSON.",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "John Doe" },
      { name: "email", label: "Email", type: "email", required: true, placeholder: "john@example.com" },
      { name: "category", label: "Project Category", type: "dropdown", options: ["Web", "Mobile", "AI"], required: true },
      { name: "bio", label: "Short Bio", type: "textarea", placeholder: "Tell us about yourself..." },
      { name: "notifications", label: "Enable notifications", type: "checkbox" },
    ],
  },
  null,
  2
);

type ParseState =
  | { status: "valid"; config: AppConfig; warnings: string[] }
  | { status: "invalid"; error: string }
  | { status: "empty" };

export default function PlaygroundClient() {
  const [code, setCode] = useState(DEFAULT_JSON);
  const [darkMode, setDarkMode] = useState(true);
  const [parseState, setParseState] = useState<ParseState>({ status: "empty" });
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const parse = useCallback((value: string) => {
    if (!value.trim()) {
      setParseState({ status: "empty" });
      return;
    }
    try {
      const raw = JSON.parse(value);
      const { config, warnings } = healConfig(raw);
      setParseState({ status: "valid", config, warnings });
    } catch (e) {
      const msg = e instanceof SyntaxError ? e.message : "Invalid JSON";
      setParseState({ status: "invalid", error: msg });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => parse(code), 350);
    return () => clearTimeout(timer);
  }, [code, parse]);

  // Load from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("config");
    if (shared) {
      try {
        const decoded = atob(shared);
        setCode(decoded);
      } catch (e) {
        console.error("Failed to decode shared config", e);
      }
    }
  }, []);

  const handleShare = () => {
    try {
      const encoded = btoa(code);
      const url = `${window.location.origin}${window.location.pathname}?config=${encoded}`;
      navigator.clipboard.writeText(url);
      setShareStatus("URL copied! ✓");
      setTimeout(() => setShareStatus(null), 3000);
    } catch {
      setShareStatus("Failed to copy URL");
    }
  };

  const bg = darkMode ? "bg-[#0d1117]" : "bg-slate-50";
  const panelBg = darkMode ? "bg-[#161b22] border-[#30363d]" : "bg-white border-slate-200";
  const textPrimary = darkMode ? "text-slate-100" : "text-slate-900";
  const textMuted = darkMode ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 flex flex-col`}>
      {/* Header */}
      <div className={`border-b px-6 py-4 flex items-center justify-between ${panelBg} z-10 shadow-sm`}>
        <div className="flex items-center gap-4">
          <div>
            <h1 className={`text-lg font-bold font-mono ${textPrimary} flex items-center gap-2`}>
              <span className="text-violet-400">{"{ }"}</span> 
              <span>Playground</span>
            </h1>
            <p className={`text-[10px] uppercase tracking-widest font-bold ${textMuted}`}>Live Forge Environment</p>
          </div>
          <div className="h-8 w-px bg-slate-800 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
             {parseState.status === "valid" && (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-tight border border-emerald-500/20">
                  Ready
                </span>
              )}
              {parseState.status === "invalid" && (
                <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold text-red-400 uppercase tracking-tight border border-red-500/20">
                  Sync Error
                </span>
              )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              shareStatus 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" 
                : "border border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800"
            }`}
          >
            {shareStatus || "🔗 Share Config"}
          </button>
          
          <button
            onClick={() => setDarkMode((d) => !d)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              darkMode
                ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                : "border-slate-300 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {darkMode ? "☀" : "🌑"}
          </button>

          <button
            onClick={() => setCode(DEFAULT_JSON)}
            className="rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-violet-700 shadow-lg shadow-violet-600/20 transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className={`w-1/2 flex flex-col border-r ${darkMode ? "border-[#30363d]" : "border-slate-200"}`}>
          <div className="flex-1">
            <MonacoEditor
              height="100%"
              language="json"
              value={code}
              onChange={(v) => setCode(v ?? "")}
              theme={darkMode ? "vs-dark" : "light"}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                padding: { top: 20 },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 22,
              }}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="w-1/2 overflow-y-auto p-8 mesh-bg">
          <div className="max-w-xl mx-auto space-y-6">
            <AnimatePresence mode="wait">
              {parseState.status === "invalid" ? (
                <FormError key="error" error={parseState.error} />
              ) : parseState.status === "valid" ? (
                <div key="valid" className="space-y-6">
                  {/* Warning banner */}
                  {parseState.warnings.length > 0 && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">Self-Healer Active</p>
                      <ul className="space-y-1">
                        {parseState.warnings.map((w, i) => (
                          <li key={i} className="text-[11px] text-amber-300/70">• {w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h2 className={`text-2xl font-extrabold tracking-tight ${textPrimary}`}>
                      {parseState.config.appName}
                    </h2>
                    {parseState.config.description && (
                      <p className={`mt-2 text-sm leading-relaxed ${textMuted}`}>
                        {parseState.config.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <FormRenderer
                      config={parseState.config}
                      onSubmit={async () => {
                        await new Promise((r) => setTimeout(r, 1000));
                      }}
                      darkMode={darkMode}
                    />
                  </div>
                </div>
              ) : (
                <div key="empty" className="h-[400px] flex flex-col items-center justify-center text-center opacity-40">
                  <span className="text-5xl mb-4">⌨️</span>
                  <h3 className={`text-lg font-bold ${textPrimary}`}>Syncing environment...</h3>
                  <p className={`text-xs mt-1 ${textMuted}`}>Configuration will appear as you type.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormError({ error }: { error: string }) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 flex flex-col items-center text-center">
      <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500 text-xl font-bold">!</div>
      <h3 className="text-red-400 font-bold">Sync Error</h3>
      <p className="mt-2 text-xs font-mono text-red-300/70 bg-black/40 p-3 rounded-lg w-full text-left overflow-x-auto">
        {error}
      </p>
      <p className="mt-4 text-[11px] text-slate-500">
        The forge requires valid JSON syntax to synchronize the live preview.
      </p>
    </div>
  );
}
