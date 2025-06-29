'use client';

import type { Offer } from '@/lib/data';
import type { OfferFormData } from '@/app/offers/new/create-offer-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { User, Mail } from 'lucide-react';

// Combined type for data prop
type AgreementData = Offer | OfferFormData;

// Type guard to differentiate between Offer and OfferFormData
function isOffer(data: AgreementData): data is Offer {
  return 'id' in data;
}

export function AgreementPreview({ data, onEdit }: { data: AgreementData, onEdit?: (step: number) => void }) {
    const agreementDate = isOffer(data) && data.createdAt ? new Date(data.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
    const title = isOffer(data) ? data.title : (data.agreementType === 'Other' && data.customAgreementType ? data.customAgreementType : data.agreementType);
    const offereeTitle = (data.offerees?.length || 0) > 1 ? "PARTIES (B)" : "PARTY (B)";

    return (
        <Card className="font-sans">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{title}</CardTitle>
                <CardDescription>Agreement Date: {agreementDate}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
                <Accordion type="multiple" defaultValue={['item-1']} className="w-full space-y-2">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="font-bold text-base hover:no-underline">
                            <div className="flex justify-between items-center w-full pr-2">
                                <span>1. Parties Involved</span>
                                {onEdit && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(2); }}>Edit</Button>}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2">
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
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                        <AccordionTrigger className="font-bold text-base hover:no-underline">
                             <div className="flex justify-between items-center w-full pr-2">
                                <span>2. Purpose of Agreement</span>
                                {onEdit && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(3); }}>Edit</Button>}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2">
                             <p className="whitespace-pre-wrap p-4 border rounded-md bg-muted/30">{data.terms}</p>
                        </AccordionContent>
                    </AccordionItem>

                    {(data.specificTerms && data.specificTerms.length > 0) || data.paymentAmount || data.paymentDueDate || data.paymentMethod || data.duration ? (
                        <AccordionItem value="item-3">
                             <AccordionTrigger className="font-bold text-base hover:no-underline">
                                <div className="flex justify-between items-center w-full pr-2">
                                    <span>3. Agreed Terms and Conditions</span>
                                    {onEdit && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(3); }}>Edit</Button>}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2 p-4 border rounded-md bg-muted/30">
                                {(data.specificTerms && data.specificTerms.length > 0) && (
                                    <section>
                                        <h4 className="font-semibold mb-2">Specific Terms</h4>
                                        <ul className="space-y-3 pl-5 list-disc">
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
                                        <div className="text-xs space-y-1">
                                           {data.paymentAmount && <p><strong>Amount:</strong> {data.paymentAmount}</p>}
                                           {data.paymentDueDate && <p><strong>Due Date:</strong> {data.paymentDueDate}</p>}
                                           {data.paymentMethod && <p><strong>Method:</strong> {data.paymentMethod}</p>}
                                        </div>
                                    </section>
                                )}
                                
                                {data.duration && (
                                    <section>
                                        <h4 className="font-semibold mb-1">Duration/Completion</h4>
                                        <p className="text-muted-foreground">{data.duration}</p>
                                    </section>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    ) : null}

                    <AccordionItem value="item-4">
                        <AccordionTrigger className="font-bold text-base hover:no-underline">4. Dispute Resolution</AccordionTrigger>
                        <AccordionContent className="pt-2 text-xs text-muted-foreground p-4 border rounded-md bg-muted/30">
                            <p>In the event of a dispute arising out of or in connection with this Agreement, the Parties agree to first attempt to resolve the dispute through good faith negotiation.</p>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-5">
                        <AccordionTrigger className="font-bold text-base hover:no-underline">
                             <div className="flex justify-between items-center w-full pr-2">
                                <span>5. Governing Law</span>
                                {onEdit && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(4); }}>Edit</Button>}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 text-xs text-muted-foreground p-4 border rounded-md bg-muted/30">
                            {data.location ? (
                               <p>This Agreement shall be governed by and construed in accordance with the laws of {data.location}, without regard to its conflict of laws principles.</p>
                            ) : (
                                <p>No governing law specified.</p>
                            )}
                        </AccordionContent>
                    </AccordionItem>

                     <AccordionItem value="item-6">
                        <AccordionTrigger className="font-bold text-base hover:no-underline">6. Entire Agreement</AccordionTrigger>
                        <AccordionContent className="pt-2 text-xs text-muted-foreground p-4 border rounded-md bg-muted/30">
                            <p>This document constitutes the entire Agreement between the Parties regarding the subject matter herein and supersedes all prior discussions, negotiations, and agreements, whether oral or written.</p>
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-7" className="border-b-0">
                        <AccordionTrigger className="font-bold text-base hover:no-underline">7. Signatures</AccordionTrigger>
                        <AccordionContent className="pt-2 p-4 border rounded-md bg-muted/30">
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
                                        {isOffer(data) && data.status === 'accepted' ? (
                                            <p className="font-semibold">{data.offerees?.map(o => o.name).join(', ')}</p>
                                        ) : (
                                            <p className="text-muted-foreground italic">Awaiting signature...</p>
                                        )}
                                     </div>
                                     <p className="text-xs text-muted-foreground">Party B Signature</p>
                                 </div>
                             </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}
