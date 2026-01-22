'use server';
/**
 * @fileOverview A legal agreement analysis AI agent.
 *
 * - analyzeAgreement - A function that analyzes the completeness and fairness of a legal agreement.
 * - AgreementAnalysisInput - The input type for the analyzeAgreement function.
 * - AgreementAnalysisOutput - The return type for the analyzeAgreement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AgreementAnalysisInputSchema = z.object({
  agreementText: z.string().describe('The text of the agreement to analyze.'),
});
export type AgreementAnalysisInput = z.infer<
  typeof AgreementAnalysisInputSchema
>;

export const AgreementAnalysisOutputSchema = z.object({
  score: z
    .number()
    .describe(
      'A score from 0-100 representing the legal health of the agreement. Higher is better.'
    ),
  summary: z
    .string()
    .describe('A one-sentence conversational summary of the analysis results.'),
  recommendations: z
    .array(
      z.object({
        title: z.string().describe('A short, clear title for the recommendation.'),
        description: z
          .string()
          .describe('A detailed explanation of the recommendation.'),
        type: z
          .enum(['positive', 'improvement'])
          .describe(
            'Whether the recommendation is pointing out a positive aspect or an area for improvement.'
          ),
      })
    )
    .describe('A list of recommendations to improve the agreement.'),
});
export type AgreementAnalysisOutput = z.infer<
  typeof AgreementAnalysisOutputSchema
>;

export async function analyzeAgreement(
  input: AgreementAnalysisInput
): Promise<AgreementAnalysisOutput> {
  return agreementAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'agreementAnalysisPrompt',
  input: {schema: AgreementAnalysisInputSchema},
  output: {schema: AgreementAnalysisOutputSchema},
  prompt: `You are an expert legal AI specializing in reviewing simple contracts and handshake deals for fairness, completeness, and clarity. Your tone is helpful, professional, and reassuring.

  Analyze the following agreement text. Based on your analysis, provide:
  1.  A "Legal Health Score" from 0 to 100. A score of 100 means the agreement is perfectly clear, fair, and complete. A score of 0 means it is critically flawed.
      -   Deduct points for vague language (e.g., "soon", "reasonable effort").
      -   Deduct points for missing essential details (e.g., no deadline, no payment amount, unclear deliverables).
      -   Deduct points for terms that seem one-sided or unfair.
      -   Award points for clarity, specificity, and balanced terms.
  2.  A list of specific recommendations. Each recommendation should have a title, a description, and a type ('positive' for things done well, 'improvement' for things to fix). Focus on actionable advice.
  3.  A short, one-sentence conversational summary of your findings for the user.

  Agreement Text:
  {{{agreementText}}}

  Provide your response ONLY in the specified JSON format.
  `,
});

const agreementAnalysisFlow = ai.defineFlow(
  {
    name: 'agreementAnalysisFlow',
    inputSchema: AgreementAnalysisInputSchema,
    outputSchema: AgreementAnalysisOutputSchema,
  },
  async input => {
    // A real implementation might have more logic here, like retrieving user context or calling other tools.
    const {output} = await prompt(input);
    return output!;
  }
);
