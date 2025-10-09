import { useEffect, useMemo, useRef, useState } from "react";

// Util simples para normalizar acentos e facilitar busca
function normalize(str = "") {
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase();
}

export default function CityUFInput({
  label = "Cidade/UF",
  value,        // { city, uf, ibgeId } | undefined
  onChange,     // (next) => void
  placeholder = "Digite a cidade (ex.: orleans, orleans/sc)",
  // defaultUF mantido por compatibilidade, mas não é mais usado no modo inteligente
  defaultUF = "SC",
}) {
  const [allCities, setAllCities] = useState([]); // [{ id, nome, uf }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState(
    value?.city && value?.uf ? `${value.city}/${value.uf}` : ""
  );
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

  // Sincroniza exibição quando value muda externamente
  useEffect(() => {
    if (value?.city && value?.uf) {
      setQ(`${value.city}/${value.uf}`);
    }
  }, [value?.city, value?.uf]);

  // Carrega todos os municípios do IBGE (uma única vez)
  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome"
        );
        const list = await res.json();
        if (cancelled) return;
        // Extrai UF sigla de microrregiao.mesorregiao.UF.sigla
        const mapped = (Array.isArray(list) ? list : []).map((m) => ({
          id: m?.id,
          nome: m?.nome,
          uf: m?.microrregiao?.mesorregiao?.UF?.sigla || "",
        }));
        // Filtra registros válidos e remove duplicatas por id
        const uniqueById = new Map();
        for (const c of mapped) {
          if (c.id && c.nome && c.uf) uniqueById.set(c.id, c);
        }
        setAllCities(Array.from(uniqueById.values()));
      } catch (e) {
        if (!cancelled) setError("Falha ao carregar cidades do IBGE");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  // sugestões por nome (busca em cidade e cidade/UF)
  const suggestions = useMemo(() => {
    const term = normalize(q.trim());
    if (!term) return allCities.slice(0, 50);
    return allCities
      .filter((c) => {
        const combo = normalize(`${c.nome}/${c.uf}`);
        // Também permite busca por espaço (ex.: "orleans sc")
        const comboSpace = normalize(`${c.nome} ${c.uf}`);
        return (
          combo.includes(term) ||
          comboSpace.includes(term) ||
          normalize(c.nome).includes(term)
        );
      })
      .slice(0, 50);
  }, [q, allCities]);

  const selectCity = (cityObj) => {
    setQ(`${cityObj.nome}/${cityObj.uf}`);
    setOpen(false);
    onChange?.({ city: cityObj.nome, uf: cityObj.uf, ibgeId: cityObj.id });
  };

  return (
    <div ref={boxRef} className="grid gap-1">
      <label className="mb-1 block text-sm text-texto/80">{label}</label>
      <div className="relative">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto placeholder:text-texto/50 focus:outline-none focus:ring-2 focus:ring-azul-claro/30"
        />
        {open && (
          <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-borda shadow-lg custom-scrollbar" style={{ backgroundColor: 'var(--color-surface)' }}>
            {loading && (
              <div className="px-3 py-2 text-sm text-texto/70">Carregando cidades...</div>
            )}
            {!loading && error && (
              <div className="px-3 py-2 text-sm text-red-400">{error}</div>
            )}
            {!loading && !error && suggestions.length === 0 && (
              <div className="px-3 py-2 text-sm text-texto/60">Nenhuma cidade encontrada</div>
            )}
            {!loading && !error && suggestions.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => selectCity(s)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-borda/20 hover:text-titulo transition-colors"
              >
                {s.nome}/{s.uf}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* preview do valor composto */}
      <p className="text-xs text-texto/60">
        Selecionado: {value?.city && value?.uf ? `${value.city}/${value.uf}` : "—"}
      </p>
    </div>
  );
}
