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
  
  // This is a mock implementation
  console.log("Generating description for title:", input.title);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const MOCK_CAMERA_DESCRIPTION = "This agreement covers the loan of a digital camera from Party A to Party B for personal use during a vacation. The loan period is approximately one week, and the camera is to be returned in the same condition it was received.";

  return {
    description: MOCK_CAMERA_DESCRIPTION
  };
}
