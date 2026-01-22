'use server';
/**
 * @fileOverview An AI agent for generating deal descriptions.
 *
 * - generateDescription - A function that generates a deal description from a title.
 * - DescriptionGeneratorInput - The input type for the generateDescription function.
 * - DescriptionGeneratorOutput - The return type for the generateDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DescriptionGeneratorInputSchema = z.object({
  title: z.string().describe('The title of the agreement.'),
});
export type DescriptionGeneratorInput = z.infer<
  typeof DescriptionGeneratorInputSchema
>;

const DescriptionGeneratorOutputSchema = z.object({
    description: z.string().describe('A one-paragraph description of the deal.')
});
export type DescriptionGeneratorOutput = z.infer<
  typeof DescriptionGeneratorOutputSchema
>;

const descriptionPrompt = ai.definePrompt({
  name: 'descriptionGeneratorPrompt',
  input: { schema: DescriptionGeneratorInputSchema },
  output: { schema: DescriptionGeneratorOutputSchema },
  prompt: `You are a helpful assistant who is an expert at writing simple, clear legal agreements.

  Based on the provided agreement title, generate a concise, one-paragraph description for the deal. This description will serve as the starting point for a simple legal agreement.
  
  Focus on clarity and simplicity. The description should cover the essential purpose of the agreement.
  
  Agreement Title: {{{title}}}
  `,
});

const descriptionFlow = ai.defineFlow({
  name: 'descriptionGeneratorFlow',
  inputSchema: DescriptionGeneratorInputSchema,
  outputSchema: DescriptionGeneratorOutputSchema,
}, async (input) => {
  const { output } = await descriptionPrompt(input);
  return output!;
});

export async function generateDescription(
  input: DescriptionGeneratorInput
): Promise<DescriptionGeneratorOutput> {
  return descriptionFlow(input);
}
