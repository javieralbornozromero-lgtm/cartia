import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Tag } from "lucide-react";
import { PLANS, SETUP_FEE } from "../lib/constants.js";

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#17130F", padding: "32px 18px 60px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#A79C86", fontSize: 12.5, cursor: "pointer", marginBottom: 26 }}>
          <ArrowLeft size={15} />Volver
        </button>

        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, border: "1px solid #4A4030", color: "#C9A24B", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.06em", marginBottom: 18 }}>
            <Tag size={12} />CARTIA PARA NEGOCIOS
          </div>
        </div>
        <div style={{ textAlign: "center", fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 36, color: "#F4EFE6", lineHeight: 1.1, marginBottom: 10 }}>
          Una carta digital que se paga sola<br />con lo que ahorras en imprenta
        </div>
        <div style={{ textAlign: "center", color: "#A79C86", fontSize: 14, maxWidth: 480, margin: "0 auto 30px" }}>
          Alta con QR incluido, tú editas la carta cuando quieras y nosotros nos encargamos de que nunca deje de funcionar.
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 34 }}>
          <div style={{ display: "flex", background: "#231D16", borderRadius: 999, padding: 4, border: "1px solid #332B1F" }}>
            {["Mensual", "Anual · 2 meses gratis"].map((label, i) => (
              <button key={label} onClick={() => setAnnual(i === 1)} style={{
                padding: "8px 16px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600,
                background: annual === (i === 1) ? "#C9A24B" : "transparent", color: annual === (i === 1) ? "#17130F" : "#A79C86",
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16, marginBottom: 34 }}>
          {PLANS.map((plan) => {
            const price = annual ? Math.round((plan.price * 10) / 12) : plan.price;
            return (
              <div key={plan.id} style={{
                position: "relative", background: plan.highlight ? "#231D16" : "#1C1712",
                border: plan.highlight ? "1.5px solid #C9A24B" : "1px solid #332B1F", borderRadius: 16,
                padding: "26px 22px", display: "flex", flexDirection: "column",
              }}>
                {plan.highlight && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#C9A24B", color: "#17130F", fontSize: 10.5, fontWeight: 700, padding: "4px 12px", borderRadius: 999, letterSpacing: "0.04em" }}>MÁS ELEGIDO</div>
                )}
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 20, color: "#F4EFE6" }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: "#7A7261", marginBottom: 16 }}>{plan.tagline}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 18 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 34, color: "#F4EFE6", fontWeight: 500 }}>{price}€</span>
                  <span style={{ fontSize: 12.5, color: "#7A7261" }}>/mes{annual ? " · facturado al año" : ""}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22, flex: 1 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <Check size={14} color="#C9A24B" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 12.5, color: "#C9BFA9", lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center", flexWrap: "wrap", padding: "16px 20px", background: "#231D16", borderRadius: 12, border: "1px solid #332B1F", maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: 12.5, color: "#A79C86" }}>
            Alta y puesta en marcha (subimos tu carta, fotos y QR listos para imprimir): {" "}
            <span style={{ color: "#F4EFE6", fontWeight: 600 }}>pago único de {SETUP_FEE}€</span>
          </span>
        </div>

        <div style={{ textAlign: "center", marginTop: 30, fontSize: 11, color: "#4A4030", fontFamily: "'IBM Plex Mono', monospace" }}>
          SIN PERMANENCIA · CANCELA CUANDO QUIERAS
        </div>
      </div>
    </div>
  );
}
