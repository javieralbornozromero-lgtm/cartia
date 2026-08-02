import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Share2, MapPin, Phone, X, Sparkles, Users, Clock, Check,
  ClipboardList, ShoppingBag, Minus, Plus, RefreshCw,
} from "lucide-react";
import { getRestaurant } from "../lib/restaurants.js";
import { submitOrder, listenTableOrders } from "../lib/orders.js";
import { joinQueue, listenQueue } from "../lib/queue.js";
import { ALLERGENS, LANGS, uid } from "../lib/constants.js";
import { IconBtn, inputStyle } from "../components/ui.jsx";

export default function PublicMenu() {
  const { slug } = useParams();
  const [restaurant, setRestaurant] = useState(undefined); // undefined = loading, null = not found
  const [activeCat, setActiveCat] = useState(null);
  const [openItem, setOpenItem] = useState(null);
  const [lang, setLang] = useState("es");
  const [langOpen, setLangOpen] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  const [table, setTable] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [orderSent, setOrderSent] = useState(false);
  const [sending, setSending] = useState(false);

  const [tableOpen, setTableOpen] = useState(false);
  const [tableOrders, setTableOrders] = useState([]);

  const [queueOpen, setQueueOpen] = useState(false);
  const [queueParty, setQueueParty] = useState(2);
  const [myQueueEntry, setMyQueueEntry] = useState(null);
  const [queueList, setQueueList] = useState([]);

  useEffect(() => {
    getRestaurant(slug).then((r) => {
      setRestaurant(r);
      if (r?.categories?.length) setActiveCat(r.categories[0].id);
    });
  }, [slug]);

  // escucha en tiempo real de los pedidos de esta mesa
  useEffect(() => {
    if (!tableOpen || !table.trim()) return;
    const unsub = listenTableOrders(slug, table.trim(), setTableOrders);
    return unsub;
  }, [tableOpen, table, slug]);

  // escucha en tiempo real de la cola
  useEffect(() => {
    if (!queueOpen) return;
    const unsub = listenQueue(slug, setQueueList);
    return unsub;
  }, [queueOpen, slug]);

  if (restaurant === undefined) {
    return <div style={{ padding: 60, textAlign: "center", color: "#8B8378", fontFamily: "'Inter', sans-serif" }}>Cargando carta…</div>;
  }
  if (restaurant === null) {
    return (
      <div style={{ padding: 60, textAlign: "center", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, marginBottom: 8 }}>Carta no encontrada</div>
        <div style={{ color: "#8B8378", fontSize: 13.5 }}>Comprueba el enlace o el código QR.</div>
      </div>
    );
  }

  const accent = restaurant.accent || "#7A2331";
  const t = (obj, field, fallback) => {
    if (lang === "es") return fallback;
    return obj?.translations?.[lang]?.[field] || fallback;
  };
  const cat = restaurant.categories.find((c) => c.id === activeCat);

  const categoryNameForItem = (itemId) => {
    const found = restaurant.categories.find((c) => c.items.some((it) => it.id === itemId));
    return found ? found.name : "";
  };

  const cartTotal = cart.reduce((s, l) => s + (parseFloat(String(l.price).replace(",", ".")) || 0) * l.qty, 0);
  const cartCount = cart.reduce((s, l) => s + l.qty, 0);

  const addToCart = (item, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.itemId === item.id);
      if (existing) return prev.map((l) => (l.itemId === item.id ? { ...l, qty: l.qty + qty } : l));
      return [...prev, {
        itemId: item.id, name: t(item, "name", item.name), price: item.price, qty,
        categoryName: categoryNameForItem(item.id),
      }];
    });
  };
  const changeQty = (itemId, delta) => {
    setCart((prev) => prev
      .map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + delta } : l))
      .filter((l) => l.qty > 0));
  };

  const doSubmitOrder = async () => {
    if (!table.trim() || cart.length === 0) return;
    setSending(true);
    await submitOrder(slug, {
      table: table.trim(),
      items: cart.map((l) => ({ ...l, prepStatus: "pendiente" })),
      note: orderNote.trim(),
      status: "pendiente",
      createdAt: Date.now(),
    });
    setSending(false);
    setOrderSent(true);
    setCart([]);
    setOrderNote("");
    setTimeout(() => setOrderSent(false), 3500);
  };

  const doJoinQueue = async () => {
    const id = await joinQueue(slug, { partySize: queueParty, joinedAt: Date.now(), status: "esperando" });
    setMyQueueEntry({ id });
  };
  const myPosition = myQueueEntry ? queueList.findIndex((e) => e.id === myQueueEntry.id) + 1 : 0;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: restaurant.name, url }); return; }
      await navigator.clipboard.writeText(url);
      setShareMsg("Enlace copiado");
      setTimeout(() => setShareMsg(""), 1800);
    } catch {}
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#0F0D0A", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 460, background: "#F4EFE6", minHeight: "100vh", position: "relative", boxShadow: "0 0 60px rgba(0,0,0,0.5)" }}>

        <div style={{
          position: "relative", height: 200,
          background: restaurant.cover
            ? `linear-gradient(180deg, rgba(23,19,15,0.15), rgba(23,19,15,0.85)), url(${restaurant.cover}) center/cover`
            : `linear-gradient(135deg, ${accent}, #17130F)`,
        }}>
          <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 8 }}>
            <IconBtn onClick={share} label="Compartir"><Share2 size={17} color="#17130F" /></IconBtn>
            <div style={{ position: "relative" }}>
              <IconBtn onClick={() => setLangOpen((v) => !v)} label="Idioma">
                <span style={{ fontSize: 16 }}>{LANGS.find((l) => l.code === lang)?.flag}</span>
              </IconBtn>
              {langOpen && (
                <div style={{ position: "absolute", top: 46, right: 0, background: "#fff", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", overflow: "hidden", zIndex: 20, minWidth: 150 }}>
                  {LANGS.map((l) => (
                    <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", background: l.code === lang ? "#F4EFE6" : "#fff", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: 13.5 }}>
                      <span style={{ fontSize: 16 }}>{l.flag}</span>{l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {shareMsg && (
            <div style={{ position: "absolute", top: 58, right: 14, background: "#17130F", color: "#F4EFE6", fontSize: 11.5, padding: "6px 12px", borderRadius: 8, zIndex: 25 }}>{shareMsg}</div>
          )}
          <div style={{ position: "absolute", bottom: 18, left: 20, right: 20, color: "#F4EFE6" }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 30, lineHeight: 1.05, textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>{restaurant.name}</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{restaurant.tagline}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 18, padding: "12px 20px", borderBottom: "1px solid #E4DBC8", fontSize: 12.5, color: "#5A5347", flexWrap: "wrap" }}>
          {restaurant.address && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><MapPin size={13} />{restaurant.address}</span>}
          {restaurant.phone && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Phone size={13} />{restaurant.phone}</span>}
        </div>

        {/* mesa + mi mesa + cola */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", borderBottom: "1px solid #E4DBC8", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#8A8172", fontWeight: 600 }}>Tu mesa</span>
          <input value={table} onChange={(e) => setTable(e.target.value)} placeholder="ej. 4"
            style={{ width: 56, padding: "6px 8px", borderRadius: 8, border: "1px solid #DCD0B4", background: "#fff", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, textAlign: "center" }} />
          <button onClick={() => setTableOpen(true)} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 999, border: "none", background: accent, color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
            <ClipboardList size={13} />Mi Mesa
          </button>
          <button onClick={() => setQueueOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 999, border: "1px solid #DCD0B4", background: "#fff", color: "#5A5347", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
            <Users size={13} />Lista de turno
          </button>
        </div>

        {/* category tabs — pill style */}
        <div style={{ display: "flex", gap: 8, padding: "18px 20px 6px", overflowX: "auto" }}>
          {restaurant.categories.map((c) => {
            const active = c.id === activeCat;
            return (
              <button key={c.id} onClick={() => setActiveCat(c.id)} style={{
                flexShrink: 0, padding: "10px 18px", borderRadius: 999, border: active ? "none" : "1.5px solid #DDD2B8",
                cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13,
                background: active ? accent : "transparent", color: active ? "#FBF7EE" : "#4A4436",
              }}>{c.name}</button>
            );
          })}
        </div>

        {/* item list — tarjetas elegantes */}
        <div style={{ padding: "14px 20px 100px", display: "flex", flexDirection: "column", gap: 14 }}>
          {cat?.items.map((item) => (
            <button key={item.id} onClick={() => setOpenItem(item)} style={{
              display: "flex", flexDirection: "column", width: "100%", textAlign: "left",
              background: "#FFFFFF", border: "1px solid #EAE1CB", borderRadius: 18,
              boxShadow: "0 1px 2px rgba(23,19,15,0.04), 0 8px 20px rgba(23,19,15,0.05)",
              overflow: "hidden", cursor: "pointer", padding: 0,
            }}>
              {item.photo && <img src={item.photo} alt="" style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />}
              <div style={{ padding: "16px 18px 18px" }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 18, color: "#17130F", lineHeight: 1.25, display: "block" }}>{t(item, "name", item.name)}</span>
                {t(item, "description", item.description) && <div style={{ fontSize: 13, color: "#8A8172", marginTop: 5, lineHeight: 1.45 }}>{t(item, "description", item.description)}</div>}
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15.5, color: accent, fontWeight: 500, marginTop: 10 }}>{item.price} €</div>
                {item.allergens?.length > 0 && (
                  <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                    {item.allergens.map((a) => {
                      const meta = ALLERGENS.find((x) => x.id === a);
                      const Icon = meta?.icon || Sparkles;
                      const c2 = meta?.color || accent;
                      return <span key={a} title={meta?.label} style={{ width: 24, height: 24, borderRadius: 999, background: `${c2}22`, display: "flex", alignItems: "center", justifyContent: "center", color: c2 }}><Icon size={13} /></span>;
                    })}
                  </div>
                )}
              </div>
            </button>
          ))}
          {!cat?.items.length && <div style={{ padding: "30px 0", textAlign: "center", color: "#A79C86", fontSize: 13.5 }}>Todavía no hay platos en esta categoría.</div>}
        </div>

        <div style={{ textAlign: "center", paddingBottom: 22, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: "#B9AF97", letterSpacing: "0.08em" }}>CARTA DIGITAL · CARTIA</div>

        {/* ficha de detalle del plato */}
        {openItem && (
          <div onClick={() => setOpenItem(null)} style={{ position: "fixed", inset: 0, background: "rgba(23,19,15,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 30 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: "#F4EFE6", borderRadius: "18px 18px 0 0", padding: 22, maxHeight: "82%", overflowY: "auto", position: "relative" }}>
              <div style={{ width: 40, height: 4, background: "#D8CEB8", borderRadius: 4, margin: "0 auto 16px" }} />
              <button onClick={() => setOpenItem(null)} style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", cursor: "pointer" }}><X size={20} color="#8B8378" /></button>
              {openItem.photo && <img src={openItem.photo} alt="" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 12, marginBottom: 16 }} />}
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 24, color: "#17130F", lineHeight: 1.15 }}>{t(openItem, "name", openItem.name)}</div>
              {t(openItem, "description", openItem.description) && <div style={{ fontSize: 14.5, color: "#5A5347", marginTop: 10, lineHeight: 1.55 }}>{t(openItem, "description", openItem.description)}</div>}
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, color: accent, marginTop: 18, fontWeight: 500 }}>{openItem.price} €</div>
              {openItem.allergens?.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                  {openItem.allergens.map((a) => {
                    const meta = ALLERGENS.find((x) => x.id === a);
                    const Icon = meta?.icon || Sparkles;
                    const c2 = meta?.color || accent;
                    return <span key={a} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: `${c2}1A`, fontSize: 11.5, color: "#5A5347" }}><Icon size={13} color={c2} />{meta?.label}</span>;
                  })}
                </div>
              )}
              <button onClick={() => { addToCart(openItem); setOpenItem(null); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", marginTop: 22, padding: "13px", borderRadius: 10, background: accent, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                <ShoppingBag size={16} />Añadir al pedido
              </button>
            </div>
          </div>
        )}

        {/* barra flotante del carrito */}
        {cart.length > 0 && !cartOpen && (
          <button onClick={() => setCartOpen(true)} style={{
            position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 12, width: "calc(100% - 40px)", maxWidth: 420,
            padding: "14px 18px", borderRadius: 14, background: "#17130F", border: "none",
            color: "#F4EFE6", cursor: "pointer", boxShadow: "0 10px 30px rgba(0,0,0,0.35)", zIndex: 25,
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600 }}><ShoppingBag size={16} />{cartCount} {cartCount === 1 ? "plato" : "platos"}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13.5 }}>{cartTotal.toFixed(2).replace(".", ",")} € · Ver pedido</span>
          </button>
        )}

        {/* modal del pedido */}
        {cartOpen && (
          <div onClick={() => setCartOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(23,19,15,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 30 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: "#F4EFE6", borderRadius: "18px 18px 0 0", padding: 22, maxHeight: "82%", overflowY: "auto", position: "relative" }}>
              <div style={{ width: 40, height: 4, background: "#D8CEB8", borderRadius: 4, margin: "0 auto 16px" }} />
              <button onClick={() => setCartOpen(false)} style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", cursor: "pointer" }}><X size={20} color="#8B8378" /></button>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 22, color: "#17130F", marginBottom: 16 }}>Tu pedido</div>
              {cart.length === 0 ? (
                <div style={{ color: "#A79C86", fontSize: 13.5, padding: "20px 0", textAlign: "center" }}>Todavía no has añadido ningún plato.</div>
              ) : cart.map((l) => (
                <div key={l.itemId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px dashed #DCD0B4" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 14.5, color: "#17130F" }}>{l.name}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, color: accent }}>{l.price} €</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 999, border: "1px solid #DCD0B4", padding: "4px 8px" }}>
                    <button onClick={() => changeQty(l.itemId, -1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><Minus size={14} color="#8B8378" /></button>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, minWidth: 14, textAlign: "center" }}>{l.qty}</span>
                    <button onClick={() => changeQty(l.itemId, 1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><Plus size={14} color="#8B8378" /></button>
                  </div>
                </div>
              ))}
              {cart.length > 0 && (
                <>
                  <input value={orderNote} onChange={(e) => setOrderNote(e.target.value)} placeholder="Notas para el camarero (opcional)" style={{ ...inputStyle, marginTop: 14, marginBottom: 6 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 2px", fontSize: 13, color: "#5A5347" }}>
                    <span>Total</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: "#17130F" }}>{cartTotal.toFixed(2).replace(".", ",")} €</span>
                  </div>
                  {!table.trim() && <div style={{ fontSize: 12, color: "#B0473F", marginBottom: 10 }}>Indica tu número de mesa arriba antes de enviar el pedido.</div>}
                  <button onClick={doSubmitOrder} disabled={!table.trim() || sending} style={{ width: "100%", padding: 13, borderRadius: 10, background: accent, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: !table.trim() || sending ? 0.6 : 1 }}>
                    {sending ? "Enviando…" : "Enviar pedido al camarero"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {orderSent && (
          <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 40px)", maxWidth: 420, background: "#17130F", color: "#F4EFE6", padding: "12px 16px", borderRadius: 12, fontSize: 13, textAlign: "center", zIndex: 40 }}>
            ✓ Pedido enviado — el camarero lo confirmará en breve
          </div>
        )}

        {/* modal "Mi Mesa" */}
        {tableOpen && (
          <div onClick={() => setTableOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(23,19,15,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 30 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: "#F4EFE6", borderRadius: "18px 18px 0 0", padding: 22, maxHeight: "82%", overflowY: "auto", position: "relative" }}>
              <div style={{ width: 40, height: 4, background: "#D8CEB8", borderRadius: 4, margin: "0 auto 16px" }} />
              <button onClick={() => setTableOpen(false)} style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", cursor: "pointer" }}><X size={20} color="#8B8378" /></button>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 22, color: "#17130F", marginBottom: 4 }}>Mi Mesa{table.trim() ? ` · ${table.trim()}` : ""}</div>
              {!table.trim() ? (
                <div style={{ fontSize: 13, color: "#8A8172", padding: "16px 0" }}>Indica tu número de mesa arriba para ver el estado de tu pedido.</div>
              ) : tableOrders.length === 0 ? (
                <div style={{ fontSize: 13, color: "#8A8172", padding: "16px 0" }}>Todavía no has hecho ningún pedido desde esta mesa.</div>
              ) : (
                <>
                  <div style={{ fontSize: 12, color: "#8A8172", marginBottom: 16 }}>Esto se actualiza solo, en tiempo real.</div>
                  {[...tableOrders].sort((a, b) => a.createdAt - b.createdAt).map((o) => (
                    <div key={o.id} style={{ marginBottom: 18 }}>
                      <div style={{ fontSize: 11, color: "#A79C86", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 8 }}>
                        PEDIDO · {new Date(o.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      {o.status === "pendiente" && (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 999, background: "#EDE6D3", color: "#8A8172", fontSize: 11.5, marginBottom: 10 }}>
                          <Clock size={11} />Esperando confirmación del camarero
                        </div>
                      )}
                      {o.items.map((l) => {
                        const status = o.status === "pendiente" ? "pendiente" : (l.prepStatus || "pendiente");
                        const meta = {
                          pendiente: { label: "En espera", color: "#A79C86", bg: "#EDE6D3" },
                          preparando: { label: "Preparando", color: "#B8791E", bg: "#F6E6C6" },
                          listo: { label: "Listo", color: "#3E7A4A", bg: "#DBEADE" },
                        }[status];
                        return (
                          <div key={l.itemId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#fff", border: "1px solid #E4DBC8", borderRadius: 10, marginBottom: 6 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#17130F" }}>{l.qty}× {l.name}</div>
                              {l.categoryName && <div style={{ fontSize: 11, color: "#A79C86" }}>{l.categoryName}</div>}
                            </div>
                            <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 999, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700 }}>
                              {status === "listo" ? <Check size={11} /> : <Clock size={11} />}{meta.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* modal de lista de turno */}
        {queueOpen && (
          <div onClick={() => setQueueOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(23,19,15,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 30 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: "#F4EFE6", borderRadius: "18px 18px 0 0", padding: 22, maxHeight: "82%", overflowY: "auto", position: "relative" }}>
              <div style={{ width: 40, height: 4, background: "#D8CEB8", borderRadius: 4, margin: "0 auto 16px" }} />
              <button onClick={() => setQueueOpen(false)} style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", cursor: "pointer" }}><X size={20} color="#8B8378" /></button>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 22, color: "#17130F", marginBottom: 6 }}>Lista de turno</div>
              {!myQueueEntry ? (
                <>
                  <div style={{ fontSize: 13, color: "#8A8172", marginBottom: 18 }}>Únete a la cola y te decimos cuántos grupos tienes por delante.</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                    <span style={{ fontSize: 13, color: "#5A5347" }}>Personas</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 999, border: "1px solid #DCD0B4", padding: "6px 12px" }}>
                      <button onClick={() => setQueueParty((n) => Math.max(1, n - 1))} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><Minus size={14} /></button>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", minWidth: 16, textAlign: "center" }}>{queueParty}</span>
                      <button onClick={() => setQueueParty((n) => n + 1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><Plus size={14} /></button>
                    </div>
                  </div>
                  <button onClick={doJoinQueue} style={{ width: "100%", padding: 13, borderRadius: 10, background: accent, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Unirme a la cola</button>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 46, color: accent, fontWeight: 500 }}>{myPosition > 0 ? myPosition : "…"}</div>
                  <div style={{ fontSize: 13, color: "#5A5347", marginBottom: 16 }}>{myPosition > 1 ? `Tienes ${myPosition - 1} grupo(s) por delante` : "¡Eres el siguiente!"}</div>
                  <div style={{ fontSize: 11.5, color: "#A79C86", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><RefreshCw size={11} />Se actualiza solo, en tiempo real</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
