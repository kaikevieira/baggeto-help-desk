import React from "react";


export default function StatCard({ title, value, trend = 0, hint }) {
    const positive = trend >= 0;
    return (
        <div className="rounded-2xl border border-borda bg-[#1b1b1b]/70 p-5 shadow-xl shadow-black/30">
            <p className="text-sm text-texto">{title}</p>
            <div className="mt-2 flex items-end justify-between gap-2">
                <h3 className="text-3xl font-semibold text-titulo">{value}</h3>
                <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs ${positive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        {positive ? <path d="M6 15l6-6 6 6" /> : <path d="M6 9l6 6 6-6" />}
                    </svg>
                    {positive ? "+" : ""}{trend}%
                </span>
            </div>
            {hint && <p className="mt-2 text-xs text-texto/70">{hint}</p>}
        </div>
    );
}