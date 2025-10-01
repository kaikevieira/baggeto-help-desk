import React from "react";
export function StateRouteSelectorFallback({ value = "", onChange }) {
    const STATES = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"];
    const selected = value ? value.split(" > ") : [];
    const toggle = (uf) => {
        const i = selected.indexOf(uf);
        let arr = [...selected];
        if (i !== -1) arr = arr.slice(0, i); else arr.push(uf);
        onChange(arr.join(" > "));
    };
    return (
        <div className="grid grid-cols-6 gap-2">
            {STATES.map((uf) => (
                <button key={uf} onClick={() => toggle(uf)}
                    className={`h-10 rounded-lg border-2 text-xs font-bold ${selected.includes(uf) ? 'bg-azul-claro/30 border-azul-claro text-azul-claro' : 'border-slate-600/40 text-slate-300'}`}
                    title={uf}
                >{uf}</button>
            ))}
        </div>
    );
}