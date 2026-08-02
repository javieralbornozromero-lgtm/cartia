import { collection, addDoc, onSnapshot, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase.js";

const col = (slug) => collection(db, "restaurants", slug, "queue");

export async function joinQueue(slug, entry) {
  const ref = await addDoc(col(slug), entry);
  return ref.id;
}

export function listenQueue(slug, callback) {
  const q = query(col(slug), orderBy("joinedAt", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((e) => e.status === "esperando"));
  });
}

export async function updateQueueEntry(slug, entryId, patch) {
  await updateDoc(doc(db, "restaurants", slug, "queue", entryId), patch);
}
