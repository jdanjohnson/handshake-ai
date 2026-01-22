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

export async function generateDescription(
  input: DescriptionGeneratorInput
): Promise<DescriptionGeneratorOutput> {
  return descriptionGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'descriptionGeneratorPrompt',
  input: {schema: DescriptionGeneratorInputSchema},
  output: {schema: DescriptionGeneratorOutputSchema},
  prompt: `You are a helpful assistant that helps users draft simple legal agreements.
  Based on the following agreement title, write a clear, concise, one-paragraph description of the deal.
  This description will be the starting point for the user's agreement.

  Focus on key actions and deliverables. For example, if the title is "Freelance Website Design", the description could be:
  "Party A will design and develop a 5-page website for Party B. Deliverables include mockups, development, and deployment. Party B will provide all necessary content. The project is expected to be completed within 4 weeks."

  Agreement Title:
  {{{title}}}

  Provide your response ONLY in the specified JSON format.
  `,
});

const descriptionGeneratorFlow = ai.defineFlow(
  {
    name: 'descriptionGeneratorFlow',
    inputSchema: DescriptionGeneratorInputSchema,
    outputSchema: DescriptionGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
