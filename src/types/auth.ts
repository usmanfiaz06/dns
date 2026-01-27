export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'owner' | 'member';
  companyId: string;
  createdAt: string;
}

export interface InvitedUser {
  id: string;
  email: string;
  invitedBy: string;
  invitedAt: string;
  status: 'pending' | 'accepted';
  companyId: string;
}

export interface CompanySettings {
  id: string;
  name: string;
  tagline: string;
  byLine: string;
  logoData: string;
  aboutTitle: string;
  aboutText: string;
  introImage: string;
  features: string[];
  ownerId: string;
}

export const defaultCompanySettings: Omit<CompanySettings, 'id' | 'ownerId'> = {
  name: 'QNS',
  tagline: 'Padel Courts',
  byLine: 'by Super Dialer (Pvt. SMC) ltd.',
  logoData: '',
  aboutTitle: 'About QNS Padel Courts',
  aboutText: 'QNS Padel Courts is a premium padel court design and construction company. We specialize in building world-class padel facilities with the highest quality materials and craftsmanship. Our team of experts ensures every court meets international standards while reflecting the unique vision of our clients.',
  introImage: '',
  features: [
    'Premium Quality Materials & Construction',
    'International Standard Court Dimensions',
    'Custom Design & Branding Options',
    'Professional Installation Team',
    'Complete Project Management',
    'After-Sales Support & Maintenance'
  ],
};
