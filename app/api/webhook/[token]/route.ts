import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { webhookToken: token },
  });

  if (!user) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  // Mantiks peut envoyer un tableau ou un objet unique
  const offers = Array.isArray(body) ? body : [body];

  const created = await Promise.all(
    offers.map(async (offer: Record<string, unknown>) => {
      return prisma.jobOffer.create({
        data: {
          userId: user.id,
          title: String(offer.job_title ?? offer.title ?? "Sans titre"),
          description: offer.description ? String(offer.description) : null,
          url: offer.job_url ?? offer.url ? String(offer.job_url ?? offer.url) : null,
          company: String(offer.company ?? offer.company_name ?? "Inconnu"),
          linkedinPage: offer.company_linkedin ? String(offer.company_linkedin) : null,
          website: offer.company_website ? String(offer.company_website) : null,
          phone: offer.company_phone ? String(offer.company_phone) : null,
          headquarters: offer.company_location ?? offer.headquarters ? String(offer.company_location ?? offer.headquarters) : null,
          offerLocation: offer.location ?? offer.job_location ? String(offer.location ?? offer.job_location) : null,
          source: offer.source ? String(offer.source) : null,
          publishedAt: offer.published_at ?? offer.created_at
            ? new Date(String(offer.published_at ?? offer.created_at))
            : null,
          leadCivility: offer.lead_civility ?? offer.civility ? String(offer.lead_civility ?? offer.civility) : null,
          leadFirstName: offer.lead_first_name ?? offer.first_name ? String(offer.lead_first_name ?? offer.first_name) : null,
          leadLastName: offer.lead_last_name ?? offer.last_name ? String(offer.lead_last_name ?? offer.last_name) : null,
          leadEmail: offer.lead_email ?? offer.email ? String(offer.lead_email ?? offer.email) : null,
          leadJobTitle: offer.lead_job_title ?? offer.lead_position ? String(offer.lead_job_title ?? offer.lead_position) : null,
          leadLinkedin: offer.lead_linkedin ? String(offer.lead_linkedin) : null,
          leadPhone: offer.lead_phone ? String(offer.lead_phone) : null,
        },
      });
    })
  );

  return NextResponse.json({ received: created.length }, { status: 201 });
}

// Endpoint GET pour vérifier que le webhook est actif
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const user = await prisma.user.findUnique({
    where: { webhookToken: token },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  return NextResponse.json({ status: "ok" });
}
