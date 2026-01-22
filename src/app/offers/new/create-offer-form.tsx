'use client';

import { useState, useTransition } from 'react';
import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createOffer } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, DollarSign, Calendar, Edit, FileText, Group, Handshake, Info, Link as LinkIcon, Loader2, UserPlus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { HandshakeIcon } from '@/components/icons/handshake-icon';

const offerSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  offereeEmail: z.string().email({ message: "Please enter a valid email for the other party." }),
  offereeName: z.string().min(2, { message: "Other party's name is required." }),
  terms: z.string().min(20, { message: "The deal description must be at least 20 characters." }),
  paymentAmount: z.string().optional(),
  paymentDueDate: z.string().optional(),
});

type OfferFormData = z.infer<typeof offerSchema>;
type FieldName = keyof OfferFormData;

const DUMMY_USER = {
    name: 'Jadan',
    email: 'iamjadan@gmail.com'
}

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('');
}


const steps = [
    { id: 1, name: 'Parties & Purpose', fields: ['title', 'offereeEmail', 'offereeName', 'terms'], icon: Group },
    { id: 2, name: 'Define Terms', fields: ['paymentAmount', 'paymentDueDate'], icon: DollarSign },
    { id: 3, name: 'Review & Sign', fields: [], icon: Handshake },
];


