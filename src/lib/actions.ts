'use server';

import { z } from 'zod';
import { addOffer, updateOfferStatus, getOfferById } from './data';
import { revalidatePath } from 'next/cache';
import { agreementCompletenessCheck } from '@/ai/flows/agreement-completeness-check';

const offerSchema = z.object({
    agreementType: z.string().min(1, { message: "Please select an agreement type." }),
    customAgreementType: z.string().optional(),
    offerorName: z.string().min(2, 'Your name is required'),
    offerorEmail: z.string().email('A valid email for you is required'),
    offerees: z.array(z.object({
        name: z.string().min(2, { message: "Name must be at least 2 characters." }),
        email: z.string().email({ message: "Please enter a valid email." }),
    })).min(1, { message: "At least one other party is required." }),
    terms: z.string().min(20, 'The agreement purpose must be at least 20 characters'),
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
        revalidatePath('/');
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
