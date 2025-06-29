'use client';

import { useState, useTransition } from 'react';
import type { Offer, SpecificTerm } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { acceptOffer } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { HandshakeIcon } from '@/components/icons/handshake-icon';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Clock, Loader2, Mail, User } from 'lucide-react';

// AgreementPreview Component
function AgreementPreview({ data }: { data: Offer }) {
    const agreementDate = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
    const offereeTitle = (data.offerees?.length || 0) > 1 ? "PARTIES (B)" : "PARTY (B)";

    return (
        <Card className="font-sans">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{data.title}</CardTitle>
                <CardDescription>Agreement Date: {agreementDate}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
                <section>
                    <h3 className="font-bold text-base mb-2 flex justify-between items-center">
                        1. Parties Involved
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-muted/30">
                        <div>
                            <h4 className="font-semibold text-muted-foreground">PARTY (A) - OFFEROR</h4>
                            <p className="flex items-center gap-2 mt-1"><User className="w-4 h-4" /> {data.offerorName}</p>
                            <p className="flex items-center gap-2 mt-1"><Mail className="w-4 h-4" /> {data.offerorEmail}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-muted-foreground">{offereeTitle} - OFFEREE(S)</h4>
                            {data.offerees?.map((offeree, index) => (
                                <div key={index} className={data.offerees && data.offerees.length > 1 ? "mt-2" : "mt-1"}>
                                    <p className="flex items-center gap-2"><User className="w-4 h-4" /> {offeree.name}</p>
                                    <p className="flex items-center gap-2 mt-1"><Mail className="w-4 h-4" /> {offeree.email}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
                <section>
                     <h3 className="font-bold text-base mb-2">2. Purpose of Agreement</h3>
                     <p className="whitespace-pre-wrap">{data.terms}</p>
                </section>
                
                <Separator />
                
                {(data.specificTerms && data.specificTerms.length > 0) && (
                    <section>
                        <h3 className="font-bold text-base mb-2">3. Agreed Terms and Conditions</h3>
                        <ul className="space-y-3 pl-5">
                            {data.specificTerms.map((term, index) => (
                                <li key={index}>
                                    <span className="font-semibold">{term.title}:</span>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{term.description}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {(data.paymentAmount || data.paymentDueDate || data.paymentMethod) && (
                    <section>
                        <h4 className="font-semibold mb-1">Payment Terms</h4>
                        <div className="p-3 border rounded-md bg-muted/30 text-xs space-y-1">
                           {data.paymentAmount && <p><strong>Amount:</strong> {data.paymentAmount}</p>}
                           {data.paymentDueDate && <p><strong>Due Date:</strong> {data.paymentDueDate}</p>}
                           {data.paymentMethod && <p><strong>Method:</strong> {data.paymentMethod}</p>}
                        </div>
                    </section>
                )}
                
                {data.duration && (
                    <section>
                         <h4 className="font-semibold mb-1">Duration/Completion</h4>
                         <p>{data.duration}</p>
                    </section>
                )}
                
                <Separator />
                
                <section className="space-y-4 text-xs text-muted-foreground">
                    <div>
                        <h3 className="font-bold text-sm text-foreground mb-1">4. Dispute Resolution</h3>
                        <p>In the event of a dispute arising out of or in connection with this Agreement, the Parties agree to first attempt to resolve the dispute through good faith negotiation.</p>
                    </div>
                     {data.location && (
                        <div>
                            <h3 className="font-bold text-sm text-foreground mb-1">5. Governing Law</h3>
                            <p>This Agreement shall be governed by and construed in accordance with the laws of {data.location}, without regard to its conflict of laws principles.</p>
                        </div>
                     )}
                     <div>
                         <h3 className="font-bold text-sm text-foreground mb-1">6. Entire Agreement</h3>
                         <p>This document constitutes the entire Agreement between the Parties regarding the subject matter herein and supersedes all prior discussions, negotiations, and agreements, whether oral or written.</p>
                     </div>
                </section>

                <Separator />

                <section>
                     <h3 className="font-bold text-base mb-2">7. Signatures</h3>
                     <p className="text-xs text-muted-foreground mb-4">By accepting this offer, the parties acknowledge that they have read, understood, and agree to the terms and conditions set forth in this Simple Agreement.</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                         <div>
                             <div className="mt-8 border-b pb-1">
                                <p className="font-semibold">{data.offerorName}</p>
                             </div>
                             <p className="text-xs text-muted-foreground">Party A Signature</p>
                         </div>
                         <div>
                            <div className="mt-8 border-b pb-1">
                                {data.status === 'accepted' ? (
                                    <p className="font-semibold">{data.offerees?.map(o => o.name).join(', ')}</p>
                                ) : (
                                    <p className="text-muted-foreground italic">Awaiting signature...</p>
                                )}
                             </div>
                             <p className="text-xs text-muted-foreground">Party B Signature</p>
                         </div>
                     </div>
                </section>
            </CardContent>
        </Card>
    );
}


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
