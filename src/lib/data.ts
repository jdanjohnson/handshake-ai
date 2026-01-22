// In a real application, this would be a database.
// For this example, we're using an in-memory array.

export type Offeree = {
  name: string;
  email: string;
};

export type Offer = {
  id: string;
  title: string;
  terms: string;
  paymentAmount?: string;
  paymentDueDate?: string;
  offerorName: string;
  offerorEmail: string;
  offerees: Offeree[];
  status: 'pending' | 'accepted' | 'draft';
  createdAt: string; // Using ISO string for consistency
  acceptedAt: string | null;
  imageUrl: string;
};


export const mockOffers: Offer[] = [
    {
        id: 'camera-loan-1',
        title: 'Camera Loan to Friend',
        terms: 'This agreement covers the loan of my Sony A7IV camera to Alex for their trip to Italy. The loan period is one week, and the camera must be returned in the same condition it was received. A security deposit of $100 is required.',
        offerorName: 'Ja\'dan Johnson',
        offerorEmail: 'jadan.johnson@example.com',
        offerees: [{ name: 'Alex Morgan', email: 'alex@example.com' }],
        status: 'accepted',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        acceptedAt: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(),
        paymentAmount: '$100 Security Deposit',
        paymentDueDate: 'Oct 24, 2024',
        imageUrl: 'creative-project' // Using existing image key
    },
    {
        id: 'consulting-gig-2',
        title: 'Marketing Consulting',
        terms: 'Provide 10 hours of marketing consulting over the next month, focusing on social media strategy. Billed at $150/hour.',
        offerorName: 'Mike Ross',
        offerorEmail: 'mike@ross.com',
        offerees: [{ name: 'Ja\'dan Johnson', email: 'jadan.johnson@example.com' }],
        status: 'pending',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        acceptedAt: null,
        paymentAmount: '$1,500',
        imageUrl: 'consulting-agreement'
    },
    {
        id: 'apartment-lease-3',
        title: 'Apartment Lease',
        terms: '12-month lease for apartment #4B. Rent is $2000/month, due on the 1st. Security deposit of $2000 required.',
        offerorName: 'Landlord Property Group',
        offerorEmail: 'leasing@landlord.com',
        offerees: [{ name: 'Ja\'dan Johnson', email: 'jadan.johnson@example.com' }],
        status: 'draft',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
        acceptedAt: null,
        imageUrl: 'lease-agreement'
    },
];

let offers = [...mockOffers]; // Create a mutable copy

export async function getOffersByEmail(email: string) {
  return offers.filter(
    (offer) => offer.offerorEmail.toLowerCase() === email.toLowerCase() || offer.offerees.some(offeree => offeree.email.toLowerCase() === email.toLowerCase())
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getOfferById(id: string) {
  return offers.find((offer) => offer.id === id) || null;
}

export async function addOffer(offerData: Omit<Offer, 'id' | 'status' | 'createdAt' | 'acceptedAt' | 'imageUrl'>) {
    const newOffer: Offer = {
        ...offerData,
        id: (Math.random() + 1).toString(36).substring(2),
        status: 'pending',
        createdAt: new Date().toISOString(),
        acceptedAt: null,
        imageUrl: 'default', // default placeholder
    };
    offers.unshift(newOffer);
    return newOffer;
}

export async function updateOfferStatus(id: string, status: 'accepted') {
    const offerIndex = offers.findIndex((offer) => offer.id === id);
    if (offerIndex !== -1) {
        if (status === 'accepted') {
            offers[offerIndex].status = 'accepted';
            offers[offerIndex].acceptedAt = new Date().toISOString();
        }
        return offers[offerIndex];
    }
    return null;
}
