import React from "react";

export function IconBtn({ onClick, children, label, style }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 40, height: 40, borderRadius: 999, border: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(255,255,255,0.9)", cursor: "pointer", ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{
        display: "block", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
        letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B8378", marginBottom: 6,
      }}>{label}</span>
      {children}
    </label>
  );
}

export const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #DCD5C7",
  background: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 14.5, color: "#17130F",
  outline: "none", boxSizing: "border-box",
};
