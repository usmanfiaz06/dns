export interface QuotationItem {
  id: string;
  name: string;
  description: string[];
  enabled: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  quantity: string;
  price: number;
  enabled: boolean;
}

export interface ProjectImage {
  id: string;
  data: string; // Base64 encoded image
  caption?: string;
}

export interface PastProject {
  id: string;
  name: string;
  description: string;
  images: ProjectImage[];
  enabled: boolean;
}

export interface CompanyProfile {
  logoData?: string; // Base64 encoded logo
  companyName: string;
  tagline: string;
  byLine: string;
  aboutTitle: string;
  aboutText: string;
  features: string[];
  introImage?: string; // Base64 encoded image for intro page
}

export interface PDFPage {
  id: string;
  type: 'cover' | 'intro' | 'projects' | 'quotation' | 'terms' | 'custom';
  name: string;
  enabled: boolean;
  order: number;
}

export interface ShareLink {
  id: string;
  invoiceId: string;
  shortCode: string;
  createdAt: string;
  views: ShareView[];
}

export interface ShareView {
  timestamp: string;
  userAgent?: string;
}

export interface Invoice {
  id: string;
  clientName: string;
  description: string;
  numberOfCourts: number;
  date: string;
  courtSize: string;
  subTotal: number;
  quotationItems: QuotationItem[];
  addOns: AddOn[];
  includeTax: boolean;
  taxPercentage: number;
  includeCivilWork: boolean;
  civilWorkMinPrice: number;
  civilWorkMaxPrice: number;
  termsAndConditions: string[];
  paymentStructure: {
    advance: number;
    onDelivery: number;
    onCompletion: number;
  };
  completionDays: number;
  createdAt: string;
  updatedAt: string;
  modifiedAt?: string;
  // New fields
  pastProjects: PastProject[];
  companyProfile: CompanyProfile;
  pdfPages: PDFPage[];
  shareLinks: ShareLink[];
}

export const defaultCompanyProfile: CompanyProfile = {
  companyName: 'QNS',
  tagline: 'Padle Courts',
  byLine: 'by Super Dialer (Pvt. SMC) ltd.',
  aboutTitle: 'About QNS Padel Courts',
  aboutText: `QNS - Premium Padel Courts. We are elite padel-court designers & builders, founded by pro players for players. At QNS, we don't just build courts - we engineer high-performance playing environments based on first-hand experience.

With deep expertise in padel, our team understands every nuance: optimal court geometry, high-grade surface materials, advanced lighting systems, shock absorption, weather resilience, and athlete comfort.

We source only industry-leading materials, rigorously tested for durability, consistency, and player performance.`,
  features: [
    'Founded by professional padel players',
    'Industry-leading materials and construction',
    'FIP standards compliance',
    'Complete installation and support',
    'Weather-resilient designs',
    'Custom configurations available'
  ]
};

export const defaultPastProjects: PastProject[] = [
  {
    id: '1',
    name: 'The Courtside Club',
    description: 'Premium padel facility featuring 4 courts with LED lighting and spectator seating.',
    images: [],
    enabled: true
  }
];

export const defaultPDFPages: PDFPage[] = [
  { id: '1', type: 'cover', name: 'Cover Page', enabled: true, order: 0 },
  { id: '2', type: 'intro', name: 'Company Introduction', enabled: true, order: 1 },
  { id: '3', type: 'projects', name: 'Past Projects', enabled: true, order: 2 },
  { id: '4', type: 'quotation', name: 'Quotation Details', enabled: true, order: 3 },
  { id: '5', type: 'terms', name: 'Terms & Conditions', enabled: true, order: 4 }
];

export const defaultQuotationItems: QuotationItem[] = [
  {
    id: '1',
    name: 'Steel Structure',
    description: [
      'High-quality MS Structure pole, vertical bars, horizontal bars, Corner Column, Frame Column in 10 and 12 SWG',
      'High quality 1.5" x 1.5" Mesh of 10 Gauge thickness',
      '20 base support plates'
    ],
    enabled: true
  },
  {
    id: '2',
    name: 'Glass',
    description: [
      '12mm Tempered Glass',
      '2m x 3m Planks with screw holes',
      'Complete installation and fitting of glass',
      'Adhesive Tape between Glass & Frame'
    ],
    enabled: true
  },
  {
    id: '3',
    name: 'Astro Turf',
    description: [
      'Mondo-Pro',
      'Pile Height:12mm+-, Density:62800, DTEX:15800, COLOR: Blue, With White Lines Marking, SUPER DURABLE, FIP STANDARDS, KDK SPECIAL',
      'Complete Silica Sanding (2 times)'
    ],
    enabled: true
  },
  {
    id: '4',
    name: 'Center Post',
    description: [
      'Steel Bars, Fastening Wheel 2 Post',
      'Net Adjustment Motor',
      'Center Post Cushioning'
    ],
    enabled: true
  },
  {
    id: '5',
    name: 'Net & Accessories',
    description: [
      '1 High Quality Playing Net',
      'Thick Net Cable'
    ],
    enabled: true
  },
  {
    id: '6',
    name: 'Paint',
    description: [
      'Highest quality Paint',
      'Primer'
    ],
    enabled: true
  },
  {
    id: '7',
    name: 'Lights',
    description: [
      'Linear Padel lights (SP-11) 400 watts'
    ],
    enabled: true
  },
  {
    id: '8',
    name: 'Doors',
    description: [
      'Complete door cushioning of both sides'
    ],
    enabled: true
  },
  {
    id: '9',
    name: 'Labor',
    description: [
      'Labor, transportation, miscellaneous'
    ],
    enabled: true
  }
];

export const defaultAddOns: AddOn[] = [
  {
    id: '1',
    name: 'Rackets 12k Carbon',
    quantity: '4pcs',
    price: 60000,
    enabled: false
  },
  {
    id: '2',
    name: 'Wilson Balls',
    quantity: 'Carton of 24 Cans',
    price: 60000,
    enabled: false
  }
];

export const defaultTermsAndConditions: string[] = [
  'FIELD COMPLETION TIME: 45 working days',
  'Civil Work is not part of quotation.',
  'After placing the order goods, installation will be done as per the given time.',
  'In case of any strike, government holiday, worldwide lockdown etc. Delivery may be delayed according to the schedule.',
  'Transport Charges & Daily Expense Included',
  'All payments are exclusive of taxes.'
];

export const createNewInvoice = (): Invoice => {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    clientName: '',
    description: 'Padel court construction without civil work',
    numberOfCourts: 1,
    date: now.toISOString().split('T')[0],
    courtSize: '10m*20m',
    subTotal: 6200000,
    quotationItems: JSON.parse(JSON.stringify(defaultQuotationItems)),
    addOns: JSON.parse(JSON.stringify(defaultAddOns)),
    includeTax: false,
    taxPercentage: 17,
    includeCivilWork: false,
    civilWorkMinPrice: 250000,
    civilWorkMaxPrice: 400000,
    termsAndConditions: [...defaultTermsAndConditions],
    paymentStructure: {
      advance: 65,
      onDelivery: 25,
      onCompletion: 10
    },
    completionDays: 45,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    // New fields
    pastProjects: JSON.parse(JSON.stringify(defaultPastProjects)),
    companyProfile: JSON.parse(JSON.stringify(defaultCompanyProfile)),
    pdfPages: JSON.parse(JSON.stringify(defaultPDFPages)),
    shareLinks: []
  };
};
