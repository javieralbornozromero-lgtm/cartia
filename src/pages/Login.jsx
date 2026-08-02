import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase.js";
import { inputStyle } from "../components/ui.jsx";

export default function Login() {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate("/panel");
    } catch (err) {
      setError(traducirError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#17130F", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 320 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 28, color: "#F4EFE6" }}>Cartia</div>
          <div style={{ fontSize: 12.5, color: "#A79C86", marginTop: 4 }}>
            {mode === "signin" ? "Entra en tu panel" : "Crea tu cuenta de negocio"}
          </div>
        </div>
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ ...inputStyle, background: "#231D16", border: "1px solid #4A4030", color: "#F4EFE6", marginBottom: 10 }} />
        <input type="password" required placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ ...inputStyle, background: "#231D16", border: "1px solid #4A4030", color: "#F4EFE6", marginBottom: 14 }} />
        {error && <div style={{ color: "#D67A72", fontSize: 12, marginBottom: 10 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{
          width: "100%", padding: 12, borderRadius: 8, background: "#C9A24B", border: "none",
          color: "#17130F", fontWeight: 700, fontSize: 13.5, cursor: "pointer", marginBottom: 12,
        }}>{loading ? "Un momento…" : mode === "signin" ? "Entrar" : "Crear cuenta"}</button>
        <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          style={{ width: "100%", background: "none", border: "none", color: "#7A7261", fontSize: 12.5, cursor: "pointer" }}>
          {mode === "signin" ? "¿Primera vez? Crea tu cuenta" : "¿Ya tienes cuenta? Entra"}
        </button>
      </form>
    </div>
  );
}

function traducirError(code) {
  const map = {
    "auth/invalid-email": "Email no válido.",
    "auth/user-not-found": "No existe ninguna cuenta con ese email.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-credential": "Email o contraseña incorrectos.",
    "auth/email-already-in-use": "Ya existe una cuenta con ese email.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  };
  return map[code] || "Ha ocurrido un error. Inténtalo de nuevo.";
}
