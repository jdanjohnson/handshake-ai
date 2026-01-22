'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileArchive, Users, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/vault", label: "Vault", icon: FileArchive },
  { href: "/network", label: "Network", icon: Users },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-background/90 dark:bg-background-dark/90 backdrop-blur-lg border-t border-border z-50">
      <nav className="h-20 max-w-lg mx-auto">
        <ul className="flex justify-around items-center h-full">
          {navItems.map((item) => {
            const isActive = (item.href === "/" && pathname === "/") || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.label}>
                <Link href={item.href} className="flex flex-col items-center justify-center gap-1 text-muted-foreground w-16">
                  <item.icon className={cn("w-6 h-6", isActive ? "text-primary" : "")} />
                  <span className={cn("text-xs font-medium", isActive ? "text-primary" : "")}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </footer>
  );
}
