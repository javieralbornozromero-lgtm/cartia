import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase.js";
import Hub from "./pages/Hub.jsx";
import Login from "./pages/Login.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import PublicMenu from "./pages/PublicMenu.jsx";
import PricingPage from "./pages/PricingPage.jsx";

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = comprobando sesión

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  return (
    <Routes>
      {/* páginas públicas — lo que abre el QR, sin login */}
      <Route path="/:slug" element={<PublicMenu />} />
      <Route path="/planes" element={<PricingPage />} />

      {/* panel privado del dueño del restaurante */}
      <Route path="/login" element={user ? <Navigate to="/panel" /> : <Login />} />
      <Route path="/panel" element={user === undefined ? <Loading /> : user ? <Hub user={user} /> : <Navigate to="/login" />} />
      <Route path="/panel/:slug" element={user === undefined ? <Loading /> : user ? <AdminPanel user={user} /> : <Navigate to="/login" />} />

      <Route path="/" element={user === undefined ? <Loading /> : user ? <Navigate to="/panel" /> : <Navigate to="/login" />} />
    </Routes>
  );
}

function Loading() {
  return <div style={{ padding: 60, textAlign: "center", color: "#8B8378", fontFamily: "Inter, sans-serif" }}>Cargando…</div>;
}
