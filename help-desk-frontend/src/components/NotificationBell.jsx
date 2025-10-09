import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dismiss, listNotifications, markRead, openNotificationsStream, unreadCount } from "../api/notifications";
import { FiBell } from "react-icons/fi";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const bellRef = useRef(null);
  const navigate = useNavigate();

  // Fechar ao clicar fora
  useEffect(() => {
    const onDoc = (e) => { if (!bellRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [{ count: c }, list] = await Promise.all([
        unreadCount(),
        listNotifications({ page: 1, pageSize: 20 })
      ]);
      setCount(c || 0);
      setItems(list.items || []);
    } finally { setLoading(false); }
  }

  // SSE para receber novos eventos
  useEffect(() => {
    let es;
    let poll;
    try {
      es = openNotificationsStream();
      es.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data?.kind === 'notification:new') {
            load();
          }
        } catch {}
      };
      es.onerror = () => {
        // Fallback: polling a cada 15s
        try { es?.close(); } catch {}
        if (!poll) {
          poll = setInterval(() => { load(); }, 15000);
        }
      };
    } catch {
      // Se EventSource falhar antes, inicia polling
      poll = setInterval(() => { load(); }, 15000);
    }
    return () => {
      try { es?.close(); } catch {}
      if (poll) clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    load();
  }, []);

  async function openAndLoad() {
    setOpen((v) => !v);
    if (!open) await load();
  }

  async function handleView(rec) {
    // Marca como lida e navega ao ticket
    try { await markRead(rec.notificationId); } catch {}
    navigate(`/tickets/${rec.notification.ticketId}`);
    setOpen(false);
  }

  async function handleDismiss(rec) {
    try { await dismiss(rec.notificationId); } catch {}
    await load();
  }

  return (
    <div className="relative p-2" ref={bellRef}>
      <button
        className="relative rounded-full p-2 border border-borda hover:border-azul-claro/50 hover:bg-azul-claro/10 transition-colors"
        onClick={openAndLoad}
        aria-label="Notificações"
      >
        <FiBell className="w-5 h-5 text-texto" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] text-white grid place-items-center" style={{ backgroundColor: 'var(--color-vermelho)' }}>
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute m-2 right-0 mt-2 w-96 max-w-[90vw] rounded-xl border border-borda shadow-xl z-50" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="px-3 py-2 border-b border-borda flex items-center justify-between">
            <span className="text-sm font-medium text-titulo">Notificações</span>
            {loading && <span className="text-xs text-texto/60">carregando…</span>}
          </div>
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {items.length === 0 && (
              <div className="px-4 py-6 text-sm text-texto/60">Sem notificações</div>
            )}
            {items.map((rec) => (
              <div key={rec.id} className="px-4 py-3 border-b border-borda/60">
                <div className="text-sm text-titulo mb-1">{rec.notification.message}</div>
                <div className="text-xs text-texto/60 mb-2">
                  #{rec.notification.ticketId} • {new Date(rec.notification.createdAt || rec.createdAt).toLocaleString('pt-BR')}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleView(rec)} className="rounded-md px-2 py-1 text-xs bg-azul-claro/20 text-azul-claro border border-azul-claro/30 hover:bg-azul-claro/30">Visualizar</button>
                  <button onClick={() => handleDismiss(rec)} className="rounded-md px-2 py-1 text-xs text-texto border border-borda hover:bg-borda/20">Fechar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
