import { useEffect, useMemo, useRef, useState } from "react";

// 🔁 Se você preferir manter o arquivo no `public/`, comente a linha abaixo
// e use a versão com fetch() mais adiante.
import brazilSVGRaw from "../assets/brazil.svg?raw"; // coloque o brazil.svg em src/assets/

/**
 * Props
 *  - value: string ex.: "SP > PR > SC"
 *  - onChange: (newRouteStr) => void
 *  - height: altura máxima opcional do container (default 540)
 */
export default function BrazilSVGRouteMap({ value = "", onChange, height = 540 }) {
  const wrapperRef = useRef(null);
  const svgHostRef = useRef(null); // div que recebe o SVG (inline)
  const [centers, setCenters] = useState({}); // { UF: {x,y} }

  const selected = useMemo(() =>
    value ? value.split(" > ").filter(Boolean) : [],
  [value]);

  // --- util ------------------------------
  const toRouteStr = (arr) => (arr.length ? arr.join(" > ") : "");

  // --- injeta o SVG inline e liga eventos --
  useEffect(() => {
    if (!svgHostRef.current) return;

    // Limpa conteúdo anterior
    svgHostRef.current.innerHTML = "";
    // Insere o SVG bruto
    svgHostRef.current.insertAdjacentHTML("afterbegin", brazilSVGRaw);

    const svg = svgHostRef.current.querySelector("svg");
    if (!svg) return;

    // Responsividade básico
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.width = "100%";
    svg.style.height = "100%";

    // Ativa pointer-events e cursores
    svg.querySelectorAll("path[id^='BR-']").forEach((p) => {
      p.style.cursor = "pointer";
      p.setAttribute("vector-effect", "non-scaling-stroke");
      p.classList.add("transition-colors", "duration-200");

      // hover feedback
      p.addEventListener("mouseenter", () => p.classList.add("mapsvg-hover"));
      p.addEventListener("mouseleave", () => p.classList.remove("mapsvg-hover"));
    });

    // Calcula centros (bbox) para desenhar rota
    const nextCenters = {};
    svg.querySelectorAll("path[id^='BR-']").forEach((p) => {
      const uf = p.id.split("-")[1];
      const bb = p.getBBox();
      nextCenters[uf] = { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
    });
    setCenters(nextCenters);
  }, []);

  // --- adiciona event listeners sempre que value mudar ---
  useEffect(() => {
    const svg = svgHostRef.current?.querySelector("svg");
    if (!svg) return;

    const handleClick = (uf) => {
      // Lê o estado atual diretamente do value
      const currentSelected = value ? value.split(" > ").filter(Boolean) : [];
      const i = currentSelected.indexOf(uf);
      let next = [...currentSelected];
      if (i !== -1) next = next.slice(0, i);
      else next.push(uf);
      onChange?.(toRouteStr(next));
    };

    // Adiciona event listeners
    svg.querySelectorAll("path[id^='BR-']").forEach((p) => {
      const uf = p.id.split("-")[1];
      const clickHandler = () => handleClick(uf);
      p.addEventListener("click", clickHandler);
      // Armazena handler no elemento para remoção posterior
      p._clickHandler = clickHandler;
    });

    return () => {
      // Remove handlers
      svg.querySelectorAll("path[id^='BR-']").forEach((p) => {
        if (p._clickHandler) {
          p.removeEventListener("click", p._clickHandler);
          delete p._clickHandler;
        }
      });
    };
  }, [value, onChange]);

  // --- aplica estilos de seleção sempre que a rota mudar ---
  useEffect(() => {
    const svg = svgHostRef.current?.querySelector("svg");
    if (!svg) return;

    svg.querySelectorAll("path[id^='BR-']").forEach((p) => {
      const uf = p.id.split("-")[1];
      const idx = selected.indexOf(uf);
      if (idx === -1) {
        p.classList.remove("mapsvg-selected");
      } else {
        p.classList.add("mapsvg-selected");
      }
    });
  }, [selected]);

  // Pontos na ordem da rota para desenhar o polyline
  const linePoints = useMemo(() => {
    return selected
      .map((uf) => centers[uf])
      .filter(Boolean)
      .map(({ x, y }) => `${x},${y}`)
      .join(" ");
  }, [selected, centers]);

  // Limpar rota
  const clear = () => onChange?.("");

  return (
    <div ref={wrapperRef} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-titulo mb-1">Rota por Estados (mapa)</label>
          <p className="text-xs text-texto/60">Clique nos estados na ordem da viagem</p>
        </div>
        {!!selected.length && (
          <button onClick={clear} type="button" className="text-xs text-red-400 hover:text-red-300">Limpar rota</button>
        )}
      </div>

      {!!selected.length && (
        <div className="rounded-lg border border-borda bg-fundo/50 p-3">
          <div className="text-sm text-titulo font-medium mb-1">Rota selecionada:</div>
          <div className="text-azul-claro font-mono text-lg">{value}</div>
        </div>
      )}

      {/* Container do mapa + overlay para linha e ordem */}
      <div className="relative rounded-2xl border border-borda bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4">
        <div className="aspect-[612/639] w-full">
          <div ref={svgHostRef} className="w-full h-full select-none" />
          {/* Overlay via SVG separado para polyline e marcadores */}
          <svg className="pointer-events-none absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* polyline conectando centros */}
            {selected.length >= 2 && (
              <polyline
                points={linePoints}
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                className="text-azul-claro/80 drop-shadow"
              />
            )}

            {/* marcadores numerados */}
            {selected.map((uf, i) => {
              const c = centers[uf];
              if (!c) return null;
              return (
                <g key={uf}>
                  <circle cx={c.x} cy={c.y} r={12} className="fill-azul-claro" />
                  <text x={c.x} y={c.y + 4} textAnchor="middle" className="fill-white text-[10px] font-bold">
                    {i + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legenda compacta */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-texto/70">
          <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-azul-claro/70"/> Selecionado</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-6 bg-current"/> Trajeto</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-azul-claro"/> Ordem</span>
        </div>
      </div>

      <div className="text-xs text-texto/50 space-y-1">
        <p>• Clique novamente em um estado para remover ele e os posteriores.</p>
        <p>• A ordem define o roteiro. Você pode misturar qualquer UF.</p>
      </div>

      {/* CSS util aplicável aos paths do mapa */}
      <style>{`
        .mapsvg-hover { filter: brightness(1.15); }
        path[id^='BR-'] { stroke: rgba(148,163,184,0.7); stroke-width: 1.2; }
        path[id^='BR-']:not(.mapsvg-selected) { fill: rgba(100,116,139,0.35); }
        path.mapsvg-selected { fill: rgba(14,165,233,0.65); }
      `}</style>
    </div>
  );
}