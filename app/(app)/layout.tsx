import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/navbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={session.user as { name?: string | null; email?: string | null; role: string }} />
      <main className="flex-1 p-6 max-w-full overflow-x-auto">{children}</main>
    </div>
  );
}
