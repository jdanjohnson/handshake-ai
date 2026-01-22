import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import BottomNav from "@/components/common/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";

export default function ProfilePage() {
    return (
        <div className="flex flex-col h-full bg-background">
            <header className="p-4">
                <h1 className="text-2xl font-bold">Profile</h1>
            </header>
            <main className="flex-1 overflow-y-auto px-4 pt-2 pb-24">
                <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                        <AvatarFallback className="text-4xl bg-primary text-primary-foreground">JJ</AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold">Ja'dan Johnson</h2>
                    <p className="text-muted-foreground">jadan.johnson@example.com</p>
                </div>
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                        <Button variant="destructive" className="w-full justify-start">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log Out
                        </Button>
                    </CardContent>
                </Card>
            </main>
            <BottomNav />
        </div>
    );
}
