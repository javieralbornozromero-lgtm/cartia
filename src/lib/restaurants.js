import {
  doc, getDoc, setDoc, collection, query, where, getDocs,
} from "firebase/firestore";
import { db } from "../firebase.js";

const col = (slug) => doc(db, "restaurants", slug);

export async function slugExists(slug) {
  const snap = await getDoc(col(slug));
  return snap.exists();
}

export async function getRestaurant(slug) {
  const snap = await getDoc(col(slug));
  return snap.exists() ? snap.data() : null;
}

export async function saveRestaurant(data) {
  await setDoc(col(data.slug), data, { merge: false });
}

export async function listMyRestaurants(ownerUid) {
  const q = query(collection(db, "restaurants"), where("ownerUid", "==", ownerUid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}
