import { DashboardClient } from "./dashboard-client";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-primary/10 p-3 rounded-full">
                    <LayoutDashboard className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter font-headline">My Agreements</h1>
                    <p className="text-muted-foreground">
                        Access all your sent and received offers.
                    </p>
                </div>
            </div>
            <DashboardClient />
        </div>
    );
}
