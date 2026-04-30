import type { Field } from "../../types";

type FieldProps = { field: Field; value: unknown; onChange: (v: unknown) => void; error?: string; darkMode?: boolean };

const base = (dm?: boolean) =>
  dm ? "mt-1.5 w-full rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-colors"
     : "mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none";
const lbl = (dm?: boolean) => dm ? "block text-sm font-medium text-slate-300" : "block text-sm font-medium text-slate-700";

const EmailField = ({ field, value, onChange, error, darkMode }: FieldProps) => (
  <div className="w-full">
    <label className={lbl(darkMode)}>{field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}</label>
    <input type="email" value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={base(darkMode)} />
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);
export default EmailField;
