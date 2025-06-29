// In a real application, this would be a database.
// For this example, we're using an in-memory array.

export type Offer = {
  id: string;
  title: string;
  terms: string;
  offerorName: string;
  offerorEmail: string;
  offereeName: string;
  offereeEmail: string;
  status: 'pending' | 'accepted';
  createdAt: Date;
  acceptedAt: Date | null;
};

const offers: Offer[] = [
    {
        id: 'jadan-sent-1',
        title: 'Graphic Design for Logo',
        terms: 'Create 3 logo concepts for a new startup. One final logo will be chosen with up to 3 revision rounds. Final assets delivered in SVG and PNG formats.',
        offerorName: 'Jadan',
        offerorEmail: 'iamjadan@gmail.com',
        offereeName: 'Creative Co.',
        offereeEmail: 'design@creative.co',
        status: 'pending',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
        acceptedAt: null,
    },
    {
        id: 'jadan-sent-2',
        title: 'Consulting Services Agreement',
        terms: 'Provide 10 hours of marketing consulting over the next month. Focus on social media strategy and content planning. Billed at $150/hour.',
        offerorName: 'Jadan',
        offerorEmail: 'iamjadan@gmail.com',
        offereeName: 'Startup Inc.',
        offereeEmail: 'contact@startup.inc',
        status: 'accepted',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 20)),
        acceptedAt: new Date(new Date().setDate(new Date().getDate() - 18)),
    },
    {
        id: 'jadan-received-1',
        title: 'Apartment Lease Agreement',
        terms: '12-month lease for apartment #4B at 123 Main St. Rent is $2000/month, due on the 1st. Security deposit of $2000 required. No pets allowed. Tenant responsible for utilities.',
        offerorName: 'City Apartments',
        offerorEmail: 'leasing@cityapts.com',
        offereeName: 'Jadan',
        offereeEmail: 'iamjadan@gmail.com',
        status: 'pending',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
        acceptedAt: null,
    },
    {
        id: 'jadan-received-2',
        title: 'Freelance Writing Contract',
        terms: 'Write four 1000-word blog posts on the topic of sustainable travel. SEO keywords will be provided. All articles must be original and pass plagiarism checks. Delivery schedule: one article per week.',
        offerorName: 'Content Factory',
        offerorEmail: 'editor@contentfactory.com',
        offereeName: 'Jadan',
        offereeEmail: 'iamjadan@gmail.com',
        status: 'accepted',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 10)),
        acceptedAt: new Date(new Date().setDate(new Date().getDate() - 8)),
    },
];

export async function getOffersByEmail(email: string) {
  return offers.filter(
    (offer) => offer.offerorEmail.toLowerCase() === email.toLowerCase() || offer.offereeEmail.toLowerCase() === email.toLowerCase()
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getOfferById(id: string) {
  return offers.find((offer) => offer.id === id) || null;
}

export async function addOffer(offerData: Omit<Offer, 'id' | 'status' | 'createdAt' | 'acceptedAt'>) {
    const newOffer: Offer = {
        ...offerData,
        id: (Math.random() + 1).toString(36).substring(2),
        status: 'pending',
        createdAt: new Date(),
        acceptedAt: null,
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
