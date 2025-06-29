'use client';

import { useState, useTransition, type ReactNode, useEffect } from 'react';
import { useForm, FormProvider, Controller, useFormContext, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createOffer, checkCompleteness } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Handshake, Users, FileText, MapPin, Search, CheckCircle, Copy, Loader2, ArrowLeft, ArrowRight, Lightbulb, ShieldCheck, AlertTriangle, PartyPopper, Plus, Trash2, User, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Offer, SpecificTerm } from '@/lib/data';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const offerSchema = z.object({
    agreementType: z.string().min(1, { message: "Please select an agreement type." }),
    customAgreementType: z.string().optional(),
    offerorName: z.string().min(2, { message: "Your name must be at least 2 characters." }),
    offerorEmail: z.string().email({ message: "Please enter a valid email for yourself." }),
    offerees: z.array(z.object({
        name: z.string().min(2, { message: "Name must be at least 2 characters." }),
        email: z.string().email({ message: "Please enter a valid email." }),
    })).min(1, { message: "At least one other party is required." }),
    terms: z.string().min(20, { message: "The agreement purpose must be at least 20 characters." }),
    specificTerms: z.array(z.object({
        title: z.string().min(1, { message: "Term title cannot be empty." }),
        description: z.string().min(1, { message: "Term description cannot be empty." }),
    })).optional(),
    paymentAmount: z.string().optional(),
    paymentDueDate: z.string().optional(),
    paymentMethod: z.string().optional(),
    duration: z.string().optional(),
    location: z.string().optional(),
}).refine(data => {
    if (data.agreementType === 'Other') {
        return !!data.customAgreementType && data.customAgreementType.trim().length > 2;
    }
    return true;
}, {
    message: "Please specify your custom agreement type (at least 3 characters).",
    path: ["customAgreementType"],
});

export type OfferFormData = z.infer<typeof offerSchema>;
type FieldName = keyof OfferFormData;

// --- Helper Components ---

const steps = [
    { id: 1, name: 'Agreement Type', fields: ['agreementType', 'customAgreementType'], icon: Handshake },
    { id: 2, name: 'Parties', fields: ['offerorName', 'offerorEmail', 'offerees'], icon: Users },
    { id: 3, name: 'Terms', fields: ['terms', 'specificTerms', 'paymentAmount', 'paymentDueDate', 'paymentMethod', 'duration'], icon: FileText },
    { id: 4, name: 'Location', fields: ['location'], icon: MapPin },
    { id: 5, name: 'Review', fields: [], icon: Search },
    { id: 6, name: 'Complete', fields: [], icon: CheckCircle },
];

const FormStep = ({ title, description, children }: { title: string, description: string, children: ReactNode }) => (
    <div>
        <h2 className="text-2xl font-bold font-headline">{title}</h2>
        <p className="text-muted-foreground mt-1 mb-6">{description}</p>
        <div className="space-y-6">{children}</div>
    </div>
);


// --- Step Components ---

const AgreementTypeStep = () => {
    const { control, watch, formState: { errors } } = useFormContext<OfferFormData>();
    const agreementType = watch('agreementType');
    const agreementTypes = ["Simple Exchange", "Loan Agreement", "Service Agreement"];

    return (
        <FormStep title="Let's start your agreement!" description="What kind of handshake are we making today?">
             <Controller
                name="agreementType"
                control={control}
                render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[...agreementTypes, "Other"].map(type => (
                            <Label key={type} htmlFor={type} className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent/10 hover:text-accent-foreground has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 cursor-pointer")}>
                                <RadioGroupItem value={type} id={type} className="sr-only" />
                                <p className="mb-0 font-semibold">{type}</p>
                            </Label>
                        ))}
                    </RadioGroup>
                )}
            />
            {errors.agreementType && <p className="text-sm font-medium text-destructive">{errors.agreementType.message}</p>}
            {agreementType === 'Other' && (
                <Controller
                    name="customAgreementType"
                    control={control}
                    render={({ field }) => (
                        <div className="space-y-2">
                            <Label htmlFor="customAgreementType">Custom Agreement Type</Label>
                            <Input {...field} id="customAgreementType" placeholder="e.g., Rental Agreement" />
                            {errors.customAgreementType && <p className="text-sm font-medium text-destructive">{errors.customAgreementType.message}</p>}
                        </div>
                    )}
                />
            )}
        </FormStep>
    );
};

