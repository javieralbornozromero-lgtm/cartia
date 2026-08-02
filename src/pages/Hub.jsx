import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { Plus, Utensils, Tag, LogOut } from "lucide-react";
import { auth } from "../firebase.js";
import { listMyRestaurants, saveRestaurant, slugExists } from "../lib/restaurants.js";
import { emptyRestaurant, uid } from "../lib/constants.js";
import { inputStyle } from "../components/ui.jsx";

export default function Hub({ user }) {
  const [list, setList] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const refresh = () => listMyRestaurants(user.uid).then(setList);
  useEffect(() => { refresh(); }, [user.uid]);

  const createRestaurant = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    let slug = newName.trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);
    if (await slugExists(slug)) slug = `${slug}-${uid().slice(0, 4)}`;
    const r = emptyRestaurant(slug, user.uid);
    r.name = newName.trim();
    await saveRestaurant(r);
    setBusy(false);
    setCreating(false);
    setNewName("");
    navigate(`/panel/${slug}`);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#17130F", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ maxWidth: 460, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#C9A24B", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Utensils size={19} color="#17130F" />
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 22, color: "#F4EFE6" }}>Cartia</div>
          </div>
          <button onClick={() => signOut(auth)} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "#7A7261", fontSize: 12, cursor: "pointer" }}>
            <LogOut size={14} />Salir
          </button>
        </div>
        <div style={{ fontSize: 12.5, color: "#A79C86", marginBottom: 20 }}>{user.email}</div>

        <button onClick={() => navigate("/planes")} style={{
          display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "7px 14px",
          borderRadius: 999, border: "1px solid #4A4030", background: "transparent", color: "#C9A24B",
          fontSize: 12, cursor: "pointer", fontWeight: 600,
        }}><Tag size={12} />Ver planes y precios</button>

        {list === null && <div style={{ color: "#A79C86" }}>Cargando…</div>}
        {list?.length === 0 && !creating && (
          <div style={{ color: "#A79C86", fontSize: 13.5, marginBottom: 20 }}>Todavía no has creado ningún restaurante.</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {list?.map((r) => (
            <div key={r.slug} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#231D16", borderRadius: 12, border: "1px solid #332B1F" }}>
              <div>
                <div style={{ color: "#F4EFE6", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16 }}>{r.name}</div>
                <div style={{ color: "#7A7261", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>/{r.slug} · plan {r.plan}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a href={`/${r.slug}`} target="_blank" rel="noreferrer" style={{ padding: "8px 12px", borderRadius: 8, background: "transparent", border: "1px solid #4A4030", color: "#C9A24B", fontSize: 12, textDecoration: "none", fontWeight: 600 }}>Ver carta</a>
                <button onClick={() => navigate(`/panel/${r.slug}`)} style={{ padding: "8px 12px", borderRadius: 8, background: "#C9A24B", border: "none", color: "#17130F", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>Administrar</button>
              </div>
            </div>
          ))}
        </div>

        {creating ? (
          <div style={{ background: "#231D16", padding: 16, borderRadius: 12, border: "1px solid #332B1F" }}>
            <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre del restaurante"
              onKeyDown={(e) => e.key === "Enter" && createRestaurant()}
              style={{ ...inputStyle, marginBottom: 10, background: "#17130F", border: "1px solid #4A4030", color: "#F4EFE6" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={createRestaurant} disabled={busy} style={{ flex: 1, padding: 10, borderRadius: 8, background: "#C9A24B", border: "none", color: "#17130F", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{busy ? "Creando…" : "Crear"}</button>
              <button onClick={() => setCreating(false)} style={{ padding: "10px 14px", borderRadius: 8, background: "transparent", border: "1px solid #4A4030", color: "#A79C86", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setCreating(true)} style={{
            width: "100%", padding: 13, borderRadius: 10, background: "transparent", border: "1.5px dashed #4A4030",
            color: "#C9A24B", fontSize: 13.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          }}><Plus size={16} />Nuevo restaurante</button>
        )}
      </div>
    </div>
  );
}
