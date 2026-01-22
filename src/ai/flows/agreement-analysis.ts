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

const AgreementAnalysisInputSchema = z.object({
  agreementText: z.string().describe('The text of the agreement to analyze.'),
});
export type AgreementAnalysisInput = z.infer<
  typeof AgreementAnalysisInputSchema
>;

const AgreementAnalysisOutputSchema = z.object({
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

const analysisPrompt = ai.definePrompt({
  name: 'agreementAnalysisPrompt',
  input: { schema: AgreementAnalysisInputSchema },
  output: { schema: AgreementAnalysisOutputSchema },
  prompt: `You are a helpful legal assistant. Your goal is to analyze a simple agreement text for potential issues, providing a "legal health" score and actionable recommendations.

  Analyze the following agreement text for its fairness, clarity, and completeness.
  
  - Provide a score from 0-100 representing the overall quality of the agreement. A higher score means the agreement is clearer, fairer, and more complete.
  - Provide a one-sentence conversational summary of your analysis results.
  - Provide a list of specific recommendations. These can be areas for 'improvement' (like vague language or missing terms) or 'positive' aspects (like clear and fair terms).
  
  Here is the agreement text:
  
  '''
  {{{agreementText}}}
  '''`,
});

const analysisFlow = ai.defineFlow(
  {
    name: 'agreementAnalysisFlow',
    inputSchema: AgreementAnalysisInputSchema,
    outputSchema: AgreementAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await analysisPrompt(input);
    return output!;
  }
);

export async function analyzeAgreement(
  input: AgreementAnalysisInput
): Promise<AgreementAnalysisOutput> {
  return analysisFlow(input);
}
