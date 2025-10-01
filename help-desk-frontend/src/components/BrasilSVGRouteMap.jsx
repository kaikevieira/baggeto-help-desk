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
export default function BrazilSVGRouteMap({
  value = "",
  onChange,
  // altura preferida do mapa dentro do container
  height = "clamp(320px, 60vh, 560px)",
  // largura máxima (para não ficar exagerado em telas muito largas)
  maxWidth = "900px",
}) {
  const wrapperRef = useRef(null);
  const svgHostRef = useRef(null); // div que recebe o SVG (inline)
  const [centers, setCenters] = useState({}); // { UF: {x,y} }
  const [viewBox, setViewBox] = useState("0 0 1000 600");

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

  // Responsividade: ocupa 100% do container mantendo o viewBox
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("viewBox", svg.getAttribute("viewBox") || viewBox);
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.maxWidth = "100%";

    // Ativa pointer-events e cursores
    svg.querySelectorAll("path[id^='BR-']").forEach((p) => {
      p.style.cursor = "pointer";
      p.setAttribute("vector-effect", "non-scaling-stroke");
      p.classList.add("transition-colors", "duration-200");

      // hover feedback
      p.addEventListener("mouseenter", () => p.classList.add("mapsvg-hover"));
      p.addEventListener("mouseleave", () => p.classList.remove("mapsvg-hover"));
    });

    // Calcula auto-fit do viewBox com base na união das UFs para remover margens extras
    const allPaths = svg.querySelectorAll("path[id^='BR-']");
    if (allPaths.length) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      allPaths.forEach((p) => {
        const bb = p.getBBox();
        minX = Math.min(minX, bb.x);
        minY = Math.min(minY, bb.y);
        maxX = Math.max(maxX, bb.x + bb.width);
        maxY = Math.max(maxY, bb.y + bb.height);
      });
      const pad = 10; // pequeno padding para não encostar nas bordas
      const vb = `${minX - pad} ${minY - pad} ${maxX - minX + 2 * pad} ${maxY - minY + 2 * pad}`;
      svg.setAttribute("viewBox", vb);
      setViewBox(vb);
    }

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
    <div ref={wrapperRef} className="w-full h-full flex items-center justify-center">
      {/* Container do mapa com controle de tamanho */}
      <div className="relative w-full mx-auto" style={{ height, maxWidth }}>
        <div className="relative w-full h-full">
          <div ref={svgHostRef} className="w-full h-full select-none" />
          {/* Overlay via SVG separado para polyline e marcadores */}
          <svg 
            className="pointer-events-none absolute inset-0 w-full h-full" 
            preserveAspectRatio="xMidYMid meet"
            viewBox={viewBox}
          >
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
      </div>

      {/* CSS util aplicável aos paths do mapa - melhorado para responsividade */}
      <style>{`
        .mapsvg-hover { filter: brightness(1.15); transition: filter 0.2s ease; }
        path[id^='BR-'] { 
          stroke: rgba(148,163,184,0.7); 
          stroke-width: 1.2; 
          transition: all 0.2s ease;
        }
        path[id^='BR-']:not(.mapsvg-selected) { 
          fill: rgba(100,116,139,0.35); 
        }
        path.mapsvg-selected { 
          fill: rgba(14,165,233,0.65); 
          stroke: rgba(14,165,233,0.8);
          stroke-width: 1.5;
        }
        
        /* Responsividade aprimorada */
        @media (max-width: 768px) {
          path[id^='BR-'] { stroke-width: 1; }
          path.mapsvg-selected { stroke-width: 1.2; }
        }
        
        @media (max-width: 480px) {
          path[id^='BR-'] { stroke-width: 0.8; }
          path.mapsvg-selected { stroke-width: 1; }
        }
      `}</style>
    </div>
  );
}