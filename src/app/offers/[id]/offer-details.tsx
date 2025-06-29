'use client';

import { useState, useTransition } from 'react';
import type { Offer } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { acceptOffer } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { HandshakeIcon } from '@/components/icons/handshake-icon';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Clock, Loader2, Mail, User } from 'lucide-react';

export function OfferDetails({ offer: initialOffer }: { offer: Offer }) {
  const [offer, setOffer] = useState(initialOffer);
  const [isShaking, setIsShaking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleHandshake = () => {
    setIsShaking(true);
    setTimeout(() => {
        startTransition(async () => {
            const result = await acceptOffer(offer.id, offer.offerees[0]?.email || '');
            if (result.success) {
                toast({
                    title: 'Agreement Sealed!',
                    description: 'The offer has been accepted.',
                    variant: 'default',
                });
                // Optimistically update the UI
                const updatedOffer = await import('@/lib/data').then(mod => mod.getOfferById(offer.id));
                if(updatedOffer) setOffer(updatedOffer);
            } else {
                toast({
                    title: 'Error',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        });
        setIsShaking(false);
    }, 1500); // Animation duration
  };

  const isAccepted = offer.status === 'accepted';
  const acceptedDate = offer.acceptedAt ? new Date(offer.acceptedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const offereeTitle = offer.offerees.length > 1 ? "OFFEREES (TO)" : "OFFEREE (TO)";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 p-6">
        <CardTitle className="font-headline text-3xl">{offer.title}</CardTitle>
        <CardDescription className="flex items-center gap-2 pt-2">
            {isAccepted ? <CheckCircle2 className="text-green-500" /> : <Clock className="text-yellow-500" />}
            Status: <span className={isAccepted ? "font-semibold text-green-600 dark:text-green-400" : "font-semibold text-yellow-600 dark:text-yellow-400"}>{offer.status}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
                <h3 className="font-semibold text-muted-foreground">OFFEROR (FROM)</h3>
                <p className="flex items-center gap-2"><User className="w-4 h-4" /> {offer.offerorName}</p>
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {offer.offerorEmail}</p>
            </div>
             <div className="space-y-4">
                <h3 className="font-semibold text-muted-foreground">{offereeTitle}</h3>
                {offer.offerees.map((offeree, index) => (
                    <div key={index} className="space-y-2">
                        <p className="flex items-center gap-2"><User className="w-4 h-4" /> {offeree.name}</p>
                        <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {offeree.email}</p>
                    </div>
                ))}
            </div>
        </div>
        <Separator />
        <div>
             <h3 className="font-semibold text-muted-foreground mb-2">AGREEMENT TERMS</h3>
             <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-md bg-background">
                <p style={{ whiteSpace: 'pre-wrap' }}>{offer.terms}</p>
             </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-6">
        {isAccepted ? (
            <div className="w-full text-center text-green-600 dark:text-green-400 flex items-center justify-center gap-2 p-4 rounded-md bg-green-500/10 border border-green-500/20">
                <CheckCircle2 />
                <div>
                    <p className="font-semibold">Agreement Sealed on {acceptedDate}</p>
                    <p className="text-sm">A legally enforceable agreement has been generated.</p>
                </div>
            </div>
        ) : (
             <Button 
                onClick={handleHandshake} 
                disabled={isPending || isShaking}
                size="lg"
                className={`w-full transition-all duration-300 ${isShaking ? 'animate-shake bg-accent' : ''}`}
            >
                {isPending || isShaking ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                   <HandshakeIcon className="mr-2 h-5 w-5" />
                )}
                {isShaking ? 'Sealing the deal...' : 'Perform Digital Handshake & Accept'}
            </Button>
        )}
      </CardFooter>
      <style jsx>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-shake {
          animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
          transform: translate3d(0, 0, 0);
        }
      `}</style>
    </Card>
  );
}
