"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { postFormData } from "../lib/api";

const CsvImportModal = ({
  appId,
  isOpen,
  onClose,
  onImported,
}: {
  appId: string;
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await postFormData<unknown>(`/api/csv/${appId}`, formData);
      setLoading(false);

      if (!response.success) {
        setError(response.message || "CSV import failed.");
        return;
      }

      const payload = response as unknown as { imported?: number; skipped?: number };
      setResult({ imported: payload.imported ?? 0, skipped: payload.skipped ?? 0 });
      onImported();
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "CSV import failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-2xl border border-[#30363d] bg-[#161b22] p-7 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Import CSV Data</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>

        <div className="space-y-6">
          <div className="relative group">
            <input
              type="file"
              accept=".csv"
              id="csv-upload"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border-2 border-dashed border-[#30363d] group-hover:border-violet-500/50 rounded-xl p-8 text-center transition-all bg-[#0d1117]/50">
              <span className="text-3xl mb-3 block">📄</span>
              <p className="text-sm font-medium text-slate-300">
                {file ? file.name : "Click to select or drag CSV file"}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">Headers must match field names in your config.</p>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                {error}
              </motion.div>
            )}
            {result && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
                Success! Imported {result.imported} rows. {result.skipped > 0 && `(Skipped ${result.skipped} rows)`}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="btn-glow rounded-xl bg-violet-600 px-7 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40 transition-all"
          >
            {loading ? "Importing..." : "Start Import"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CsvImportModal;
