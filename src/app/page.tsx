'use client';

import Link from 'next/link';
import { ArrowRight, Mail, Handshake } from 'lucide-react';
import type { Offer } from '@/lib/data';
import { mockOffers } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import BottomNav from '@/components/common/bottom-nav';

const DUMMY_USER_EMAIL = 'iamjadan@gmail.com';

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('');
}


function IncomingRequest({ offer }: { offer: Offer }) {
    return (
        <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">{getInitials(offer.offerorName)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-bold">{offer.offerorName}</p>
                    <p className="text-xs text-muted-foreground">Wants to make a deal.</p>
                </div>
            </div>
            <Button asChild variant="secondary" className="rounded-full">
                <Link href={`/offers/${offer.id}`}>
                    Review <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    );
}


export default function Home() {
    // In a real app, this would be determined by user authentication
    const currentUserEmail = DUMMY_USER_EMAIL;

    const incomingRequests = mockOffers.filter(offer =>
        offer.status === 'pending' && offer.offerees.some(offeree => offeree.email === currentUserEmail)
    );

    return (
        <div className="flex flex-col h-full">
            <header className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Welcome Back</p>
                        <h1 className="text-2xl font-bold">Handshake</h1>
                    </div>
                    <Avatar>
                        <AvatarFallback>J</AvatarFallback>
                    </Avatar>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 pt-2">
                <Card className="bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20">
                    <CardContent className="p-6 flex flex-col items-start gap-4">
                        <div className="bg-primary-foreground/20 p-3 rounded-full">
                           <Handshake className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <h2 className="text-xl font-bold">Create a New Handshake</h2>
                        <p className="text-primary-foreground/80">
                            Formalize your simple agreements in seconds with a secure, digital handshake.
                        </p>
                        <Button asChild variant="secondary" className="rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 mt-2">
                            <Link href="/offers/new">
                                Start a New Handshake <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {incomingRequests.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <Mail className="text-accent" />
                            Incoming Requests
                        </h2>
                        <div className="space-y-3">
                            {incomingRequests.map(offer => (
                                <IncomingRequest key={offer.id} offer={offer} />
                            ))}
                        </div>
                    </div>
                )}
            </main>
            <BottomNav />
        </div>
    );
}