const PartiesStep = () => {
    const { register, control, formState: { errors } } = useFormContext<OfferFormData>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "offerees"
    });

    return (
        <FormStep title="Who's shaking hands?" description="Tell us who's making the offer and who's receiving it.">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">You (The Offeror)</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="offerorName">Your Name</Label>
                        <Input id="offerorName" {...register('offerorName')} placeholder="Alice Smith" />
                        {errors.offerorName && <p className="text-sm font-medium text-destructive">{errors.offerorName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="offerorEmail">Your Email</Label>
                        <Input id="offerorEmail" type="email" {...register('offerorEmail')} placeholder="alice@example.com" />
                        {errors.offerorEmail && <p className="text-sm font-medium text-destructive">{errors.offerorEmail.message}</p>}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">The Other Parties (The Offerees)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-md space-y-4 bg-muted/50 relative">
                             {fields.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`offerees.${index}.name`}>Their Name</Label>
                                    <Input id={`offerees.${index}.name`} {...register(`offerees.${index}.name`)} placeholder="Bob Johnson" />
                                    {errors.offerees?.[index]?.name && <p className="text-sm font-medium text-destructive">{errors.offerees?.[index]?.name?.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`offerees.${index}.email`}>Their Email</Label>
                                    <Input id={`offerees.${index}.email`} type="email" {...register(`offerees.${index}.email`)} placeholder="bob@example.com" />
                                    {errors.offerees?.[index]?.email && <p className="text-sm font-medium text-destructive">{errors.offerees?.[index]?.email?.message}</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                     {errors.offerees?.root && <p className="text-sm font-medium text-destructive">{errors.offerees.root.message}</p>}
                </CardContent>
                <CardFooter>
                     <Button type="button" variant="outline" onClick={() => append({ name: "", email: "" })}>
                        <Plus className="mr-2" /> Add Another Party
                    </Button>
                </CardFooter>
            </Card>
        </FormStep>
    );
};

const TermsStep = () => {
    const { register, control, watch, formState: { errors } } = useFormContext<OfferFormData>();
    const { fields, append, remove } = useFieldArray({ control, name: "specificTerms" });
    const [aiResult, setAiResult] = useState<AgreementCompletenessCheckOutput & { error?: string } | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const terms = watch('terms');

    const handleCheckCompleteness = async () => {
        setIsChecking(true);
        setAiResult(null);
        const result = await checkCompleteness(terms);
        setAiResult(result);
        setIsChecking(false);
    };

    return (
        <FormStep title="What's the deal?" description="Describe the core purpose of your agreement, then add specific terms for clarity.">
            <div className="space-y-2">
                <Label htmlFor="terms">Purpose of Agreement</Label>
                <Textarea id="terms" {...register('terms')} placeholder="e.g., To formalize the sale of a used bicycle from the Offeror to the Offeree." rows={4} />
                {errors.terms && <p className="text-sm font-medium text-destructive">{errors.terms.message}</p>}
            </div>

            <Card className="bg-secondary/50">
                <CardHeader>
                     <CardTitle className="text-lg">Specific Terms & Conditions</CardTitle>
                    <CardDescription>Add specific, numbered terms to your agreement. This is optional but highly recommended for clarity.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-md space-y-4 bg-background relative">
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <div className="space-y-2">
                                <Label htmlFor={`specificTerms.${index}.title`}>Term {index + 1} Title</Label>
                                <Input id={`specificTerms.${index}.title`} {...register(`specificTerms.${index}.title`)} placeholder="e.g., The Product" />
                                {errors.specificTerms?.[index]?.title && <p className="text-sm font-medium text-destructive">{errors.specificTerms?.[index]?.title?.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`specificTerms.${index}.description`}>Term {index + 1} Description</Label>
                                <Textarea id={`specificTerms.${index}.description`} {...register(`specificTerms.${index}.description`)} placeholder="e.g., One (1) used bicycle, sold as-is." rows={2} />
                                {errors.specificTerms?.[index]?.description && <p className="text-sm font-medium text-destructive">{errors.specificTerms?.[index]?.description?.message}</p>}
                            </div>
                        </div>
                    ))}
                </CardContent>
                <CardFooter>
                    <Button type="button" variant="outline" onClick={() => append({ title: "", description: "" })}>
                        <Plus className="mr-2" /> Add Term
                    </Button>
                </CardFooter>
            </Card>
            
            <Card className="bg-secondary/50">
                <CardHeader>
                    <CardTitle className="text-lg">Other Details (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Payment Amount</Label>
                            <Input {...register('paymentAmount')} placeholder="e.g., $100.00" />
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Due Date</Label>
                            <Input {...register('paymentDueDate')} placeholder="e.g., Upon delivery" />
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Input {...register('paymentMethod')} placeholder="e.g., Cash" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Duration / Completion Date</Label>
                        <Input {...register('duration')} placeholder="e.g., Agreement concludes upon payment." />
                    </div>
                </CardContent>
            </Card>

            <div>
                {aiResult && (
                    <Card className="bg-background">
                        <CardContent className="pt-6">
                            {aiResult.error ? (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{aiResult.error}</AlertDescription>
                                </Alert>
                            ) : (
                                <div className="space-y-4">
                                    {aiResult.isComplete ? (
                                        <Alert variant="default" className="bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700">
                                            <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            <AlertTitle className="text-green-800 dark:text-green-300">Looks Good!</AlertTitle>
                                            <AlertDescription className="text-green-700 dark:text-green-400">The purpose statement appears to be comprehensive.</AlertDescription>
                                        </Alert>
                                    ) : (
                                        <Alert variant="destructive">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertTitle>Potentially Missing Details</AlertTitle>
                                            <AlertDescription>
                                                <ul className="list-disc pl-5 mt-2">{aiResult.missingDetails?.map((detail, i) => <li key={i}>{detail}</li>)}</ul>
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {aiResult.suggestions && aiResult.suggestions.length > 0 && (
                                        <Alert>
                                            <Lightbulb className="h-4 w-4" />
                                            <AlertTitle>Suggestions for Improvement</AlertTitle>
                                            <AlertDescription>
                                                <ul className="list-disc pl-5 mt-2">{aiResult.suggestions.map((suggestion, i) => <li key={i}>{suggestion}</li>)}</ul>
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
                <Button type="button" variant="outline" onClick={handleCheckCompleteness} disabled={isChecking || !terms || terms.length < 20}>
                    {isChecking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2" />}
                    AI Completeness Check (on Purpose)
                </Button>
            </div>
        </FormStep>
    );
};

const LocationStep = () => {
    const { register, formState: { errors } } = useFormContext<OfferFormData>();
    return (
        <FormStep title="Where is this happening?" description="Knowing the location can help define the governing law for your handshake. This is optional.">
            <div className="space-y-2">
                <Label htmlFor="location">Governing Law (e.g., State, Country)</Label>
                <Input id="location" {...register('location')} placeholder="e.g., California, USA" />
                <p className="text-sm text-muted-foreground">This helps determine which jurisdiction's laws apply to the agreement.</p>
                {errors.location && <p className="text-sm font-medium text-destructive">{errors.location.message}</p>}
            </div>
        </FormStep>
    );
};

function AgreementPreview({ data, onEdit }: { data: OfferFormData, onEdit: (step: number) => void }) {
    const agreementDate = new Date().toLocaleDateString();
    const title = data.agreementType === 'Other' ? data.customAgreementType : data.agreementType;
    const offereeTitle = (data.offerees?.length || 0) > 1 ? "PARTIES (B)" : "PARTY (B)";

    return (
        <Card className="font-sans">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{title}</CardTitle>
                <CardDescription>Agreement Date: {agreementDate}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
                <section>
                    <h3 className="font-bold text-base mb-2 flex justify-between items-center">
                        1. Parties Involved <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>Edit</Button>
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
                     <h3 className="font-bold text-base mb-2 flex justify-between items-center">
                        2. Purpose of Agreement <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>Edit</Button>
                    </h3>
                     <p className="whitespace-pre-wrap">{data.terms}</p>
                </section>
                
                <Separator />
                
                {(data.specificTerms && data.specificTerms.length > 0) && (
                    <section>
                        <h3 className="font-bold text-base mb-2 flex justify-between items-center">
                            3. Agreed Terms and Conditions <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>Edit</Button>
                        </h3>
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
                        <h4 className="font-semibold mb-1 flex justify-between items-center">
                           Payment Terms <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>Edit</Button>
                        </h4>
                        <div className="p-3 border rounded-md bg-muted/30 text-xs space-y-1">
                           {data.paymentAmount && <p><strong>Amount:</strong> {data.paymentAmount}</p>}
                           {data.paymentDueDate && <p><strong>Due Date:</strong> {data.paymentDueDate}</p>}
                           {data.paymentMethod && <p><strong>Method:</strong> {data.paymentMethod}</p>}
                        </div>
                    </section>
                )}
                
                {data.duration && (
                    <section>
                         <h4 className="font-semibold mb-1 flex justify-between items-center">
                            Duration/Completion <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>Edit</Button>
                        </h4>
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
                            <h3 className="font-bold text-sm text-foreground mb-1 flex justify-between items-center">
                                5. Governing Law <Button variant="ghost" size="sm" onClick={() => onEdit(4)}>Edit</Button>
                            </h3>
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
                     <p className="text-xs text-muted-foreground mb-4">By signing below, the Parties acknowledge that they have read, understood, and agree to the terms and conditions set forth in this Simple Agreement.</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                         <div>
                             <div className="mt-8 border-b pb-1">
                                <p className="font-semibold">{data.offerorName}</p>
                             </div>
                             <p className="text-xs text-muted-foreground">Party A Signature</p>
                         </div>
                         <div>
                             <div className="mt-8 border-b pb-1">
                                <p className="text-muted-foreground italic">Awaiting signature...</p>
                             </div>
                             <p className="text-xs text-muted-foreground">Party B Signature</p>
                         </div>
                     </div>
                </section>
            </CardContent>
        </Card>
    );
}


const ReviewStep = ({ onEdit }: { onEdit: (step: number) => void }) => {
    const { getValues } = useFormContext<OfferFormData>();
    const data = getValues();
    
    return (
        <FormStep title="Ready to shake?" description="Take a moment to ensure everything looks right. Once confirmed, your agreement will be created.">
            <AgreementPreview data={data} onEdit={onEdit} />
            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Disclaimer</AlertTitle>
                <AlertDescription>
                    This tool helps create simple agreements. For complex matters, please consult a legal professional.
                </AlertDescription>
            </Alert>
        </FormStep>
    );
};

const SuccessStep = ({ offer, onReset }: { offer: Offer, onReset: () => void }) => {
    const { toast } = useToast();
    const [offerUrl, setOfferUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
          setOfferUrl(`${window.location.origin}/offers/${offer.id}`);
        }
    }, [offer.id]);
    
    const copyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: "The URL has been copied to your clipboard." });
    }

    return (
        <div className="text-center py-10">
            <PartyPopper className="w-16 h-16 mx-auto text-accent mb-4" />
            <h2 className="text-3xl font-bold font-headline">Your Handshake is Ready!</h2>
            <p className="text-muted-foreground mt-2 mb-6">Share this unique link with the other party so they can view and accept your terms.</p>
            
            {offerUrl ? (
                <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between gap-4 max-w-lg mx-auto">
                    <p className="text-sm font-mono truncate">{offerUrl}</p>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(offerUrl)}>
                        <Copy className="h-5 w-5" />
                    </Button>
                </div>
            ) : (
                 <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-center gap-4 max-w-lg mx-auto">
                    <Loader2 className="w-5 h-5 animate-spin"/>
                    <p className="text-sm font-mono">Generating shareable link...</p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <Button asChild size="lg">
                    <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button size="lg" variant="outline" onClick={onReset}>Create Another Agreement</Button>
            </div>
        </div>
    );
}

// --- Main Form Component ---

export function CreateOfferForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [createdOffer, setCreatedOffer] = useState<Offer | null>(null);

    const methods = useForm<OfferFormData>({
        resolver: zodResolver(offerSchema),
        defaultValues: {
            offerorName: '',
            offerorEmail: '',
            offerees: [{ name: '', email: '' }],
            terms: '',
            specificTerms: [],
            paymentAmount: '',
            paymentDueDate: '',
            paymentMethod: '',
            duration: '',
            location: '',
            agreementType: '',
            customAgreementType: '',
        }
    });

    const { trigger, handleSubmit, reset } = methods;

    const nextStep = async () => {
        const fields = steps[currentStep - 1].fields as FieldName[];
        const output = await trigger(fields, { shouldFocus: true });
        if (!output) return;

        if (currentStep < 5) {
            setCurrentStep(step => step + 1);
        } else {
            handleSubmit(processForm)();
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(step => step - 1);
        }
    };
    
    const goToStep = (step: number) => {
        if(step < currentStep) {
            setCurrentStep(step);
        }
    }

    const processForm = (data: OfferFormData) => {
        startTransition(async () => {
            const result = await createOffer(data);
            if (result.success && result.offer) {
                setCreatedOffer(result.offer);
                setCurrentStep(6);
            } else {
                toast({
                    title: "Error Creating Offer",
                    description: result.message || "An unexpected error occurred.",
                    variant: "destructive",
                });
            }
        });
    };
    
    const handleReset = () => {
        reset();
        setCurrentStep(1);
        setCreatedOffer(null);
    }

    if(currentStep === 6 && createdOffer) {
        return <SuccessStep offer={createdOffer} onReset={handleReset} />
    }

    const StepIcon = steps[currentStep - 1].icon;

    return (
        <FormProvider {...methods}>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                         <div className="bg-primary/10 p-3 rounded-full">
                            <StepIcon className="w-6 h-6 text-primary" />
                         </div>
                         <div>
                            <p className="text-sm font-medium text-primary">Step {currentStep} of 5</p>
                            <CardTitle className="font-headline text-2xl">{steps[currentStep-1].name}</CardTitle>
                         </div>
                    </div>
                    <Progress value={((currentStep-1) / 4) * 100} className="mt-4 h-2" />
                </CardHeader>
                <form>
                    <CardContent>
                        {currentStep === 1 && <AgreementTypeStep />}
                        {currentStep === 2 && <PartiesStep />}
                        {currentStep === 3 && <TermsStep />}
                        {currentStep === 4 && <LocationStep />}
                        {currentStep === 5 && <ReviewStep onEdit={goToStep} />}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                            <ArrowLeft className="mr-2" /> Back
                        </Button>
                        <Button type="button" onClick={nextStep} disabled={isPending}>
                            {isPending ? <Loader2 className="animate-spin" /> : currentStep === 5 ? "Initiate Handshake!" : "Next"}
                            {currentStep < 5 && <ArrowRight className="ml-2" />}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </FormProvider>
    );
}
