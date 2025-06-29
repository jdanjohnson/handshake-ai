'use server';

import { z } from 'zod';
import { addOffer, updateOfferStatus } from './data';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { agreementCompletenessCheck } from '@/ai/flows/agreement-completeness-check';

const offerSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    offerorName: z.string().min(2, 'Your name is required'),
    offerorEmail: z.string().email('A valid email for you is required'),
    offereeName: z.string().min(2, 'Their name is required'),
    offereeEmail: z.string().email('A valid email for them is required'),
    terms: z.string().min(20, 'Agreement terms must be at least 20 characters'),
});

export type FormState = {
    message: string;
    errors?: {
        title?: string[];
        offerorName?: string[];
        offerorEmail?: string[];
        offereeName?: string[];
        offereeEmail?: string[];
        terms?: string[];
    };
};

export async function createOffer(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = offerSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: 'Validation failed. Please check your input.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const newOffer = await addOffer(validatedFields.data);
        revalidatePath('/dashboard');
        revalidatePath(`/offers/${newOffer.id}`);
        redirect(`/offers/${newOffer.id}`);
    } catch (error) {
        return {
            message: 'Failed to create offer. Please try again.',
        };
    }
}


export async function acceptOffer(offerId: string, offereeEmail: string) {
    try {
        const updatedOffer = await updateOfferStatus(offerId, 'accepted');
        if (!updatedOffer) {
            throw new Error("Offer not found.");
        }
        revalidatePath('/dashboard');
        revalidatePath(`/offers/${offerId}`);
        return { success: true, message: 'Offer accepted!' };
    } catch (error) {
        return { success: false, message: 'Failed to accept offer.' };
    }
}

export async function checkCompleteness(terms: string) {
    if (!terms || terms.length < 20) {
        return { error: "Please enter at least 20 characters of your agreement terms to check." }
    }
    try {
        const result = await agreementCompletenessCheck({ agreementText: terms });
        return result;
    } catch (e) {
        console.error(e);
        return { error: "An unexpected error occurred while checking the agreement." }
    }
}
