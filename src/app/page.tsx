'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, Settings, Search, Calendar, User, Plus } from 'lucide-react';

import type { Offer } from '@/lib/data';
import { mockOffers } from '@/lib/data'; // Using static mock data
import { placeholderImages } from '@/lib/placeholder-images';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';


function getStatusPill(status: Offer['status']) {
  switch (status) {
    case 'accepted':
      return <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs py-1 px-2">ACTIVE</Badge>;
    case 'pending':
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs py-1 px-2">WAITING FOR SIGN</Badge>;
    case 'draft':
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs py-1 px-2">DRAFT</Badge>;
  }
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'history'>('active');

  const filteredOffers = useMemo(() => {
    const allOffers = mockOffers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    switch (activeTab) {
      case 'active':
        return allOffers.filter(o => o.status === 'accepted' || o.status === 'draft');
      case 'pending':
        return allOffers.filter(o => o.status === 'pending');
      case 'history':
        // For now, let's consider all non-pending as history for demo
        return allOffers.filter(o => o.status === 'accepted'); 
      default:
        return allOffers;
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://picsum.photos/seed/user/100/100" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-medium text-muted-foreground">HANDSHAKE</p>
              <h1 className="text-xl font-bold">Agreements</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="h-6 w-6 text-muted-foreground" />
            <Settings className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search agreements, names, or dates..." className="pl-10 h-11 bg-card border-border" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-2">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/80">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4 mt-6">
          {filteredOffers.map(offer => {
            const withParty = offer.offerees.map(o => o.name).join(', ');
            const imageKey = offer.imageUrl;
            const placeholder = placeholderImages[imageKey as keyof typeof placeholderImages] || placeholderImages.default;

            return (
              <Card key={offer.id} className="shadow-sm hover:shadow-md transition-shadow duration-300">
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
                      <span>{new Date(offer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
        </div>
      </main>
      
       <Button asChild className="fixed bottom-24 right-6 h-16 w-16 rounded-full shadow-lg bg-primary hover:bg-primary/90">
            <Link href="/offers/new">
                <Plus className="h-8 w-8" />
                <span className="sr-only">New Agreement</span>
            </Link>
        </Button>
    </div>
  );
}
