'use client';

import { useState, useTransition } from 'react';
import type { Offer } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { acceptOffer } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Handshake, CheckCircle2, Clock, Edit, FileText, Gavel, Group, Link as LinkIcon, Loader2, Send, Share, Signature } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import { notFound } from 'next/navigation';

const DUMMY_USER_EMAIL = 'iamjadan@gmail.com';

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('');
}


function ReviewAndSign({ offer, onAccept }: { offer: Offer, onAccept: () => void }) {
    const [isShaking, setIsShaking] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleHandshake = () => {
        setIsShaking(true);
        setTimeout(() => {
            startTransition(async () => {
                onAccept();
            });
            setIsShaking(false);
        }, 1500); // Animation duration
    };

    const offeror = { name: offer.offerorName, email: offer.offerorEmail, role: 'Provider' };
    const offeree = offer.offerees[0] || { name: 'N/A', email: 'N/A' };


    return (
        <div className="flex flex-col h-full">
            <main className="flex-1 w-full max-w-md mx-auto pb-32">
                <div className="px-6 my-6">
                    <h1 className="text-foreground dark:text-white text-3xl font-extrabold leading-tight tracking-tight">
                        The Handshake Deal
                    </h1>
                    <p className="text-foreground/70 dark:text-gray-400 text-base font-medium mt-2 leading-relaxed">
                        Review your agreement details before making it legally binding.
                    </p>
                </div>

                <div className="px-4">
                    <div className="shadow-lg bg-card dark:bg-card-dark border border-border dark:border-gray-800 rounded-xl p-6 relative overflow-hidden">
                        
                        <div className="mb-8 relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Group className="text-success text-sm" />
                                <h4 className="text-foreground/50 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">Contracting Parties</h4>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className='h-10 w-10'>
                                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">{getInitials(offeror.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-foreground dark:text-white font-bold leading-none">{offeror.name}</p>
                                        <p className="text-foreground/50 dark:text-gray-500 text-xs mt-1">Provider</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center w-8 ml-1">
                                    <LinkIcon className="text-foreground/20 dark:text-white/20 text-sm" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Avatar className='h-10 w-10'>
                                        <AvatarFallback className="bg-accent text-white font-bold">{getInitials(offeree.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-foreground dark:text-white font-bold leading-none">{offeree.name}</p>
                                        <p className="text-foreground/50 dark:text-gray-500 text-xs mt-1">Client</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-foreground/5 dark:bg-white/5 w-full mb-8"></div>

                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="text-success text-sm" />
                                <h4 className="text-foreground/50 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">The Terms</h4>
                            </div>
                            <div className="bg-background dark:bg-background-dark/50 rounded-lg p-4 border border-foreground/5 dark:border-white/5">
                                <p className="text-foreground dark:text-gray-300 text-sm leading-relaxed italic">
                                    "{offer.terms}"
                                </p>
                            </div>
                        </div>

                        {(offer.paymentAmount || offer.paymentDueDate) && (
                             <div className="grid grid-cols-2 gap-4">
                                {offer.paymentAmount && (
                                    <div className="bg-primary/5 dark:bg-primary/20 p-4 rounded-lg">
                                        <p className="text-primary/50 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Payment</p>
                                        <p className="text-primary dark:text-white text-xl font-extrabold">{offer.paymentAmount}</p>
                                    </div>
                                )}
                                {offer.paymentDueDate && (
                                    <div className="bg-primary/5 dark:bg-primary/20 p-4 rounded-lg">
                                        <p className="text-primary/50 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Due Date</p>
                                        <p className="text-primary dark:text-white text-xl font-extrabold">{offer.paymentDueDate}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex gap-3">
                        <Gavel className="text-accent shrink-0" />
                        <p className="text-foreground/60 dark:text-gray-400 text-[11px] leading-relaxed">
                            By clicking "Confirm & Sign", you agree that this digital handshake constitutes a legally binding agreement under the Uniform Electronic Transactions Act. Both parties are obligated to fulfill the terms stated above.
                        </p>
                    </div>
                </div>
            </main>
            
            <footer className="fixed bottom-0 left-0 right-0 bg-background/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-border dark:border-gray-800 pb-8 pt-4 px-6 z-50">
                <div className="max-w-md mx-auto flex flex-col gap-3">
                    <div className="flex gap-3">
                        <button className="flex-1 py-4 bg-muted dark:bg-gray-800 text-foreground dark:text-white font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                           <Edit className="w-4 h-4" /> Edit
                        </button>
                        <Button 
                            onClick={handleHandshake} 
                            disabled={isPending || isShaking}
                            className={`flex-[2] py-4 h-auto bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 ${isShaking ? 'animate-shake' : ''}`}
                        >
                             {isPending || isShaking ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                               <Handshake className="w-5 h-5" />
                            )}
                            {isShaking ? 'Sealing...' : 'Confirm & Sign'}
                        </Button>
                    </div>
                     <p className="text-center text-[10px] text-primary/40 dark:text-gray-500 font-medium">
                        Hold button to simulate handshake gesture
                    </p>
                </div>
            </footer>
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


function AgreementDetails({ offer }: { offer: Offer }) {
    const acceptedDate = offer.acceptedAt ? new Date(offer.acceptedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    const auditTrail = [
        { icon: Edit, title: 'Agreement Created', details: 'Oct 12, 10:00 AM • IP: 192.168.1.1' },
        { icon: Send, title: 'Sent to Client', details: 'Oct 12, 10:15 AM • via Email' },
        { icon: Signature, title: `Signed by ${offer.offerees[0]?.name || ''}`, details: `Oct 13, 02:30 PM • E-Signature` },
        { icon: Gavel, title: 'Legally Binding', details: `Oct 13, 02:35 PM • Fully Executed`, isFinal: true },
    ];
    
    return (
        <div className="flex flex-col h-full bg-background dark:bg-background-dark">
             <header className="sticky top-0 z-50 flex items-center bg-background/80 dark:bg-background-dark/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-border dark:border-gray-800">
                <h2 className="text-foreground dark:text-white text-lg font-bold leading-tight">Agreement Details</h2>
                <Button variant="ghost" size="icon">
                    <Share className="w-5 h-5" />
                </Button>
             </header>
             <main className="flex-1 max-w-md mx-auto pb-24">
                <div className="p-4">
                    <div className="flex flex-col items-stretch justify-start rounded-xl shadow-lg bg-card dark:bg-gray-900 border border-border dark:border-gray-800 overflow-hidden">
                        <div className="w-full relative aspect-[16/10]">
                            <Image src="https://picsum.photos/seed/agreement-details/600/400" alt={offer.title} fill objectFit="cover" data-ai-hint="digital handshake agreement" />
                        </div>
                        <div className="flex w-full flex-col items-stretch justify-center gap-3 p-5">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800">
                                    <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 w-4 h-4" />
                                    <p className="text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">Accepted</p>
                                </div>
                                <p className="text-foreground/60 text-xs font-mono">#{offer.id.slice(0, 12)}</p>
                            </div>
                            <div>
                                <h1 className="text-foreground dark:text-white text-2xl font-extrabold leading-tight">{offer.title}</h1>
                                <p className="text-foreground/70 dark:text-gray-400 text-sm mt-1">Finalized on {acceptedDate}</p>
                            </div>
                             <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
                                {offer.paymentAmount && <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Amount</p>
                                    <p className="text-lg font-bold text-primary dark:text-primary-light">{offer.paymentAmount}</p>
                                </div>}
                                {offer.paymentDueDate && <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Deadline</p>
                                    <p className="text-lg font-bold text-primary dark:text-primary-light">{offer.paymentDueDate}</p>
                                </div>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-2">
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/10">
                        <h3 className="text-sm font-bold text-primary dark:text-primary-light uppercase tracking-wider mb-2">The Agreement</h3>
                        <p className="text-sm text-primary dark:text-gray-300 leading-relaxed italic">
                            "{offer.terms}"
                        </p>
                    </div>
                </div>

                <section className="mt-4">
                    <h3 className="text-foreground dark:text-white text-lg font-bold px-4 mb-2">Audit Trail</h3>
                    <div className="grid grid-cols-[48px_1fr] gap-x-2 px-4">
                        {auditTrail.map((step, index) => (
                             <div key={index} className="contents">
                                <div className="flex flex-col items-center">
                                    <div className={`flex size-10 items-center justify-center rounded-full ${step.isFinal ? 'bg-success text-white' : 'bg-primary/10 text-primary dark:bg-primary/20'}`}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    {index < auditTrail.length - 1 && <div className="w-[2px] bg-border h-8"></div>}
                                </div>
                                <div className="flex flex-col pb-6 pt-1">
                                    <p className="text-foreground dark:text-white text-sm font-bold">{step.title}</p>
                                    <p className="text-muted-foreground text-xs">{step.details}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
             </main>
             <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 dark:bg-background-dark/90 backdrop-blur-lg border-t border-border">
                <div className="max-w-md mx-auto flex gap-3">
                    <Button className="flex-1 h-14 rounded-xl font-bold transition-transform active:scale-95 shadow-lg shadow-primary/20">
                        Download PDF
                    </Button>
                </div>
            </footer>
        </div>
    );
}

export function OfferDetails({ offer: initialOffer }: { offer: Offer }) {
    const [offer, setOffer] = useState(initialOffer);
    const { toast } = useToast();

    // The current user is the offeree and the offer is pending
    const canAccept = offer.status === 'pending' && offer.offerees.some(o => o.email === DUMMY_USER_EMAIL);

    const handleAccept = async () => {
        if (!offer) return;
        const result = await acceptOffer(offer.id, offer.offerees[0]?.email || '');
        if (result.success && result.offer) {
            toast({
                title: 'Agreement Sealed!',
                description: 'The offer has been accepted.',
            });
            setOffer(result.offer);
        } else {
            toast({
                title: 'Error',
                description: result.message,
                variant: 'destructive',
            });
        }
    };
    
    if (offer.status === 'accepted' || !canAccept) {
        return <AgreementDetails offer={offer} />;
    }

    return <ReviewAndSign offer={offer} onAccept={handleAccept} />
}
