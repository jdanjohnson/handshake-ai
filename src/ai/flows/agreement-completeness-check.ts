// agreement-completeness-check.ts
'use server';

/**
 * @fileOverview Uses generative AI to check if an agreement has all important details.
 *
 * - agreementCompletenessCheck - A function that checks the completeness of an agreement.
 * - AgreementCompletenessCheckInput - The input type for the agreementCompletenessCheck function.
 * - AgreementCompletenessCheckOutput - The return type for the agreementCompletenessCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AgreementCompletenessCheckInputSchema = z.object({
  agreementText: z
    .string()
    .describe('The text of the agreement to check for completeness.'),
});
export type AgreementCompletenessCheckInput = z.infer<
  typeof AgreementCompletenessCheckInputSchema
>;

const AgreementCompletenessCheckOutputSchema = z.object({
  isComplete: z
    .boolean()
    .describe('Whether the agreement appears to be complete.'),
  missingDetails: z
    .array(z.string())
    .describe('A list of important details that seem to be missing.'),
  suggestions: z
    .array(z.string())
    .describe('Suggestions for what to add to the agreement.'),
});
export type AgreementCompletenessCheckOutput = z.infer<
  typeof AgreementCompletenessCheckOutputSchema
>;

export async function agreementCompletenessCheck(
  input: AgreementCompletenessCheckInput
): Promise<AgreementCompletenessCheckOutput> {
  return agreementCompletenessCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'agreementCompletenessCheckPrompt',
  input: {schema: AgreementCompletenessCheckInputSchema},
  output: {schema: AgreementCompletenessCheckOutputSchema},
  prompt: `You are a legal expert reviewing an agreement to ensure it is complete.

  Analyze the following agreement text and determine if any important details are missing.
  Provide a list of any missing details and suggestions for what to add to the agreement to make it more complete.

  Agreement Text: {{{agreementText}}}

  Your response should be formatted as a JSON object with the following keys:
  - isComplete: true if the agreement appears complete, false otherwise.
  - missingDetails: A list of important details that seem to be missing.
  - suggestions: Suggestions for what to add to the agreement.
  `,
});

const agreementCompletenessCheckFlow = ai.defineFlow(
  {
    name: 'agreementCompletenessCheckFlow',
    inputSchema: AgreementCompletenessCheckInputSchema,
    outputSchema: AgreementCompletenessCheckOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
