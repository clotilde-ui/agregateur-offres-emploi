import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const field = await prisma.customFieldDef.findFirst({ where: { id, userId } });
  if (!field) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  await prisma.customFieldDef.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
