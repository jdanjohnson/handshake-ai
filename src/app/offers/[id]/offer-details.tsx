'use client';

import { useState, useTransition } from 'react';
import type { Offer } from '@/lib/data';
import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { acceptOffer } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { HandshakeIcon } from '@/components/icons/handshake-icon';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { AgreementPreview } from '@/components/common/agreement-preview';


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

  return (
    <div>
        <div className="mb-4">
             <div className="flex items-center gap-2 pt-2">
                {isAccepted ? <CheckCircle2 className="text-green-500" /> : <Clock className="text-yellow-500" />}
                Status: <span className={isAccepted ? "font-semibold text-green-600 dark:text-green-400" : "font-semibold text-yellow-600 dark:text-yellow-400"}>{offer.status}</span>
            </div>
        </div>
      <AgreementPreview data={offer} />
      <CardFooter className="bg-muted/50 p-6 mt-4 rounded-b-lg">
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
    </div>
  );
}
