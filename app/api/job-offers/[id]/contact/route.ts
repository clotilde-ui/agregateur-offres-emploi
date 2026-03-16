import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { id } = await params;
  const { toContact } = await req.json();

  const offer = await prisma.jobOffer.findFirst({
    where: { id, userId },
  });

  if (!offer) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const updated = await prisma.jobOffer.update({
    where: { id },
    data: {
      toContact,
      contactedAt: toContact ? new Date() : null,
    },
  });

  // Si coché → envoyer vers LGM
  if (toContact && !offer.lgmSent) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user?.lgmApiKey && user?.lgmCampaignId) {
      try {
        const res = await fetch("https://api.lagrowthmachine.com/v1/leads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.lgmApiKey}`,
          },
          body: JSON.stringify({
            campaign_id: user.lgmCampaignId,
            leads: [
              {
                first_name: offer.leadFirstName,
                last_name: offer.leadLastName,
                email: offer.leadEmail,
                phone: offer.leadPhone,
                linkedin_url: offer.leadLinkedin,
                job_title: offer.leadJobTitle,
                company_name: offer.company,
                company_website: offer.website,
              },
            ],
          }),
        });

        if (res.ok) {
          await prisma.jobOffer.update({
            where: { id },
            data: { lgmSent: true },
          });
        }
      } catch (err) {
        console.error("Erreur LGM:", err);
        // On ne bloque pas la mise à jour même si LGM échoue
      }
    }
  }

  return NextResponse.json(updated);
}
