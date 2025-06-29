import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus2, LayoutDashboard, Handshake } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="text-center max-w-3xl mx-auto">
        <Handshake className="w-16 h-16 mx-auto text-primary mb-4" />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground mb-4 font-headline">
          Handshake Legal
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          Where every agreement begins with a simple, secure digital handshake.
          Create, share, and finalize legal exchanges with confidence and clarity.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/offers/new">
              <FilePlus2 className="mr-2" /> Create a New Offer
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2" /> View My Agreements
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-primary">1</span>
              <span>Create an Offer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Draft the terms of your exchange. Our AI tool can help ensure you've covered all the important details.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-primary">2</span>
              <span>Share Securely</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Generate a unique, private link to send to the other party. Only they can view and accept your offer.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-primary">3</span>
              <span>Seal with a Handshake</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Once they accept with a digital handshake, a simple, legally enforceable agreement is generated for both parties.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
