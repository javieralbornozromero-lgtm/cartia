import React, { useEffect, useState } from "react";
import { Check, Ban, Trash2 } from "lucide-react";
import { listenOrders, updateOrder } from "../lib/orders.js";

export default function OrdersPanel({ restaurant }) {
  const [orders, setOrders] = useState(null);
  const accent = restaurant.accent || "#7A2331";

  useEffect(() => {
    const unsub = listenOrders(restaurant.slug, setOrders);
    return unsub;
  }, [restaurant.slug]);

  if (orders === null) return <div style={{ color: "#8B8378", fontSize: 13 }}>Cargando pedidos…</div>;

  const setStatus = (orderId, status) => updateOrder(restaurant.slug, orderId, { status });
  const removeLine = (order, itemId) => updateOrder(restaurant.slug, order.id, {
    items: order.items.filter((l) => l.itemId !== itemId),
  });
  const setLineStatus = (order, itemId, prepStatus) => updateOrder(restaurant.slug, order.id, {
    items: order.items.map((l) => (l.itemId === itemId ? { ...l, prepStatus } : l)),
  });

  const pendientes = orders.filter((o) => o.status === "pendiente");
  const confirmados = orders.filter((o) => o.status === "confirmado");

  const OrderCard = ({ o, isPending }) => (
    <div style={{
      border: `1px solid ${isPending ? accent : "#E4DBC8"}`, borderRadius: 12, padding: 14, marginBottom: 12,
      background: isPending ? `${accent}0D` : "#fff",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16 }}>Mesa {o.table}</span>
        <span style={{ fontSize: 11, color: "#8B8378", fontFamily: "'IBM Plex Mono', monospace" }}>
          {new Date(o.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {o.items.map((l) => (
        <div key={l.itemId} style={{ padding: "6px 0", borderBottom: isPending ? "none" : "1px solid #F0EADA" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: accent, minWidth: 22 }}>{l.qty}×</span>
            <span style={{ flex: 1 }}>{l.name}{l.categoryName ? <span style={{ color: "#A79C86", fontSize: 11 }}> · {l.categoryName}</span> : null}</span>
            {isPending && (
              <button onClick={() => removeLine(o, l.itemId)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Trash2 size={13} color="#B0473F" />
              </button>
            )}
          </div>
          {!isPending && (
            <div style={{ display: "flex", gap: 6, marginTop: 6, marginLeft: 30 }}>
              {[
                { id: "pendiente", label: "En espera" },
                { id: "preparando", label: "Preparando" },
                { id: "listo", label: "Listo" },
              ].map((s) => {
                const active = (l.prepStatus || "pendiente") === s.id;
                return (
                  <button key={s.id} onClick={() => setLineStatus(o, l.itemId, s.id)} style={{
                    padding: "4px 9px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, cursor: "pointer",
                    border: active ? "none" : "1px solid #DCD0B4",
                    background: active ? accent : "#fff", color: active ? "#fff" : "#8B8378",
                  }}>{s.label}</button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {o.note && <div style={{ fontSize: 12, color: "#8A6E4B", marginTop: 6, fontStyle: "italic" }}>Nota: {o.note}</div>}

      {isPending && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={() => setStatus(o.id, "confirmado")} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", borderRadius: 8,
            background: accent, border: "none", color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
          }}><Check size={14} />Confirmar y sacar comanda</button>
          <button onClick={() => setStatus(o.id, "cancelado")} style={{
            padding: "9px 12px", borderRadius: 8, border: "1px solid #DCD0B4", background: "#fff",
            color: "#8B8378", fontSize: 12.5, cursor: "pointer",
          }}><Ban size={14} /></button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <p style={{ fontSize: 13, color: "#8B8378", marginBottom: 16, lineHeight: 1.5 }}>
        Los pedidos que hagan los comensales desde la carta llegan aquí primero, en tiempo real. Revísalos, corrige lo
        que haga falta y pulsa <b>"Confirmar y sacar comanda"</b> — no van a cocina automáticamente.
      </p>
      {pendientes.length === 0 && confirmados.length === 0 && (
        <div style={{ textAlign: "center", color: "#A79C86", fontSize: 13.5, padding: "24px 0" }}>Todavía no ha llegado ningún pedido.</div>
      )}
      {pendientes.length > 0 && (
        <>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.06em", color: accent, marginBottom: 8 }}>NUEVOS · {pendientes.length}</div>
          {pendientes.map((o) => <OrderCard key={o.id} o={o} isPending />)}
        </>
      )}
      {confirmados.length > 0 && (
        <>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.06em", color: "#8B8378", margin: "16px 0 8px" }}>EN COCINA · {confirmados.length}</div>
          {confirmados.map((o) => <OrderCard key={o.id} o={o} isPending={false} />)}
        </>
      )}
    </div>
  );
}
