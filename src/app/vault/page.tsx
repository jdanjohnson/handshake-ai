'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, Search, Plus } from 'lucide-react';

import type { Offer } from '@/lib/data';
import { mockOffers } from '@/lib/data';
import placeholderImages from '@/app/lib/placeholder-images.json';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BottomNav from '@/components/common/bottom-nav';


function getStatusPill(status: Offer['status']) {
  switch (status) {
    case 'accepted':
      return <Badge variant="secondary" className="bg-green-100 text-green-800">ACCEPTED</Badge>;
    case 'pending':
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">PENDING</Badge>;
    case 'draft':
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">DRAFT</Badge>;
  }
}

export default function VaultPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'drafts'>('active');

  const filteredOffers = useMemo(() => {
    const allOffers = mockOffers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    switch (activeTab) {
      case 'active':
        return allOffers.filter(o => o.status === 'accepted');
      case 'drafts':
        return allOffers.filter(o => o.status === 'draft');
      default:
        return [];
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 bg-background sticky top-0 z-10">
        <h1 className="text-xl font-bold">My Vault</h1>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search agreements, names, or dates..." className="pl-10 h-11 bg-card border-border rounded-xl" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-2 pb-24">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/80 rounded-xl">
            <TabsTrigger value="active" className="rounded-lg">Active</TabsTrigger>
            <TabsTrigger value="drafts" className="rounded-lg">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4 mt-6">
          {filteredOffers.map(offer => {
            const withParty = offer.offerees.map(o => o.name).join(', ');
            const imageKey = offer.imageUrl;
            const placeholder = placeholderImages[imageKey as keyof typeof placeholderImages] || placeholderImages.default;

            return (
              <Card key={offer.id} className="shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusPill(offer.status)}
                    </div>
                    <h2 className="font-bold text-lg truncate">{offer.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <User className="w-4 h-4" />
                      <span>with {withParty}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(offer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3">
                     <Image
                        src={placeholder.src}
                        alt={offer.title}
                        width={64}
                        height={64}
                        data-ai-hint={placeholder.hint}
                        className="rounded-full object-cover aspect-square"
                      />
                    <Button asChild variant="secondary" size="sm" className="rounded-full px-4">
                      <Link href={offer.status === 'draft' ? `/offers/new?id=${offer.id}` : `/offers/${offer.id}`}>
                        {offer.status === 'draft' ? 'Continue' : 'View Detail'}
                      </Link>
                    </Button>
                  </div>

                </CardContent>
              </Card>
            )
          })}
           {filteredOffers.length === 0 && (
            <div className='text-center py-16'>
                <p className='text-muted-foreground'>No {activeTab} found.</p>
            </div>
          )}
        </div>
      </main>
      
       <Button asChild className="fixed bottom-24 right-6 h-16 w-16 rounded-full shadow-lg bg-primary hover:bg-primary/90">
            <Link href="/offers/new">
                <Plus className="h-8 w-8" />
                <span className="sr-only">New Agreement</span>
            </Link>
        </Button>
        <BottomNav />
    </div>
  );
}
