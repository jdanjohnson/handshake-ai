import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FileSignature, Home, LayoutDashboard, Menu, FilePlus2 } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/offers/new", label: "New Offer", icon: FilePlus2 },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <FileSignature className="h-6 w-6 text-primary" />
            <span className="font-headline">Handshake Legal</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="p-4">
                <Link href="/" className="flex items-center gap-2 font-bold mb-8">
                   <FileSignature className="h-6 w-6 text-primary" />
                   <span className="font-headline">Handshake Legal</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-2 text-lg font-medium p-2 rounded-md hover:bg-muted"
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
