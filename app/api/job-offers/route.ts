import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const search = searchParams.get("search") ?? "";

  const where = {
    userId,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { company: { contains: search, mode: "insensitive" as const } },
            { leadFirstName: { contains: search, mode: "insensitive" as const } },
            { leadLastName: { contains: search, mode: "insensitive" as const } },
            { leadEmail: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.jobOffer.findMany({
      where,
      orderBy: { receivedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.jobOffer.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}
