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
        id: '1',
        title: 'Website Design Services',
        terms: 'Design and develop a 5-page responsive website for a new coffee shop brand. Includes 2 rounds of revisions. Final deliverables to include all source files. Payment: 50% upfront, 50% on completion.',
        offerorName: 'Jane Doe',
        offerorEmail: 'jane@example.com',
        offereeName: 'John Smith',
        offereeEmail: 'john@example.com',
        status: 'pending',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
        acceptedAt: null,
    },
    {
        id: '2',
        title: 'Freelance Writing Contract',
        terms: 'Write four 1000-word blog posts on the topic of sustainable travel. SEO keywords will be provided. All articles must be original and pass plagiarism checks. Delivery schedule: one article per week.',
        offerorName: 'John Smith',
        offerorEmail: 'john@example.com',
        offereeName: 'Jane Doe',
        offereeEmail: 'jane@example.com',
        status: 'accepted',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 10)),
        acceptedAt: new Date(new Date().setDate(new Date().getDate() - 8)),
    },
    {
        id: '3',
        title: 'Apartment Lease Agreement',
        terms: '12-month lease for apartment #4B at 123 Main St. Rent is $2000/month, due on the 1st. Security deposit of $2000 required. No pets allowed. Tenant responsible for utilities.',
        offerorName: 'Landlord Corp',
        offerorEmail: 'landlord@example.com',
        offereeName: 'Jane Doe',
        offereeEmail: 'jane@example.com',
        status: 'pending',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
        acceptedAt: null,
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
