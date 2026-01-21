// In a real application, this would be a database.
// For this example, we're using an in-memory array.

export type Offeree = {
  name: string;
  email: string;
};

export type SpecificTerm = {
  title: string;
  description: string;
};

export type Offer = {
  id: string;
  title: string;
  terms: string;
  specificTerms?: SpecificTerm[];
  paymentAmount?: string;
  paymentDueDate?: string;
  paymentMethod?: string;
  duration?: string;
  location?: string;
  offerorName: string;
  offerorEmail: string;
  offerees: Offeree[];
  status: 'pending' | 'accepted' | 'draft';
  createdAt: Date;
  acceptedAt: Date | null;
  imageUrl: string;
};

// Renamed to avoid conflicts if you choose to fetch later.
export const mockOffers: Offer[] = [
    {
        id: 'creative-collab-1',
        title: 'Creative Project Collab',
        terms: 'Create 3 logo concepts for a new startup. One final logo will be chosen with up to 3 revision rounds. Final assets delivered in SVG and PNG formats.',
        offerorName: 'Jadan',
        offerorEmail: 'iamjadan@gmail.com',
        offerees: [{ name: 'Sarah Jenkins', email: 'design@creative.co' }],
        status: 'pending',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
        acceptedAt: null,
        location: 'New York, NY',
        specificTerms: [
            { title: 'Deliverable 1', description: '3 initial logo concepts.' },
            { title: 'Revisions', description: 'Up to 3 rounds of revisions on the chosen concept.' },
            { title: 'Final Delivery', description: 'Final logo in SVG and PNG formats.' },
        ],
        paymentAmount: '$1,200',
        paymentDueDate: 'Upon final delivery',
        paymentMethod: 'Bank Transfer',
        imageUrl: 'creative-project'
    },
    {
        id: 'equipment-rental-2',
        title: 'Equipment Rental',
        terms: 'Provide 10 hours of marketing consulting over the next month. Focus on social media strategy and content planning. Billed at $150/hour.',
        offerorName: 'Mike Ross',
        offerorEmail: 'mike@ross.com',
        offerees: [{ name: 'Jadan', email: 'iamjadan@gmail.com' }],
        status: 'accepted',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 20)),
        acceptedAt: new Date(new Date().setDate(new Date().getDate() - 18)),
        duration: '1 month from start date.',
        imageUrl: 'equipment-rental'
    },
    {
        id: 'consulting-agreement-3',
        title: 'Consulting Agreement',
        terms: 'Consulting services for Q3.',
        offerorName: 'Jessica Pearson',
        offerorEmail: 'jessica@pearson.com',
        offerees: [{ name: 'Jadan', email: 'iamjadan@gmail.com' }],
        status: 'draft',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 30)),
        acceptedAt: null,
        location: 'Chicago, IL',
        imageUrl: 'consulting-agreement'
    },
    {
        id: 'lease-agreement-4',
        title: 'Apartment Lease Agreement',
        terms: '12-month lease for apartment #4B at 123 Main St. Rent is $2000/month, due on the 1st. Security deposit of $2000 required. No pets allowed. Tenant responsible for utilities.',
        offerorName: 'City Apartments',
        offerorEmail: 'leasing@cityapts.com',
        offerees: [{ name: 'Jadan', email: 'iamjadan@gmail.com' }],
        status: 'pending',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
        acceptedAt: null,
        location: '123 Main St, Anytown, USA',
        imageUrl: 'lease-agreement'
    },
    {
        id: 'writing-contract-5',
        title: 'Freelance Writing Contract',
        terms: 'Write four 1000-word blog posts on the topic of sustainable travel. SEO keywords will be provided. All articles must be original and pass plagiarism checks. Delivery schedule: one article per week.',
        offerorName: 'Content Factory',
        offerorEmail: 'editor@contentfactory.com',
        offerees: [{ name: 'Jadan', email: 'iamjadan@gmail.com' }],
        status: 'accepted',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 10)),
        acceptedAt: new Date(new Date().setDate(new Date().getDate() - 8)),
        imageUrl: 'writing-contract'
    },
];

let offers = [...mockOffers]; // Create a mutable copy

export async function getOffersByEmail(email: string) {
  return offers.filter(
    (offer) => offer.offerorEmail.toLowerCase() === email.toLowerCase() || offer.offerees.some(offeree => offeree.email.toLowerCase() === email.toLowerCase())
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getOfferById(id: string) {
  return offers.find((offer) => offer.id === id) || null;
}

export async function addOffer(offerData: Omit<Offer, 'id' | 'status' | 'createdAt' | 'acceptedAt' | 'imageUrl'>) {
    const newOffer: Offer = {
        ...offerData,
        id: (Math.random() + 1).toString(36).substring(2),
        status: 'pending',
        createdAt: new Date(),
        acceptedAt: null,
        imageUrl: 'default',
    };
    offers.unshift(newOffer);
    return newOffer;
}

export async function updateOfferStatus(id: string, status: 'accepted') {
    const offerIndex = offers.findIndex((offer) => offer.id === id);
    if (offerIndex !== -1) {
        if (status === 'accepted') {
            offers[offerIndex].status = 'accepted';
            offers[offerIndex].acceptedAt = new Date();
        }
        return offers[offerIndex];
    }
    return null;
}
