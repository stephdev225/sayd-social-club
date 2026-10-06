import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";

export async function POST(request: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/admin/connexion", request.url), { status: 303 });
}
