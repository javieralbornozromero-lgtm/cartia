import {
  collection, addDoc, onSnapshot, doc, updateDoc, query, orderBy, where,
} from "firebase/firestore";
import { db } from "../firebase.js";

const col = (slug) => collection(db, "restaurants", slug, "orders");

export async function submitOrder(slug, order) {
  await addDoc(col(slug), order);
}

export function listenOrders(slug, callback) {
  const q = query(col(slug), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function listenTableOrders(slug, table, callback) {
  const q = query(col(slug), where("table", "==", table));
  return onSnapshot(q, (snap) => {
    callback(snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((o) => o.status !== "cancelado"));
  });
}

export async function updateOrder(slug, orderId, patch) {
  await updateDoc(doc(db, "restaurants", slug, "orders", orderId), patch);
}
