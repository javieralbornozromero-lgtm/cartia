import React, { useEffect, useState } from "react";
import { Users, Clock, X } from "lucide-react";
import { listenQueue, updateQueueEntry } from "../lib/queue.js";

export default function QueuePanel({ restaurant }) {
  const [queue, setQueue] = useState(null);
  const accent = restaurant.accent || "#7A2331";

  useEffect(() => {
    const unsub = listenQueue(restaurant.slug, setQueue);
    return unsub;
  }, [restaurant.slug]);

  if (queue === null) return <div style={{ color: "#8B8378", fontSize: 13 }}>Cargando cola…</div>;

  const setStatus = (id, status) => updateQueueEntry(restaurant.slug, id, { status });

  return (
    <div>
      <p style={{ fontSize: 13, color: "#8B8378", marginBottom: 16, lineHeight: 1.5 }}>
        Los comensales se apuntan desde "Lista de turno" en la carta, en tiempo real. Cuando les toque, siéntalos para sacarlos de la cola.
      </p>
      {queue.length === 0 && (
        <div style={{ textAlign: "center", color: "#A79C86", fontSize: 13.5, padding: "24px 0" }}>Nadie esperando ahora mismo.</div>
      )}
      {queue.map((e, i) => (
        <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid #E4DBC8", borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 999, background: accent, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 14, flexShrink: 0,
          }}>{i + 1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <Users size={13} />{e.partySize} {e.partySize === 1 ? "persona" : "personas"}
            </div>
            <div style={{ fontSize: 11.5, color: "#8B8378", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <Clock size={11} />esperando desde las {new Date(e.joinedAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          <button onClick={() => setStatus(e.id, "sentado")} style={{ padding: "8px 12px", borderRadius: 8, background: accent, border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Sentar</button>
          <button onClick={() => setStatus(e.id, "cancelado")} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #DCD0B4", background: "#fff", color: "#8B8378", cursor: "pointer" }}><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}
