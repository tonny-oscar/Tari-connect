import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase/client"; // your firebase client init

const connectWhatsAppFn = httpsCallable(functions, "connectWhatsApp");
const disconnectWhatsAppFn = httpsCallable(functions, "disconnectWhatsApp");
const connectMetaFn = httpsCallable(functions, "connectMeta");
const disconnectMetaFn = httpsCallable(functions, "disconnectMeta");

export async function connectWhatsApp() {
  return await connectWhatsAppFn();
}

export async function disconnectWhatsApp() {
  return await disconnectWhatsAppFn();
}

export async function connectMeta() {
  return await connectMetaFn();
}

export async function disconnectMeta() {
  return await disconnectMetaFn();
}

export async function getUserSettings() {
  // here you could fetch Firestore document of the user integrations
  return { whatsapp: { connected: false }, meta: { connected: false } };
}
