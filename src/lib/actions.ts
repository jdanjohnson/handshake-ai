'use server';

import { z } from 'zod';
import { addOffer, updateOfferStatus } from './data';
import { revalidatePath } from 'next/cache';
import { agreementCompletenessCheck } from '@/ai/flows/agreement-completeness-check';

const offerSchema = z.object({
    agreementType: z.string().min(1, "Please select an agreement type."),
    customAgreementType: z.string().optional(),
    offerorName: z.string().min(2, 'Your name is required'),
    offerorEmail: z.string().email('A valid email for you is required'),
    offereeName: z.string().min(2, 'Their name is required'),
    offereeEmail: z.string().email('A valid email for them is required'),
    terms: z.string().min(20, 'Agreement terms must be at least 20 characters'),
    location: z.string().optional(),
}).refine(data => {
    if (data.agreementType === 'Other') {
        return !!data.customAgreementType && data.customAgreementType.trim().length > 2;
    }
    return true;
}, {
    message: "Please specify the agreement type (at least 3 characters).",
    path: ["customAgreementType"],
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
        const { agreementType, customAgreementType, ...rest } = validatedFields.data;
        const title = agreementType === 'Other' && customAgreementType ? customAgreementType : agreementType;

        const newOffer = await addOffer({ ...rest, title });
        revalidatePath('/dashboard');
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
