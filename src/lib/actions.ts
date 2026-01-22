'use server';

import { z } from 'zod';
import { addOffer, updateOfferStatus, getOfferById } from './data';
import { revalidatePath } from 'next/cache';
import { agreementCompletenessCheck } from '@/ai/flows/agreement-completeness-check';

const offerSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  offerorName: z.string(),
  offerorEmail: z.string().email(),
  offerees: z.array(z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email." }),
  })).min(1),
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

export async function getOffer(id: string) {
    return await getOfferById(id);
}
