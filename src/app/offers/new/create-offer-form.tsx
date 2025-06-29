'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { useForm, FormProvider, Controller, useFormContext } from 'react-hook-form';
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
import { Handshake, Users, FileText, MapPin, Search, CheckCircle, Copy, Loader2, ArrowLeft, ArrowRight, Lightbulb, ShieldCheck, AlertTriangle, PartyPopper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Offer } from '@/lib/data';
import type { AgreementCompletenessCheckOutput } from '@/ai/flows/agreement-completeness-check';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const offerSchema = z.object({
    agreementType: z.string().min(1, { message: "Please select an agreement type." }),
    customAgreementType: z.string().optional(),
    offerorName: z.string().min(2, { message: "Your name must be at least 2 characters." }),
    offerorEmail: z.string().email({ message: "Please enter a valid email for yourself." }),
    offereeName: z.string().min(2, { message: "Their name must be at least 2 characters." }),
    offereeEmail: z.string().email({ message: "Please enter a valid email for them." }),
    terms: z.string().min(20, { message: "Terms must be at least 20 characters." }),
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

type OfferFormData = z.infer<typeof offerSchema>;
type FieldName = keyof OfferFormData;

const steps = [
    { id: 1, name: 'Agreement Type', fields: ['agreementType', 'customAgreementType'], icon: Handshake },
    { id: 2, name: 'Parties', fields: ['offerorName', 'offerorEmail', 'offereeName', 'offereeEmail'], icon: Users },
    { id: 3, name: 'Terms', fields: ['terms'], icon: FileText },
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
    const { register, formState: { errors } } = useFormContext<OfferFormData>();
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
                    <CardTitle className="text-lg">The Other Party (The Offeree)</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="offereeName">Their Name</Label>
                        <Input id="offereeName" {...register('offereeName')} placeholder="Bob Johnson" />
                        {errors.offereeName && <p className="text-sm font-medium text-destructive">{errors.offereeName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="offereeEmail">Their Email</Label>
                        <Input id="offereeEmail" type="email" {...register('offereeEmail')} placeholder="bob@example.com" />
                        {errors.offereeEmail && <p className="text-sm font-medium text-destructive">{errors.offereeEmail.message}</p>}
                    </div>
                </CardContent>
            </Card>
        </FormStep>
    );
};

const TermsStep = () => {
    const { register, watch, formState: { errors } } = useFormContext<OfferFormData>();
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
        <FormStep title="What's the deal?" description="Clearly and concisely describe the exchange. What is being offered, and what is expected in return?">
            <div className="space-y-2">
                <Label htmlFor="terms">Terms of Agreement</Label>
                <Textarea id="terms" {...register('terms')} placeholder="e.g., I will pay $100 for your used bicycle on July 1st, 2025. The bicycle is sold as-is." rows={8} />
                {errors.terms && <p className="text-sm font-medium text-destructive">{errors.terms.message}</p>}
            </div>
            {aiResult && (
                <Card className="bg-secondary/50">
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
                                        <AlertDescription className="text-green-700 dark:text-green-400">This agreement appears to be comprehensive.</AlertDescription>
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
                AI Completeness Check
            </Button>
        </FormStep>
    );
};

const LocationStep = () => {
    const { register, formState: { errors } } = useFormContext<OfferFormData>();
    return (
        <FormStep title="Where is this happening?" description="Knowing the location can help define the governing law for your handshake. This is optional.">
            <div className="space-y-2">
                <Label htmlFor="location">Location (e.g., City, State, or Address)</Label>
                <Input id="location" {...register('location')} placeholder="e.g., San Francisco, CA" />
                <p className="text-sm text-muted-foreground">Note: In a full version, this could use Google Maps for precise address lookup.</p>
                {errors.location && <p className="text-sm font-medium text-destructive">{errors.location.message}</p>}
            </div>
        </FormStep>
    );
};

const ReviewStep = ({ onEdit }: { onEdit: (step: number) => void }) => {
    const { getValues } = useFormContext<OfferFormData>();
    const data = getValues();
    const title = data.agreementType === 'Other' ? data.customAgreementType : data.agreementType;

    return (
        <FormStep title="Ready to shake?" description="Take a moment to ensure everything looks right. Once confirmed, your agreement will be created.">
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>{title}</span>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>Edit</Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-muted-foreground">PARTIES</h4>
                            <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>Edit</Button>
                        </div>
                        <div className="text-sm">
                            <p><strong>From:</strong> {data.offerorName} ({data.offerorEmail})</p>
                            <p><strong>To:</strong> {data.offereeName} ({data.offereeEmail})</p>
                        </div>
                    </div>
                    <div className="pt-2">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-muted-foreground">TERMS</h4>
                            <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>Edit</Button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap p-2 border rounded-md bg-background">{data.terms}</p>
                    </div>
                    {data.location && (
                        <div className="pt-2">
                             <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-muted-foreground">LOCATION</h4>
                                <Button variant="ghost" size="sm" onClick={() => onEdit(4)}>Edit</Button>
                            </div>
                            <p className="text-sm">{data.location}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
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
    const offerUrl = `${window.location.origin}/offers/${offer.id}`;
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: "The URL has been copied to your clipboard." });
    }

    return (
        <div className="text-center py-10">
            <PartyPopper className="w-16 h-16 mx-auto text-accent mb-4" />
            <h2 className="text-3xl font-bold font-headline">Your Handshake is Ready!</h2>
            <p className="text-muted-foreground mt-2 mb-6">Share this unique link with the other party so they can view and accept your terms.</p>
            
            <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between gap-4 max-w-lg mx-auto">
                <p className="text-sm font-mono truncate">{offerUrl}</p>
                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(offerUrl)}>
                    <Copy className="h-5 w-5" />
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <Button asChild size="lg">
                    <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button size="lg" variant="outline" onClick={onReset}>Create Another Agreement</Button>
            </div>
        </div>
    );
}


export function CreateOfferForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [createdOffer, setCreatedOffer] = useState<Offer | null>(null);

    const methods = useForm<OfferFormData>({
        resolver: zodResolver(offerSchema),
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

    return (
        <FormProvider {...methods}>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                         <div className="bg-primary/10 p-3 rounded-full">
                            <steps[currentStep-1].icon className="w-6 h-6 text-primary" />
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
