import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { getStore, usingMemoryStore } from "@/lib/data";
import { MediaError, saveImage } from "@/lib/data/media";

/** Admin image upload (event visuals and posters). */
export async function POST(request: Request) {
  if (!(await requireRole("admin"))) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  if (usingMemoryStore() && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Base de données non branchée : impossible d'enregistrer l'image." }, { status: 503 });
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  try {
    return NextResponse.json(await saveImage(getStore(), file));
  } catch (err) {
    if (err instanceof MediaError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("[media] upload failed", err);
    return NextResponse.json({ error: "L'image n'a pas pu être traitée." }, { status: 500 });
  }
}
