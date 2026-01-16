import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { firestore } from "@/lib/firebase";
import { BabyPageDocument, SlugDocument } from "@/models/babyPage";

const RESERVED_SLUGS = [
  "login",
  "signup",
  "profile",
  "settings",
  "admin",
  "api",
  "baby",
  "app",
  "help",
  "about",
  "terms",
  "privacy",
];

export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function validateSlug(slug: string): { valid: boolean; error?: string } {
  const normalized = normalizeSlug(slug);

  if (normalized.length < 3) {
    return { valid: false, error: "URL must be at least 3 characters" };
  }

  if (normalized.length > 30) {
    return { valid: false, error: "URL must be 30 characters or less" };
  }

  if (RESERVED_SLUGS.includes(normalized)) {
    return { valid: false, error: "This URL is reserved" };
  }

  return { valid: true };
}

export async function checkSlugAvailability(slug: string): Promise<boolean> {
  if (!firestore) return false;

  const normalized = normalizeSlug(slug);
  const validation = validateSlug(normalized);

  if (!validation.valid) return false;

  const slugRef = doc(firestore, "slugs", normalized);
  const snapshot = await getDoc(slugRef);
  return !snapshot.exists();
}

export async function reserveSlug(
  slug: string,
  babyPageId: string,
  ownerId: string
): Promise<void> {
  if (!firestore) throw new Error("Firestore not initialized");

  const normalized = normalizeSlug(slug);
  const slugRef = doc(firestore, "slugs", normalized);

  const slugData: SlugDocument = {
    babyPageId,
    ownerId,
  };

  await setDoc(slugRef, slugData);
}

export async function releaseSlug(slug: string): Promise<void> {
  if (!firestore) return;

  const normalized = normalizeSlug(slug);
  const slugRef = doc(firestore, "slugs", normalized);
  await deleteDoc(slugRef);
}

export async function getBabyPageBySlug(
  slug: string
): Promise<BabyPageDocument | null> {
  if (!firestore) return null;

  const normalized = normalizeSlug(slug);
  const slugRef = doc(firestore, "slugs", normalized);
  const slugSnapshot = await getDoc(slugRef);

  if (!slugSnapshot.exists()) return null;

  const { babyPageId } = slugSnapshot.data() as SlugDocument;
  const pageRef = doc(firestore, "babyPages", babyPageId);
  const pageSnapshot = await getDoc(pageRef);

  if (!pageSnapshot.exists()) return null;

  return { id: pageSnapshot.id, ...pageSnapshot.data() } as BabyPageDocument;
}

export function getBabyPageUrl(slug: string): string {
  return `https://yougottaseethebaby.com/${slug}`;
}
