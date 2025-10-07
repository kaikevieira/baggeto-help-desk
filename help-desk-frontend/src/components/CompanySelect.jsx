import { useEffect, useMemo, useRef, useState } from "react";
import COMPANIES from "../data/companies";

/**
 * CompanySelect
 * - value: string (label armazenada no ticket)
 * - onChange: (label: string) => void
 * - placeholder: string
 * - label: string (opcional)
 */
export default function CompanySelect({ value, onChange, placeholder = "Selecione a empresa", label }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  const items = useMemo(() => {
    if (!query) return COMPANIES;
    const q = query.toLowerCase();
    return COMPANIES.filter((c) => c.label.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, items.length - 1));
        scrollIntoView(activeIndex + 1);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        scrollIntoView(activeIndex - 1);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const it = items[activeIndex];
        if (it) handleSelect(it);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, activeIndex]);

  function scrollIntoView(index) {
    const list = panelRef.current;
    if (!list) return;
    const el = list.querySelector(`[data-index="${index}"]`);
    if (el) {
      el.scrollIntoView({ block: "nearest" });
    }
  }

  function handleSelect(it) {
    onChange?.(it.label);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative">
      {label && (
        <label className="mb-1 block text-sm text-texto/80">{label}</label>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto focus:outline-none focus:ring-2 focus:ring-azul-claro/30"
          value={query || value}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="shrink-0 rounded-lg border border-borda px-2 py-2 text-xs text-texto/70 hover:text-texto/90"
            title="Limpar"
          >
            Limpar
          </button>
        )}
      </div>

      {open && (
        <div
          ref={panelRef}
          className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-borda bg-[#111315] p-1 shadow-xl"
          onMouseDown={(e) => e.preventDefault()}
        >
          {items.length === 0 && (
            <div className="px-3 py-2 text-sm text-texto/60">Nenhuma empresa encontrada</div>
          )}
          {items.map((it, idx) => (
            <button
              key={it.id}
              data-index={idx}
              type="button"
              onClick={() => handleSelect(it)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm text-texto hover:bg-white/5 ${
                idx === activeIndex ? "bg-white/10" : ""
              }`}
            >
              <div className="font-medium">{it.name}</div>
              <div className="text-xs text-texto/60">{it.cnpj} — {it.id.padStart(3, "0")}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
