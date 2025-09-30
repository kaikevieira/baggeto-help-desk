import { useEffect, useMemo, useRef, useState } from "react";

export default function CityUFInput({
  label = "Cidade/UF",
  value,        // { city, uf, ibgeId } | undefined
  onChange,     // (next) => void
  placeholder = "Digite a cidade e selecione a UF",
  defaultUF = "SC",
}) {
  const [ufs, setUfs] = useState([]);
  const [uf, setUf] = useState(value?.uf || defaultUF);
  const [cities, setCities] = useState([]);
  const [q, setQ] = useState(value?.city || "");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  // fecha dropdown ao clicar fora
  useEffect(() => {
    const onDoc = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // carrega UFs (uma vez)
  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((r) => r.json())
      .then((list) => {
        const sorted = list
          .map((s) => ({ sigla: s.sigla, nome: s.nome }))
          .sort((a, b) => a.sigla.localeCompare(b.sigla));
        setUfs(sorted);
        if (!value?.uf && defaultUF && sorted.some((u) => u.sigla === defaultUF)) {
          setUf(defaultUF);
        }
      })
      .catch(() => {});
  }, []); // :contentReference[oaicite:2]{index=2}

  // carrega cidades da UF
  useEffect(() => {
    if (!uf) return;
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
      .then((r) => r.json())
      .then((list) => {
        setCities(list.map((m) => ({ id: m.id, nome: m.nome })));
      })
      .catch(() => {});
  }, [uf]); // :contentReference[oaicite:3]{index=3}

  // sugestões por nome
  const suggestions = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return cities;
    return cities.filter((c) => c.nome.toLowerCase().includes(term)).slice(0, 50);
  }, [q, cities]);

  const selectCity = (cityObj) => {
    setQ(cityObj.nome);
    setOpen(false);
    onChange?.({ city: cityObj.nome, uf, ibgeId: cityObj.id });
  };

  return (
    <div ref={boxRef} className="grid gap-1">
      <label className="mb-1 block text-sm text-texto/80">{label}</label>
      <div className="grid grid-cols-[1fr_5rem] gap-2">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto placeholder:text-texto/50 focus:outline-none focus:ring-2 focus:ring-azul-claro/30"
          />
          {open && suggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-borda bg-[#101010] shadow-lg custom-scrollbar">
              {suggestions.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => selectCity(s)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-white/5 hover:text-titulo transition-colors"
                >
                  {s.nome}/{uf}
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          value={uf || ""}
          onChange={(e) => { setUf(e.target.value); setOpen(true); }}
          className="custom-select rounded-xl border border-borda bg-[#101010] px-3 py-2 text-texto focus:outline-none focus:ring-2 focus:ring-azul-claro/30 appearance-none cursor-pointer hover:border-azul-claro/50 transition-colors"
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23c1c1c1' stroke-width='2'><polyline points='6,9 12,15 18,9'></polyline></svg>")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
            backgroundSize: '16px'
          }}
        >
          <option value="" disabled>UF</option>
          {ufs.map((u) => (
            <option key={u.sigla} value={u.sigla}>{u.sigla}</option>
          ))}
        </select>
      </div>

      {/* preview do valor composto */}
      <p className="text-xs text-texto/60">
        Selecionado: {value?.city && value?.uf ? `${value.city}/${value.uf}` : "—"}
      </p>
    </div>
  );
}
