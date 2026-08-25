import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizeUrl(raw: unknown): string | null | undefined {
  if (raw === null) return null;
  if (typeof raw !== "string") return undefined;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  // On tolère une saisie sans protocole (ex. "www.exemple.fr/offre")
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { id } = await params;
  const body = await req.json();

  if (!("url" in body)) {
    return NextResponse.json({ error: "Aucun champ modifiable fourni" }, { status: 400 });
  }

  const url = normalizeUrl(body.url);
  if (url === undefined) {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }

  const offer = await prisma.jobOffer.findFirst({ where: { id, userId } });
  if (!offer) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const updated = await prisma.jobOffer.update({
    where: { id },
    data: { url },
  });

  return NextResponse.json({
    ...updated,
    customValues: JSON.parse(updated.customValues ?? "{}"),
  });
}
