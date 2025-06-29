'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createOffer, checkCompleteness } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import type { AgreementCompletenessCheckOutput } from '@/ai/flows/agreement-completeness-check';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Loader2, Send, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto" size="lg">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2" />}
      Create & Send Offer
    </Button>
  );
}

export function CreateOfferForm() {
  const [formState, action] = useFormState(createOffer, { message: '' });
  const [terms, setTerms] = useState('');
  const [aiResult, setAiResult] = useState<AgreementCompletenessCheckOutput & { error?: string } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckCompleteness = async () => {
    setIsChecking(true);
    setAiResult(null);
    const result = await checkCompleteness(terms);
    setAiResult(result);
    setIsChecking(false);
  };

  return (
    <form action={action} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Offer Title</Label>
          <Input id="title" name="title" placeholder="e.g., Website Design Contract" required />
          {formState.errors?.title && <p className="text-sm font-medium text-destructive">{formState.errors.title[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="offerorName">Your Name</Label>
          <Input id="offerorName" name="offerorName" placeholder="Your Full Name" required />
           {formState.errors?.offerorName && <p className="text-sm font-medium text-destructive">{formState.errors.offerorName[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="offerorEmail">Your Email</Label>
          <Input id="offerorEmail" name="offerorEmail" type="email" placeholder="you@example.com" required />
           {formState.errors?.offerorEmail && <p className="text-sm font-medium text-destructive">{formState.errors.offerorEmail[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="offereeName">Their Name</Label>
          <Input id="offereeName" name="offereeName" placeholder="Their Full Name" required />
          {formState.errors?.offereeName && <p className="text-sm font-medium text-destructive">{formState.errors.offereeName[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="offereeEmail">Their Email</Label>
          <Input id="offereeEmail" name="offereeEmail" type="email" placeholder="them@example.com" required />
           {formState.errors?.offereeEmail && <p className="text-sm font-medium text-destructive">{formState.errors.offereeEmail[0]}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="terms">Agreement Terms</Label>
        <Textarea
          id="terms"
          name="terms"
          placeholder="Describe the terms of your agreement here..."
          rows={8}
          required
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
        />
        {formState.errors?.terms && <p className="text-sm font-medium text-destructive">{formState.errors.terms[0]}</p>}
      </div>

      {aiResult && (
        <Card className="bg-secondary/50">
          <CardContent className="pt-6">
            {aiResult.error ? (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{aiResult.error}</AlertDescription>
                 </Alert>
            ) : (
                <div className="space-y-4">
                    {aiResult.isComplete ? (
                        <Alert variant="default" className="bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700">
                             <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertTitle className="text-green-800 dark:text-green-300">Looks Good!</AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-400">
                                This agreement appears to be comprehensive.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Potentially Missing Details</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc pl-5 mt-2">
                                    {aiResult.missingDetails?.map((detail, i) => <li key={i}>{detail}</li>)}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {aiResult.suggestions && aiResult.suggestions.length > 0 && (
                         <Alert>
                            <Lightbulb className="h-4 w-4" />
                            <AlertTitle>Suggestions for Improvement</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc pl-5 mt-2">
                                    {aiResult.suggestions.map((suggestion, i) => <li key={i}>{suggestion}</li>)}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            )}
            
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
        <Button
            type="button"
            variant="outline"
            onClick={handleCheckCompleteness}
            disabled={isChecking || terms.length < 20}
            className="w-full sm:w-auto"
        >
            {isChecking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2" />}
            AI Completeness Check
        </Button>
        <SubmitButton />
      </div>
      {formState.message && !formState.errors && <p className="text-sm font-medium text-destructive">{formState.message}</p>}
    </form>
  );
}
