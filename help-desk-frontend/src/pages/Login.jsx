import { useState } from "react";
import AuthBackground from "../components/AuthBackground";
import AuthCard from "../components/AuthCard";
import Button from "../components/Button";
import InputField from "../components/InputField";


export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(true);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);


    function validate() {
        const next = {};
        if (!email) next.email = "Informe seu usuário.";
        else if (email.length < 3) next.email = "O usuário deve ter pelo menos 3 caracteres.";


        if (!password) next.password = "Informe sua senha.";
        else if (password.length < 6) next.password = "A senha deve ter pelo menos 6 caracteres.";


        setErrors(next);
        return Object.keys(next).length === 0;
    }


    async function onSubmit(e) {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);


        try {
            // TODO: integrar com seu backend de autenticação
            await new Promise((r) => setTimeout(r, 800));
            console.log({ email, password, remember });
            // redirecionar após login bem-sucedido
            // navigate("/dashboard");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }


    return (
        <AuthBackground>
            <AuthCard
                title="Acessar conta"
                subtitle="Entre com suas credenciais para continuar"
            >
                <form onSubmit={onSubmit} className="grid gap-5">
                    <InputField
                        id="email"
                        label="Usuário"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Digite seu usuário"
                        autoComplete="username"
                        error={errors.email}
                    />


                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-sm font-medium text-titulo">Senha</label>
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="p-1 text-texto hover:text-titulo transition-colors"
                                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2 12S5 5 12 5s10 7 10 7-3 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                                        <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2 12S5 5 12 5s10 7 10 7-3 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="w-full rounded-xl border border-borda bg-transparent px-4 py-3 text-titulo placeholder:text-texto/60 focus:border-azul-claro focus:outline-none focus:ring-2 focus:ring-azul-claro/20"
                        />
                        {errors.password && (
                            <p className="text-sm text-red-400" role="alert">{errors.password}</p>
                        )}
                    </div>


                    <div className="flex items-center justify-between">
                        <label className="inline-flex cursor-pointer items-center gap-2 select-none">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                className="h-4 w-4 rounded  border-borda bg-transparent text-azul-claro focus:ring-azul-claro/40"
                            />
                            <span className="text-sm text-texto">Lembrar de mim</span>
                        </label>
                    </div>


                    <Button type="submit" loading={loading}>
                        Entrar
                    </Button>
                </form>
            </AuthCard>
        </AuthBackground>
    );
}