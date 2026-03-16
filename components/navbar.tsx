"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/cn";

interface NavbarProps {
  user: { name?: string | null; email?: string | null; role: string };
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Offres & Leads" },
    { href: "/settings", label: "Paramètres" },
    ...(user.role === "ADMIN" ? [{ href: "/admin/users", label: "Utilisateurs" }] : []),
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <nav className="flex items-center gap-6">
        <span className="font-semibold text-gray-900 mr-4">Offres Emploi</span>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm font-medium transition-colors",
              pathname === link.href
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{user.name ?? user.email}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
