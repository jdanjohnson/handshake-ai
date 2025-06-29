import { DashboardClient } from "./dashboard-client";
import { Button } from "@/components/ui/button";
import { FilePlus2, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <LayoutDashboard className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tighter font-headline">My Handshakes</h1>
                        <p className="text-muted-foreground">
                            Access all your sent and received offers.
                        </p>
                    </div>
                </div>
                <div className="hidden md:block">
                    <Button asChild size="lg">
                        <Link href="/offers/new">
                            <FilePlus2 className="mr-2" /> New Handshake
                        </Link>
                    </Button>
                </div>
            </div>
            <DashboardClient />
        </div>
    );
}