function Step1({ onNext }: { onNext: () => Promise<void> }) {
    const { register, formState: { errors } } = useFormContext<OfferFormData>();
    const [isPending, startTransition] = useTransition();

    const handleNext = () => {
        startTransition(async () => {
            await onNext();
        });
    }

    return (
        <div className="flex-1 space-y-8">
            <div className="flex flex-col gap-2">
                <label className="text-foreground dark:text-gray-200 text-base font-bold">Agreement Title</label>
                <Input {...register('title')} placeholder="e.g. Freelance Design Project" className="p-4 h-auto rounded-xl" />
                {errors.title && <p className="text-sm font-medium text-destructive">{errors.title.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-foreground dark:text-gray-200 text-base font-bold">Other Party</label>
                <div className='space-y-2'>
                    <Input {...register('offereeName')} placeholder="Their Name" className="p-4 h-auto rounded-xl" />
                    {errors.offereeName && <p className="text-sm font-medium text-destructive">{errors.offereeName.message}</p>}
                    <Input {...register('offereeEmail')} type="email" placeholder="Their Email" className="p-4 h-auto rounded-xl" />
                    {errors.offereeEmail && <p className="text-sm font-medium text-destructive">{errors.offereeEmail.message}</p>}
                </div>
                <p className="text-xs text-muted-foreground px-1">We'll send them a secure link to review and sign.</p>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-foreground dark:text-gray-200 text-base font-bold">Description of the Deal</label>
                <Textarea {...register('terms')} placeholder="Be clear about the deliverables and timeline. What are the core expectations for both sides?" className="min-h-[160px] rounded-xl p-4" />
                {errors.terms && <p className="text-sm font-medium text-destructive">{errors.terms.message}</p>}
            </div>
             <div className="flex justify-end gap-4">
                <Button onClick={handleNext} disabled={isPending} className="h-12 px-6 rounded-xl flex-[2] bg-primary text-white font-bold shadow-lg shadow-primary/20 transition-all">
                    {isPending ? <Loader2 className="animate-spin" /> : "Next: Define Terms"}
                    {!isPending && <ArrowRight className="ml-2 w-5 h-5" />}
                </Button>
            </div>
        </div>
    );
}

function Step2({ onNext, onBack }: { onNext: () => Promise<void>, onBack: () => void }) {
    const { register, formState: { errors } } = useFormContext<OfferFormData>();
    const [isPending, startTransition] = useTransition();

    const handleNext = () => {
        startTransition(async () => {
            await onNext();
        });
    }

    return (
        <div className="flex-1 space-y-8">
            <div className="flex flex-col gap-2">
                <label className="text-foreground dark:text-gray-200 text-base font-bold">Total Payment (Optional)</label>
                <div className='relative'>
                    <DollarSign className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
                    <Input {...register('paymentAmount')} placeholder="1,200.00" className="p-4 pl-12 h-auto rounded-xl" />
                </div>
                {errors.paymentAmount && <p className="text-sm font-medium text-destructive">{errors.paymentAmount.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-foreground dark:text-gray-200 text-base font-bold">Due Date (Optional)</label>
                 <div className='relative'>
                    <Calendar className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
                    <Input {...register('paymentDueDate')} placeholder="e.g., Oct 24" className="p-4 pl-12 h-auto rounded-xl" />
                </div>
                {errors.paymentDueDate && <p className="text-sm font-medium text-destructive">{errors.paymentDueDate.message}</p>}
            </div>
            
            <div className="flex justify-between gap-4">
                <Button type="button" variant="outline" onClick={onBack} disabled={isPending} className="h-12 px-6 rounded-xl">
                    <ArrowLeft className="mr-2" /> Back
                </Button>
                <Button onClick={handleNext} disabled={isPending} className="h-12 px-6 rounded-xl flex-[2] bg-primary text-white font-bold shadow-lg shadow-primary/20 transition-all">
                     {isPending ? <Loader2 className="animate-spin" /> : "Next: Review"}
                    {!isPending && <ArrowRight className="ml-2 w-5 h-5" />}
                </Button>
            </div>
        </div>
    );
}

function Step3({ onBack }: { onBack: () => void }) {
    const { getValues } = useFormContext<OfferFormData>();
    const data = getValues();
    const offeror = DUMMY_USER;

    return (
        <div className="flex-1">
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
                                <AvatarFallback className="bg-accent text-white font-bold">{getInitials(data.offereeName || 'C')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-foreground dark:text-white font-bold leading-none">{data.offereeName}</p>
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
                           "{data.terms}"
                        </p>
                    </div>
                </div>
                {(data.paymentAmount || data.paymentDueDate) && (
                     <div className="grid grid-cols-2 gap-4">
                        {data.paymentAmount && (
                            <div className="bg-primary/5 dark:bg-primary/20 p-4 rounded-lg">
                                <p className="text-primary/50 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Payment</p>
                                <p className="text-primary dark:text-white text-xl font-extrabold">{data.paymentAmount}</p>
                            </div>
                        )}
                        {data.paymentDueDate && (
                            <div className="bg-primary/5 dark:bg-primary/20 p-4 rounded-lg">
                                <p className="text-primary/50 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Due Date</p>
                                <p className="text-primary dark:text-white text-xl font-extrabold">{data.paymentDueDate}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="p-6">
                 <Button type="button" variant="ghost" onClick={onBack} className="h-12 px-6 rounded-xl flex items-center justify-center gap-2 w-full">
                    <Edit className="w-4 h-4" /> Edit
                </Button>
            </div>
        </div>
    );
}

export function CreateOfferForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const methods = useForm<OfferFormData>({
        resolver: zodResolver(offerSchema),
        defaultValues: {
            title: '',
            offereeEmail: '',
            offereeName: '',
            terms: '',
            paymentAmount: '',
            paymentDueDate: '',
        },
    });
    const { trigger, handleSubmit } = methods;

    const nextStep = async () => {
        const fields = steps[currentStep - 1].fields as FieldName[];
        const output = await trigger(fields, { shouldFocus: true });
        if (!output) return;

        if (currentStep < 3) {
            setCurrentStep(step => step + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(step => step - 1);
        }
    };

    const processForm = (data: OfferFormData) => {
        startTransition(async () => {
            const result = await createOffer({
                ...data,
                offerorName: DUMMY_USER.name,
                offerorEmail: DUMMY_USER.email,
                offerees: [{ name: data.offereeName, email: data.offereeEmail }]
            });
            if (result.success && result.offer) {
                toast({ title: "Handshake Sent!", description: "Your offer has been sent for review." });
                router.push(`/offers/${result.offer.id}`);
            } else {
                toast({
                    title: "Error Creating Offer",
                    description: result.message || "An unexpected error occurred.",
                    variant: "destructive",
                });
            }
        });
    };

    const stepInfo = steps[currentStep - 1];

    return (
        <FormProvider {...methods}>
            <div className="flex flex-col h-full">
                <header className="sticky top-0 z-10 bg-background/80 dark:bg-background-dark/80 backdrop-blur-md">
                    <div className="flex items-center p-4 justify-between max-w-lg mx-auto w-full">
                        <Button variant="ghost" size="icon" onClick={() => currentStep === 1 ? router.back() : prevStep()}>
                            {currentStep === 1 ? <X /> : <ArrowLeft />}
                        </Button>
                        <h1 className="text-foreground dark:text-white text-lg font-bold tracking-tight">New Agreement</h1>
                        <Button variant="ghost" size="icon">
                            <Info className="text-primary dark:text-primary/50" />
                        </Button>
                    </div>
                </header>
                <main className="flex-1 max-w-lg mx-auto w-full flex flex-col">
                    <div className="p-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-primary font-bold text-xs uppercase tracking-widest">Step {currentStep} of 3</span>
                                    <h2 className="text-foreground dark:text-white text-2xl font-extrabold">{stepInfo.name}</h2>
                                </div>
                                <p className="text-primary font-bold text-lg">{Math.round((currentStep / 3) * 100)}%</p>
                            </div>
                            <Progress value={(currentStep / 3) * 100} className="h-2.5" />
                        </div>
                    </div>
                    <form onSubmit={handleSubmit(processForm)} className="flex-1 px-6 space-y-6 pb-32">
                        {currentStep === 1 && <Step1 onNext={nextStep} />}
                        {currentStep === 2 && <Step2 onNext={nextStep} onBack={prevStep} />}
                        {currentStep === 3 && <Step3 onBack={prevStep} />}
                    </form>
                </main>
                 {currentStep === 3 && (
                    <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/95 to-transparent dark:from-background-dark dark:via-background-dark/95">
                        <div className="max-w-lg mx-auto flex gap-4">
                            <Button onClick={handleSubmit(processForm)} disabled={isPending} className="h-14 rounded-xl flex-1 bg-primary text-white font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                                {isPending ? <Loader2 className="animate-spin" /> : "Send Handshake"}
                                {!isPending && <HandshakeIcon className="w-5 h-5" />}
                            </Button>
                        </div>
                    </footer>
                 )}
            </div>
        </FormProvider>
    );
}
