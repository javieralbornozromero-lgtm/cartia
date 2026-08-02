import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Store, Utensils, Languages, QrCode, ArrowLeft, Plus, Trash2, Download, Lock,
  ClipboardList, Users,
} from "lucide-react";
import { getRestaurant, saveRestaurant } from "../lib/restaurants.js";
import { ALLERGENS, LANGS, PLANS, uid } from "../lib/constants.js";
import { PUBLIC_URL } from "../firebase.js";
import { Field, inputStyle } from "../components/ui.jsx";
import OrdersPanel from "../components/OrdersPanel.jsx";
import QueuePanel from "../components/QueuePanel.jsx";

export default function AdminPanel({ user }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(undefined);
  const [section, setSection] = useState("info");
  const [savedFlash, setSavedFlash] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    getRestaurant(slug).then((r) => {
      if (r && r.ownerUid !== user.uid) { navigate("/panel"); return; }
      setRestaurant(r);
    });
  }, [slug]);

  const persist = useCallback((next) => {
    setRestaurant(next);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      await saveRestaurant(next);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
    }, 500);
  }, []);

  if (restaurant === undefined) return <div style={{ padding: 60, textAlign: "center", color: "#8B8378" }}>Cargando…</div>;
  if (!restaurant) return <div style={{ padding: 60, textAlign: "center", color: "#8B8378" }}>Restaurante no encontrado.</div>;

  const plan = PLANS.find((p) => p.id === restaurant.plan) || PLANS[0];
  const update = (patch) => persist({ ...restaurant, ...patch });

  const addCategory = () => {
    if (restaurant.categories.length >= plan.limits.maxCategories) return;
    update({ categories: [...restaurant.categories, { id: uid(), name: "Nueva categoría", items: [] }] });
  };
  const removeCategory = (id) => update({ categories: restaurant.categories.filter((c) => c.id !== id) });
  const updateCategory = (id, patch) => update({ categories: restaurant.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const addItem = (catId) => update({
    categories: restaurant.categories.map((c) => c.id === catId
      ? { ...c, items: [...c.items, { id: uid(), name: "Nuevo plato", description: "", price: "0,00", photo: "", allergens: [], translations: {} }] }
      : c),
  });
  const updateItem = (catId, itemId, patch) => update({
    categories: restaurant.categories.map((c) => c.id === catId
      ? { ...c, items: c.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) } : c),
  });
  const removeItem = (catId, itemId) => update({
    categories: restaurant.categories.map((c) => c.id === catId ? { ...c, items: c.items.filter((it) => it.id !== itemId) } : c),
  });

  const menuUrl = `${PUBLIC_URL}/${restaurant.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&color=17-13-10&data=${encodeURIComponent(menuUrl)}`;
  const langsAllowed = LANGS.slice(0, 1 + plan.limits.maxLangs).filter((l) => l.code !== "es");
  const catsAtLimit = restaurant.categories.length >= plan.limits.maxCategories;

  const nav = [
    { id: "info", label: "Datos del local", icon: Store },
    { id: "menu", label: "Carta y platos", icon: Utensils },
    { id: "pedidos", label: "Pedidos", icon: ClipboardList },
    { id: "turnos", label: "Lista de turno", icon: Users },
    { id: "idiomas", label: "Idiomas", icon: Languages },
    { id: "qr", label: "Código QR", icon: QrCode },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#F4EFE6", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #E4DBC8", background: "#F4EFE6", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate("/panel")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><ArrowLeft size={19} color="#17130F" /></button>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 17, color: "#17130F" }}>{restaurant.name}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: savedFlash ? "#4A7A4E" : "#A79C86", letterSpacing: "0.05em" }}>
              {savedFlash ? "✓ GUARDADO" : `PLAN ${plan.name.toUpperCase()}`}
            </div>
          </div>
        </div>
        <a href={menuUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 8, background: restaurant.accent, color: "#F4EFE6", textDecoration: "none", fontSize: 12.5, fontWeight: 600 }}>Ver carta ›</a>
      </div>

      <div style={{ display: "flex", gap: 6, padding: "12px 20px 0", overflowX: "auto" }}>
        {nav.map((n) => {
          const active = section === n.id;
          const Icon = n.icon;
          return (
            <button key={n.id} onClick={() => setSection(n.id)} style={{
              display: "flex", alignItems: "center", gap: 6, flexShrink: 0, padding: "9px 14px", borderRadius: "8px 8px 0 0",
              border: "none", cursor: "pointer", background: active ? "#fff" : "transparent", color: active ? "#17130F" : "#8B8378",
              fontSize: 12.5, fontWeight: 600, borderBottom: active ? `2px solid ${restaurant.accent}` : "2px solid transparent",
            }}><Icon size={14} />{n.label}</button>
          );
        })}
      </div>

      <div style={{ background: "#fff", padding: 20, maxWidth: 560, margin: "0 auto" }}>
        {section === "info" && (
          <div>
            <Field label="Nombre del restaurante"><input style={inputStyle} value={restaurant.name} onChange={(e) => update({ name: e.target.value })} /></Field>
            <Field label="Eslogan / tipo de cocina"><input style={inputStyle} value={restaurant.tagline} onChange={(e) => update({ tagline: e.target.value })} /></Field>
            <Field label="Teléfono"><input style={inputStyle} value={restaurant.phone} onChange={(e) => update({ phone: e.target.value })} /></Field>
            <Field label="Dirección"><input style={inputStyle} value={restaurant.address} onChange={(e) => update({ address: e.target.value })} /></Field>
            <Field label="URL foto de portada"><input style={inputStyle} placeholder="https://..." value={restaurant.cover} onChange={(e) => update({ cover: e.target.value })} /></Field>
            <Field label="Color de acento">
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="color" value={restaurant.accent} onChange={(e) => update({ accent: e.target.value })} style={{ width: 44, height: 36, border: "1px solid #DCD5C7", borderRadius: 8, cursor: "pointer", padding: 2 }} />
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, color: "#8B8378" }}>{restaurant.accent}</span>
              </div>
            </Field>
            <Field label="Plan contratado">
              <select value={restaurant.plan} onChange={(e) => update({ plan: e.target.value })} style={inputStyle}>
                {PLANS.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.price}€/mes</option>)}
              </select>
            </Field>
          </div>
        )}

        {section === "menu" && (
          <div>
            {restaurant.categories.map((cat) => (
              <div key={cat.id} style={{ marginBottom: 22, border: "1px solid #E4DBC8", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", background: "#F4EFE6" }}>
                  <input value={cat.name} onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                    style={{ ...inputStyle, fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 15.5, border: "none", background: "transparent", padding: "4px 0" }} />
                  <button onClick={() => removeCategory(cat.id)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={16} color="#B0473F" /></button>
                </div>
                <div style={{ padding: 14 }}>
                  {cat.items.map((item) => (
                    <div key={item.id} style={{ padding: "12px 0", borderBottom: "1px dashed #E4DBC8" }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <input value={item.name} onChange={(e) => updateItem(cat.id, item.id, { name: e.target.value })} placeholder="Nombre del plato" style={{ ...inputStyle, flex: 2 }} />
                        <input value={item.price} onChange={(e) => updateItem(cat.id, item.id, { price: e.target.value })} placeholder="Precio" inputMode="decimal" style={{ ...inputStyle, flex: 1, fontFamily: "'IBM Plex Mono', monospace" }} />
                        <button onClick={() => removeItem(cat.id, item.id)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={16} color="#B0473F" /></button>
                      </div>
                      <input value={item.description} onChange={(e) => updateItem(cat.id, item.id, { description: e.target.value })} placeholder="Descripción" style={{ ...inputStyle, marginBottom: 8 }} />
                      <input value={item.photo} onChange={(e) => updateItem(cat.id, item.id, { photo: e.target.value })} placeholder="URL de la foto (opcional)" style={{ ...inputStyle, marginBottom: 8 }} />
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {ALLERGENS.map((a) => {
                          const active = item.allergens?.includes(a.id);
                          const Icon = a.icon;
                          return (
                            <button key={a.id} onClick={() => {
                              const next = active ? item.allergens.filter((x) => x !== a.id) : [...(item.allergens || []), a.id];
                              updateItem(cat.id, item.id, { allergens: next });
                            }} style={{
                              display: "flex", alignItems: "center", gap: 4, padding: "5px 9px", borderRadius: 999,
                              border: `1px solid ${active ? restaurant.accent : "#DCD5C7"}`, background: active ? restaurant.accent : "#fff",
                              color: active ? "#fff" : "#8B8378", fontSize: 11, cursor: "pointer",
                            }}><Icon size={11} />{a.label}</button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => addItem(cat.id)} style={{
                    display: "flex", alignItems: "center", gap: 6, marginTop: 10, padding: "8px 12px", borderRadius: 8,
                    border: `1px dashed ${restaurant.accent}`, background: "none", color: restaurant.accent, fontSize: 12.5, cursor: "pointer", fontWeight: 600,
                  }}><Plus size={14} />Añadir plato</button>
                </div>
              </div>
            ))}
            {catsAtLimit ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "#FBF2E2", color: "#8B6B2A", fontSize: 12.5 }}>
                <Lock size={14} />Tu plan {plan.name} permite hasta {plan.limits.maxCategories} categorías. Sube de plan para añadir más.
              </div>
            ) : (
              <button onClick={addCategory} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 8, background: "#17130F", color: "#F4EFE6", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                <Plus size={15} />Nueva categoría
              </button>
            )}
          </div>
        )}

        {section === "pedidos" && <OrdersPanel restaurant={restaurant} />}
        {section === "turnos" && <QueuePanel restaurant={restaurant} />}

        {section === "idiomas" && (
          <div>
            <p style={{ fontSize: 13, color: "#8B8378", marginBottom: 16, lineHeight: 1.5 }}>
              Tu plan {plan.name} incluye {plan.limits.maxLangs === Infinity ? "idiomas ilimitados" : `hasta ${plan.limits.maxLangs} idioma(s) además del español`}.
              Si un idioma se deja en blanco, se mostrará el texto en español.
            </p>
            {langsAllowed.length === 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "#FBF2E2", color: "#8B6B2A", fontSize: 12.5, marginBottom: 16 }}>
                <Lock size={14} />Sube al plan Pro para añadir idiomas.
              </div>
            )}
            {restaurant.categories.map((cat) => (
              <div key={cat.id} style={{ marginBottom: 18 }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{cat.name}</div>
                {cat.items.map((item) => (
                  <div key={item.id} style={{ marginBottom: 14, padding: 12, background: "#F4EFE6", borderRadius: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{item.name}</div>
                    {langsAllowed.map((l) => (
                      <div key={l.code} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 15, width: 22 }}>{l.flag}</span>
                        <input placeholder={`Nombre (${l.label})`} style={{ ...inputStyle, flex: 1 }} value={item.translations?.[l.code]?.name || ""}
                          onChange={(e) => updateItem(cat.id, item.id, { translations: { ...item.translations, [l.code]: { ...item.translations?.[l.code], name: e.target.value } } })} />
                        <input placeholder={`Descripción (${l.label})`} style={{ ...inputStyle, flex: 1.5 }} value={item.translations?.[l.code]?.description || ""}
                          onChange={(e) => updateItem(cat.id, item.id, { translations: { ...item.translations, [l.code]: { ...item.translations?.[l.code], description: e.target.value } } })} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {section === "qr" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ fontSize: 13, color: "#8B8378", marginBottom: 18, lineHeight: 1.5 }}>
              Imprime este código QR y colócalo en las mesas. Al escanearlo, tus clientes verán la carta digital al instante.
            </p>
            <img src={qrUrl} alt="Código QR de la carta" style={{ width: 220, height: 220, borderRadius: 12, border: "1px solid #E4DBC8" }} />
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#8B8378", marginTop: 12 }}>{menuUrl}</div>
            <a href={qrUrl} download={`qr-${restaurant.slug}.png`} style={{
              display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16, padding: "10px 18px", borderRadius: 8,
              background: restaurant.accent, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600,
            }}><Download size={14} />Descargar QR</a>
          </div>
        )}
      </div>
    </div>
  );
}
