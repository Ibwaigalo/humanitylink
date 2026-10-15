import { REGIONS, SECTEURS, STATUT_PROJET_LABEL } from "@/lib/constants";

export const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-hl-navy focus:outline-none";

export const labelClass = "block text-sm font-medium text-slate-700";

type TextFieldProps = {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  placeholder?: string;
  required?: boolean;
};

export function TextField({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  required,
}: TextFieldProps) {
  return (
    <label className={labelClass}>
      {label}
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? undefined}
        className={inputClass}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  defaultValue,
  rows = 3,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label className={labelClass}>
      {label}
      <textarea
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue ?? undefined}
        className={inputClass}
      />
    </label>
  );
}

export function SecteurSelect({
  name = "secteur",
  defaultValue,
  required,
  allowEmpty,
}: {
  name?: string;
  defaultValue?: string | null;
  required?: boolean;
  allowEmpty?: boolean;
}) {
  return (
    <label className={labelClass}>
      Secteur
      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className={inputClass}
      >
        {allowEmpty && <option value="">— Aucun —</option>}
        {SECTEURS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function RegionSelect({
  name = "region",
  defaultValue,
  allowEmpty,
}: {
  name?: string;
  defaultValue?: string | null;
  allowEmpty?: boolean;
}) {
  return (
    <label className={labelClass}>
      Région
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className={inputClass}
      >
        {allowEmpty && <option value="">— Aucune / nationale —</option>}
        {REGIONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function StatutSelect({
  name = "statut",
  defaultValue,
}: {
  name?: string;
  defaultValue?: string | null;
}) {
  return (
    <label className={labelClass}>
      Statut
      <select name={name} defaultValue={defaultValue ?? "planifie"} className={inputClass}>
        {Object.entries(STATUT_PROJET_LABEL).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function RegionCheckboxes({
  name = "regions",
  selected = [],
}: {
  name?: string;
  selected?: string[];
}) {
  return (
    <fieldset>
      <legend className={labelClass}>Régions couvertes</legend>
      <div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-3">
        {REGIONS.map((r) => (
          <label key={r.value} className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name={name}
              value={r.value}
              defaultChecked={selected.includes(r.value)}
              className="h-4 w-4 rounded border-slate-300"
            />
            {r.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="rounded-lg bg-hl-navy px-4 py-2 text-sm font-semibold text-white hover:bg-hl-navy/90"
    >
      {children}
    </button>
  );
}
