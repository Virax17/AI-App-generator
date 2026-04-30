"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { AppConfig } from "../types";

const ExportModal = ({
  config,
  isOpen,
  onClose,
}: {
  config: AppConfig;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<"json" | "react">("json");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const jsonCode = JSON.stringify(config, null, 2);

  const generateReactCode = () => {
    const fields = config.fields.map(f => {
      const options = f.options ? `, options: ${JSON.stringify(f.options)}` : "";
      return `    { name: "${f.name}", label: "${f.label}", type: "${f.type}", required: ${f.required}${options} }`;
    }).join(",\n");

    return `import React from 'react';
import { FormForge } from '@appforge/core'; // Mock library reference

const GeneratedApp = () => {
  const config = {
    appName: "${config.appName}",
    description: "${config.description || ""}",
    fields: [
${fields}
    ]
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{config.appName}</h1>
      <FormForge config={config} onSubmit={(data) => console.log(data)} />
    </div>
  );
};

export default GeneratedApp;`;
  };

  const handleCopy = () => {
    const text = activeTab === "json" ? jsonCode : generateReactCode();
    navigator.clipboard.writeText(text);
    setCopyStatus("Copied to clipboard! ✓");
    setTimeout(() => setCopyStatus(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-3xl rounded-2xl border border-[#30363d] bg-[#161b22] p-7 shadow-2xl flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Export Application</h2>
            <p className="text-xs text-slate-400 mt-1">Export your generated app as raw JSON or a React component.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[#0d1117] rounded-xl border border-[#30363d] mb-4 w-fit">
          <button
            onClick={() => setActiveTab("json")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "json" ? "bg-violet-600 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            JSON Config
          </button>
          <button
            onClick={() => setActiveTab("react")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "react" ? "bg-violet-600 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            React Component
          </button>
        </div>

        {/* Code block */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          <pre className="flex-1 w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-5 text-[13px] font-mono text-slate-300 overflow-auto scrollbar-thin">
            {activeTab === "json" ? jsonCode : generateReactCode()}
          </pre>
          
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-[10px] font-bold text-slate-300 border border-slate-700 transition-all"
          >
            {copyStatus || "Copy Code"}
          </button>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Production Ready</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              Close
            </button>
            <button
              onClick={() => {
                const blob = new Blob([activeTab === "json" ? jsonCode : generateReactCode()], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = activeTab === "json" ? "app-config.json" : "GeneratedApp.tsx";
                a.click();
              }}
              className="btn-glow rounded-xl bg-violet-600 px-7 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-all"
            >
              Download Source
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExportModal;
