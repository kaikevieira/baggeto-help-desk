import React from "react";


export default function AuthCard({ title, subtitle, children, footer }) {
    return (
        <div
            className="w-full max-w-md rounded-3xl border border-borda bg-[#1b1b1b]/70 p-6 sm:p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
            role="region"
            aria-label={title || "Área de autenticação"}
        >
            {(title || subtitle) && (
                <header className="mb-6">
                    {title && (
                        <h1 className="text-2xl font-semibold text-titulo">{title}</h1>
                    )}
                    {subtitle && (
                        <p className="mt-1 text-sm text-texto">{subtitle}</p>
                    )}
                </header>
            )}
            <div className="grid gap-4">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-texto">{footer}</div>}
        </div>
    );
}