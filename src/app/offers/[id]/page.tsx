import { getOfferById } from "@/lib/data";
import { notFound } from "next/navigation";
import { OfferDetails } from "./offer-details";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";


export default async function OfferPage({ params }: { params: { id: string } }) {
  const offer = await getOfferById(params.id);

  if (!offer) {
    notFound();
  }

  // This check is a simplified stand-in for real auth
  // In a real app, you'd check if the logged-in user is the offeror or offeree
  const canView = true; 

  if (!canView) {
     return (
        <div className="container mx-auto px-4 py-12 md:py-24">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertCircle className="text-destructive"/> Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You do not have permission to view this offer.</p>
                </CardContent>
            </Card>
        </div>
     )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <OfferDetails offer={offer} />
      </div>
    </div>
  );
}
