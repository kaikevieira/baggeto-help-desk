import React from "react";


export default function AuthBackground({ children }) {
    return (
        <div className="min-h-screen bg-fundo">

            {/* page container */}
            <div className="flex min-h-screen w-full items-center justify-center p-6">
                {children}
            </div>


            {/* subtle top border */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-azul-claro/30 to-transparent" />
        </div>
    );
}