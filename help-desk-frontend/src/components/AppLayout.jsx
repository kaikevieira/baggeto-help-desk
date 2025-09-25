import Sidebar from "./Sidebar";


export default function AppLayout({ current, onNavigate, children }) {
    return (
        <div className="min-h-screen bg-fundo text-texto">
            <div className="mx-auto grid  grid-cols-1 md:grid-cols-[18rem_1fr]">
                <Sidebar current={current} onNavigate={onNavigate} />
                <main className="min-h-screen p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}