import { CreateOfferForm } from "./create-offer-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus2 } from "lucide-react";

export default function NewOfferPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <FilePlus2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-headline text-2xl">Create a New Offer</CardTitle>
                <CardDescription>
                  Define the terms of your agreement. Our AI can help you check for completeness.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CreateOfferForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
