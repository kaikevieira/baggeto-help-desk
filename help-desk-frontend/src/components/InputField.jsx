import React from "react";


export default function InputField({
    id,
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    error,
    autoComplete,
}) {
    return (
        <div className="grid gap-2">
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-titulo">
                    {label}
                </label>
            )}
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className={`w-full rounded-xl border bg-transparent px-4 py-3 text-titulo placeholder:text-texto/60
border-borda focus:border-azul-claro focus:outline-none focus:ring-2 focus:ring-azul-claro/20`}
            />
            {error && (
                <p className="text-sm text-red-400" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}