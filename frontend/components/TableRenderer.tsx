"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { AppConfig, AppData } from "../types";

type TableRendererProps = {
  config: AppConfig;
  submissions: AppData[];
  onDelete: (dataId: string) => Promise<void>;
};

const getColumns = (config: AppConfig) => {
  return config.fields?.map((field) => ({
    name: field.name,
    label: field.label || field.name,
  })) ?? [];
};

const TableRenderer = ({ config, submissions, onDelete }: TableRendererProps) => {
  const columns = getColumns(config);

  return (
    <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-100">Recent Submissions</h2>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
          {submissions.length} total
        </span>
      </div>

      {submissions.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-slate-500">No data submitted yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#30363d] text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                {columns.map((col) => (
                  <th key={col.name} className="px-4 py-3">
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {submissions.map((row, idx) => (
                  <motion.tr
                    key={row._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-[#30363d]/50 hover:bg-slate-800/30 transition-colors group"
                  >
                    {columns.map((col) => (
                      <td key={col.name} className="px-4 py-3 text-slate-300">
                        {row.data?.[col.name] !== undefined
                          ? String(row.data[col.name])
                          : "—"}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onDelete(row._id)}
                        className="opacity-0 group-hover:opacity-100 rounded-lg px-3 py-1 text-xs font-semibold text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TableRenderer;
