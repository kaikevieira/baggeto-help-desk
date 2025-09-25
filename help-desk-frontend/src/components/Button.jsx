import React from "react";


export default function Button({
    children,
    type = "button",
    onClick,
    loading = false,
    disabled = false,
    className = "",
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={
                `inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3
font-medium tracking-wide transition
bg-azul-escuro hover:bg-azul-claro active:translate-y-[1px]
text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-black/30
focus:outline-none focus-visible:ring-2 focus-visible:ring-azul-claro/70 ${className}`
            }
        >
            {loading && (
                <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                </svg>
            )}
            <span>{children}</span>
        </button>
    );
}