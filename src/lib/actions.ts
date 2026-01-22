'use server';

import { z } from 'zod';
import { addOffer, updateOfferStatus, getOfferById } from './data';
import { revalidatePath } from 'next/cache';
import { analyzeAgreement, AgreementAnalysisOutput } from '@/ai/flows/agreement-analysis';


const offereeSchema = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  email: z.string().email({ message: "A valid email is required." }),
});

const offerSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  offerorName: z.string(),
  offerorEmail: z.string().email(),
  offerees: z.array(offereeSchema).min(1, "At least one other party is required."),
  terms: z.string().min(20, { message: "The deal description must be at least 20 characters." }),
  paymentAmount: z.string().optional(),
  paymentDueDate: z.string().optional(),
});


export async function createOffer(data: unknown) {
    const validatedFields = offerSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Validation failed. Please check your input.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const newOffer = await addOffer(validatedFields.data);
        revalidatePath('/');
        revalidatePath('/vault');
        revalidatePath(`/offers/${newOffer.id}`);

        return { success: true, offer: newOffer };
    } catch (error) {
        console.error(error);
        return {
            success: false,
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
        revalidatePath('/');
        revalidatePath('/vault');
        revalidatePath(`/offers/${offerId}`);
        return { success: true, message: 'Offer accepted!' };
    } catch (error) {
        return { success: false, message: 'Failed to accept offer.' };
    }
}

export async function analyzeAgreementTerms(terms: string): Promise<AgreementAnalysisOutput | { error: string }> {
    if (!terms || terms.length < 20) {
        return { error: "Please enter at least 20 characters of your agreement terms to analyze." }
    }
    try {
        const result = await analyzeAgreement({ agreementText: terms });
        return result;
    } catch (e) {
        console.error(e);
        return { error: "An unexpected error occurred while analyzing the agreement." }
    }
}

export async function getOffer(id: string) {
    return await getOfferById(id);
}
