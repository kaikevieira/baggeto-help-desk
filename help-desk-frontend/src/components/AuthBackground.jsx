import React from "react";


export default function AuthBackground({ children }) {
    return (
        <div className="relative min-h-screen bg-fundo">
            {/* gradient glow */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl opacity-30"
                    style={{ background: "radial-gradient(closest-side, var(--color-azul-claro), transparent)" }} />
                <div className="absolute right-[10%] bottom-[-10%] h-[380px] w-[380px] rounded-full blur-3xl opacity-25"
                    style={{ background: "radial-gradient(closest-side, var(--color-azul-escuro), transparent)" }} />
            </div>


            {/* page container */}
            <div className="mx-auto grid min-h-screen max-w-7xl place-items-center px-6">
                {children}
            </div>


            {/* subtle top border */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-azul-claro/30 to-transparent" />
        </div>
    );
}