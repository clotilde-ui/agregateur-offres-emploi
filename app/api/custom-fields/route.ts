import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const fields = await prisma.customFieldDef.findMany({
    where: { userId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(fields);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { label, type } = await req.json();

  if (!label) return NextResponse.json({ error: "Label requis" }, { status: 400 });

  const name = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_");

  const count = await prisma.customFieldDef.count({ where: { userId } });

  const field = await prisma.customFieldDef.create({
    data: { userId, name, label, type: type ?? "TEXT", order: count },
  });

  return NextResponse.json(field, { status: 201 });
}
