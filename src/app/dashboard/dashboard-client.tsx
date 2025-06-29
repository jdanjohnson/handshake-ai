'use client';

import { useState, useEffect } from "react";
import type { Offer } from "@/lib/data";
import { getOffersByEmail } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock, Inbox } from "lucide-react";

function OfferList({ offers, title }: { offers: Offer[]; title: string }) {
    if (offers.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-foreground">No Offers Found</h3>
                <p className="mt-1 text-sm text-muted-foreground">You have no {title.toLowerCase()} offers.</p>
                 {title === "Sent" && (
                    <Button asChild className="mt-6">
                        <Link href="/offers/new">Create an Offer</Link>
                    </Button>
                 )}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
                <Card key={offer.id} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="truncate">{offer.title}</CardTitle>
                        <CardDescription>
                            With {offer.offerorEmail === document.querySelector<HTMLInputElement>('#email')?.value ? offer.offereeName : offer.offerorName}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="flex items-center gap-2 text-sm">
                            {offer.status === 'accepted' ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                                <Clock className="w-4 h-4 text-yellow-500" />
                            )}
                            <span className="capitalize">{offer.status}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Created on {new Date(offer.createdAt).toLocaleDateString()}
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="secondary" className="w-full">
                            <Link href={`/offers/${offer.id}`}>
                                View Details <ArrowUpRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

export function DashboardClient() {
    const [email, setEmail] = useState('');
    const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (loggedInEmail) {
            setIsLoading(true);
            getOffersByEmail(loggedInEmail).then((data) => {
                setOffers(data);
                setIsLoading(false);
            });
        }
    }, [loggedInEmail]);
    
    // This effect runs on the client after hydration to get email from localStorage if available
    useEffect(() => {
        const storedEmail = localStorage.getItem('handshake-legal-email');
        if(storedEmail) {
            setLoggedInEmail(storedEmail);
            setEmail(storedEmail);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            localStorage.setItem('handshake-legal-email', email);
            setLoggedInEmail(email);
        }
    };
    
    const handleLogout = () => {
        localStorage.removeItem('handshake-legal-email');
        setLoggedInEmail(null);
        setEmail('');
        setOffers([]);
    }

    if (!loggedInEmail) {
        return (
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Access Your Dashboard</CardTitle>
                        <CardDescription>
                            Enter your email to view your agreements. In a real app, this would send you a secure magic link.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">View My Agreements</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const sentOffers = offers.filter((o) => o.offerorEmail.toLowerCase() === loggedInEmail.toLowerCase());
    const receivedOffers = offers.filter((o) => o.offereeEmail.toLowerCase() === loggedInEmail.toLowerCase());
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <p>Viewing agreements for: <span className="font-semibold">{loggedInEmail}</span></p>
                <Button variant="outline" onClick={handleLogout}>Change Email</Button>
            </div>
            {isLoading ? (
                <p>Loading agreements...</p>
            ) : (
                <Tabs defaultValue="received">
                    <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                        <TabsTrigger value="received">Received ({receivedOffers.length})</TabsTrigger>
                        <TabsTrigger value="sent">Sent ({sentOffers.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="received" className="mt-6">
                        <OfferList offers={receivedOffers} title="Received" />
                    </TabsContent>
                    <TabsContent value="sent" className="mt-6">
                        <OfferList offers={sentOffers} title="Sent" />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
