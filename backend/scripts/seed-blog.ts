import { createHash } from 'crypto';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../src/app.module';

interface CliOptions {
  dryRun: boolean;
  skipUpload: boolean;
  uploadDelayMs: number;
}

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
}

interface ComparisonTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

interface FaqItem {
  question: string;
  answer: string;
}

interface SeedPostDefinition {
  title: string;
  slug: string;
  category: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  unsplashKeywords: string[];
  publishedAt: string;
  sections: string[];
  table?: ComparisonTable;
  tableInsertAfterSection?: number;
  faq?: FaqItem[];
  relatedSlugs: string[];
  complianceRelevant?: boolean;
  pricingRelevant?: boolean;
}

interface PreparedPost {
  definition: SeedPostDefinition;
  payload: Record<string, any>;
  wordCount: number;
}

const MIN_WORDS = 1500;
const MAX_WORDS = 2500;
const TOTAL_POSTS = 15;
const TOTAL_IMAGES_PER_POST = 5;
const ADDITIONAL_IMAGES_PER_POST = TOTAL_IMAGES_PER_POST - 1;
const CLOUDINARY_FOLDER = 'vpstonemason/blog';

const MELBOURNE_LOCATIONS = [
  'Richmond',
  'South Yarra',
  'Brighton',
  'Toorak',
  'Geelong',
];

const SECTION_OPENERS = [
  'A well-planned stone project starts with clarity.',
  'This is one of the most important decisions in any renovation brief.',
  'Homeowners usually get better outcomes when this step is addressed early.',
  'This topic often determines whether the final kitchen feels premium for years.',
  'Most avoidable issues can be prevented by handling this point in detail.',
];

const PLANNING_LINES = [
  'Treat the material decision as both a design choice and a long-term performance choice.',
  'The right approach balances appearance, daily practicality, and installation constraints.',
  'A consistent process avoids expensive revisions once cabinetry and appliances are locked in.',
  'Early technical checks reduce risk around seams, edge profiles, and appliance clearances.',
  'Comparing options using the same scope is the best way to keep expectations realistic.',
];

const CRAFT_LINES = [
  'With more than 15 years of local fabrication experience, VPStoneMason plans each job around slab movement, join direction, and on-site access before cutting begins.',
  'Our team focuses on template accuracy, vein flow, and finish quality so the final result feels intentional, not improvised.',
  'We prioritise craftsmanship that looks refined on handover day and still performs under real daily use.',
  'Every recommendation is grounded in Australian usage conditions, not generic overseas advice.',
  'We combine practical stonemasonry detail with clear communication so clients can make decisions confidently.',
];

const ACTION_LINES = [
  'If you are comparing suppliers, ask for an itemised scope and confirm what is included before accepting any quote.',
  'A short planning session with your stonemason can prevent delays and cost surprises later in the build.',
  'Documenting finishes, edge profile, and cut-outs in writing is the easiest way to protect quality and budget.',
  'When in doubt, request a sample review in your actual lighting before final sign-off.',
  'A measured, staged decision process consistently delivers better design and budget outcomes.',
];

const PRICING_SENTENCES = [
  'Indicative installed pricing in Melbourne often sits around $350-$750/m2 for mainstream selections, while premium materials can exceed that range depending on slab grade and complexity; prices are indicative, and a site-specific quote is essential.',
  'Use broad pricing bands as a planning tool only: final costs depend on slab yield, edge profile, cut-out count, access, and lead times, so prices are indicative and should be confirmed with a formal quote.',
  'Budget planning works best when your quote includes fabrication, installation, and exclusions in plain language; prices are indicative and should always be validated on site.',
];

const COMPLIANCE_SENTENCES = [
  'From 1 July 2024, Australia banned engineered stone products containing more than 1% crystalline silica. VPStoneMason supplies compliant options and follows safe fabrication practices for every project.',
  'Australia\'s engineered stone ban has applied since 1 July 2024, so compliant CSF and approved natural alternatives are now central to responsible specification.',
  'Where engineered-style surfaces are discussed, always confirm crystalline silica compliance and fabrication controls under the post-2024 Australian rules.',
];

const FALLBACK_CLOUDINARY_IMAGES = [
  'https://res.cloudinary.com/drcw8n9gh/image/upload/v1775313693/vpstonemason/catalog/range-hero/portofino-12-1-4ebb9421ee.jpg',
  'https://res.cloudinary.com/drcw8n9gh/image/upload/v1775313696/vpstonemason/catalog/range-hero/ultra-thin-natural-surface-278485080e.jpg',
  'https://res.cloudinary.com/drcw8n9gh/image/upload/v1775313694/vpstonemason/catalog/range-hero/limited-aa00e4ef3f.jpg',
  'https://res.cloudinary.com/drcw8n9gh/image/upload/v1775313691/vpstonemason/catalog/range-hero/portofino-20-b31dfa020e.jpg',
  'https://res.cloudinary.com/drcw8n9gh/image/upload/v1775313692/vpstonemason/catalog/range-hero/portofino-12-e3a956d2ae.jpg',
  'https://res.cloudinary.com/drcw8n9gh/image/upload/v1775313693/vpstonemason/catalog/range-hero/portofino-12-1-4ebb9421ee.jpg',
];

const BLOG_POSTS: SeedPostDefinition[] = [
  {
    title:
      'How Much Does a Stone Benchtop Cost in Melbourne? 2026 Complete Price Guide',
    slug: 'stone-benchtop-cost-melbourne-2026',
    category: 'Pricing & Budgeting',
    tags: [
      'pricing',
      'kitchen renovation',
      'melbourne',
      'budget guide',
      'benchtop cost',
    ],
    seoTitle: 'Stone Benchtop Cost Melbourne 2026 | Price Guide',
    seoDescription:
      'Find out how much stone benchtops cost in Melbourne in 2026. Compare granite, marble, quartz and CSF stone prices per m2. Get a free quote today.',
    excerpt:
      'Compare 2026 Melbourne stone benchtop costs across granite, marble, quartz, CSF and porcelain with practical budgeting tips, inclusions, and quote checks for renovators.',
    unsplashKeywords: [
      'kitchen marble benchtop',
      'luxury kitchen renovation',
      'stone countertop',
    ],
    publishedAt: '2025-08-05',
    sections: [
      'Average price ranges by stone type in AUD per m2 installed',
      'What is included in fabrication and installation pricing',
      'Factors that affect total cost: edge profiles, cut-outs, slab size and waste',
      'Granite vs marble vs quartz vs CSF vs porcelain price positioning',
      'How to stay on budget without sacrificing finish quality',
      'Why Melbourne pricing differs from national averages',
      'Free measure and quote checklist before you sign',
    ],
    tableInsertAfterSection: 3,
    table: {
      caption: 'Indicative Melbourne Benchtop Pricing (Installed)',
      headers: ['Stone type', 'Indicative installed price', 'Best suited for', 'Maintenance'],
      rows: [
        ['Granite', '$450-$850/m2', 'Family kitchens and outdoor zones', 'Low to moderate'],
        ['Marble', '$550-$1,100/m2', 'Luxury islands and statement surfaces', 'Moderate to high'],
        ['Quartz', '$500-$900/m2', 'Consistent colour and low-maintenance homes', 'Low'],
        ['CSF Stone', '$520-$920/m2', 'Compliant indoor renovation projects', 'Low'],
        ['Porcelain', '$600-$1,000/m2', 'Contemporary and heat-focused kitchens', 'Low'],
      ],
    },
    relatedSlugs: [
      'granite-vs-marble-vs-quartz-australia',
      'how-to-choose-stone-benchtop-kitchen',
      'stone-benchtop-edge-profiles-guide',
    ],
    complianceRelevant: true,
    pricingRelevant: true,
  },
  {
    title:
      'Granite vs Marble vs Quartz: The Complete Australian Benchtop Comparison Guide',
    slug: 'granite-vs-marble-vs-quartz-australia',
    category: 'Stone Comparison',
    tags: ['granite', 'marble', 'quartz', 'comparison', 'benchtop guide'],
    seoTitle: 'Granite vs Marble vs Quartz Benchtops Australia',
    seoDescription:
      'Compare granite, marble and quartz benchtops for Australian kitchens. Durability, maintenance, cost and style - which stone is right for you?',
    excerpt:
      'Granite, marble, and quartz each offer distinct strengths. This Australian comparison explains durability, care, style outcomes, and pricing so you can choose confidently.',
    unsplashKeywords: ['marble kitchen', 'granite benchtop', 'quartz stone surface'],
    publishedAt: '2025-08-12',
    sections: [
      'Overview of granite, marble and quartz for Australian homes',
      'Durability and Mohs hardness comparison in real kitchens',
      'Heat resistance, scratch resistance and stain resistance side-by-side',
      'Maintenance requirements over the first five years',
      'Indicative price ranges and value over time',
      'Best use cases for kitchen, bathroom and selected outdoor applications',
      'How to decide which stone matches your lifestyle and design goals',
    ],
    tableInsertAfterSection: 2,
    table: {
      caption: 'Granite vs Marble vs Quartz at a Glance',
      headers: ['Material', 'Mohs hardness', 'Maintenance effort', 'Indicative price', 'Style profile'],
      rows: [
        ['Granite', '6-7', 'Moderate', '$450-$850/m2', 'Natural variation, strong and practical'],
        ['Marble', '3-5', 'Higher', '$550-$1,100/m2', 'Elegant veining, premium character'],
        ['Quartz', '7', 'Low', '$500-$900/m2', 'Uniform aesthetics, easy day-to-day care'],
      ],
    },
    relatedSlugs: [
      'quartzite-vs-marble-comparison-australia',
      'stone-benchtop-cost-melbourne-2026',
      'how-to-care-for-natural-stone-benchtop',
    ],
    complianceRelevant: true,
    pricingRelevant: true,
  },
  {
    title:
      'Understanding the Engineered Stone Ban in Australia: What Every Homeowner Needs to Know',
    slug: 'engineered-stone-ban-australia-homeowners-guide',
    category: 'Industry News & Regulations',
    tags: [
      'engineered stone ban',
      'CSF stone',
      'crystalline silica',
      'australia regulations',
      'safe stone',
    ],
    seoTitle: 'Australia Engineered Stone Ban 2024 | Homeowner Guide',
    seoDescription:
      'Australia banned engineered stone with over 1% crystalline silica from 1 July 2024. Learn what this means and which safe alternatives are available.',
    excerpt:
      'Australia\'s engineered stone ban changed renovation planning. This homeowner guide explains what is banned, what remains available, and how to choose compliant alternatives.',
    unsplashKeywords: [
      'kitchen renovation australia',
      'modern kitchen design',
      'stone benchtop',
    ],
    publishedAt: '2025-08-19',
    sections: [
      'What the engineered stone ban is and when it started',
      'Why the ban was introduced and the worker safety evidence behind it',
      'What this means for homeowners planning kitchen and bathroom renovations',
      'Which products are affected and which options are still available',
      'Safe CSF alternatives now used in Australia',
      'How VPStoneMason stays fully compliant in design and fabrication',
      'Timeline of the ban and what to expect next',
      'Common homeowner concerns and practical answers',
    ],
    tableInsertAfterSection: 6,
    table: {
      caption: 'Engineered Stone Ban Timeline (Australia)',
      headers: ['Date', 'Milestone', 'Homeowner implication'],
      rows: [
        ['2023', 'Regulatory consultations and health findings intensified', 'Suppliers and fabricators began transitioning ranges'],
        ['1 Jul 2024', 'Ban commenced for engineered stone above silica threshold', 'Compliant alternatives became essential for new projects'],
        ['2025 onward', 'Market stabilised around compliant materials', 'Better clarity on specification and installer obligations'],
      ],
    },
    faq: [
      {
        question: 'Can I keep an existing engineered stone benchtop in my home?',
        answer:
          'Yes. The ban targets supply, processing and installation of non-compliant products, not ownership of existing surfaces already installed in homes.',
      },
      {
        question: 'Is CSF stone legal for new kitchen projects in Melbourne?',
        answer:
          'Yes, compliant CSF products are designed for post-ban projects. Always confirm product documentation and installer compliance before approval.',
      },
      {
        question: 'Do natural stones like granite and marble remain available?',
        answer:
          'Yes. Natural stones remain available and widely specified, with care requirements depending on porosity, finish, and intended use.',
      },
      {
        question: 'How can I verify my quote is compliant?',
        answer:
          'Ask for product identification, compliance evidence, and a written fabrication scope that references current Australian requirements.',
      },
    ],
    relatedSlugs: [
      'csf-stone-crystalline-silica-free-guide-australia',
      'how-to-choose-stone-benchtop-kitchen',
      'stone-benchtop-cost-melbourne-2026',
    ],
    complianceRelevant: true,
  },
  {
    title: 'Top 10 Kitchen Benchtop Trends in Australia for 2026',
    slug: 'kitchen-benchtop-trends-australia-2026',
    category: 'Design & Trends',
    tags: [
      'kitchen trends 2026',
      'design inspiration',
      'benchtop trends',
      'australia',
      'interior design',
    ],
    seoTitle: 'Kitchen Benchtop Trends Australia 2026 | Top 10 List',
    seoDescription:
      'Discover the top 10 kitchen benchtop trends dominating Australian homes in 2026. From Calacatta marble to CSF stone and waterfall edges.',
    excerpt:
      'From Calacatta marble to porcelain panels, these ten 2026 benchtop trends show what Australian homeowners are choosing for style, safety, and practical durability.',
    unsplashKeywords: [
      'modern kitchen design 2024',
      'luxury kitchen interior',
      'marble kitchen island',
    ],
    publishedAt: '2025-08-26',
    sections: [
      '#1 Calacatta marble remains a timeless statement',
      '#2 CSF stone leads safety-first luxury specifications',
      '#3 Waterfall edges create architectural impact',
      '#4 Honed and leathered finishes challenge high gloss',
      '#5 Warm neutral colour palettes continue to grow',
      '#6 Large-format slabs reduce seam visibility',
      '#7 Fluted stone panels add texture and depth',
      '#8 Dark dramatic stones return in premium projects',
      '#9 Quartzite becomes the natural premium alternative',
      '#10 Porcelain surfaces drive ultra-modern detailing',
      'How to adapt trend ideas to a realistic renovation budget',
    ],
    relatedSlugs: [
      'waterfall-edge-benchtops-guide-australia',
      'best-stone-colours-small-kitchen-australia',
      'stone-benchtop-edge-profiles-guide',
    ],
    complianceRelevant: true,
  },
  {
    title:
      'How to Choose the Perfect Stone Benchtop for Your Kitchen: A Step-by-Step Guide',
    slug: 'how-to-choose-stone-benchtop-kitchen',
    category: 'Buying Guide',
    tags: [
      'buying guide',
      'stone selection',
      'kitchen design',
      'benchtop choice',
      'melbourne',
    ],
    seoTitle: 'How to Choose a Stone Benchtop for Your Kitchen',
    seoDescription:
      'Not sure which stone benchtop is right for your kitchen? Follow our step-by-step guide to choose the perfect stone based on lifestyle, budget and style.',
    excerpt:
      'Use this practical step-by-step method to select the right kitchen benchtop by lifestyle, budget, finish, thickness, edge profile, and showroom sample review.',
    unsplashKeywords: [
      'kitchen design inspiration',
      'stone samples',
      'kitchen renovation planning',
    ],
    publishedAt: '2025-09-02',
    sections: [
      'Step 1: Define your household lifestyle and daily usage',
      'Step 2: Set a realistic budget range before design lock-in',
      'Step 3: Choose the right stone family for your priorities',
      'Step 4: Select your finish: polished, honed, leathered, or brushed',
      'Step 5: Match edge profile to safety, style and cost',
      'Step 6: Decide thickness strategy: 20mm, 30mm, or 40mm look',
      'Step 7: Pair colour and veining with cabinetry and lighting',
      'Step 8: Visit a showroom and assess real slabs in person',
      'Common selection mistakes and how to avoid them',
    ],
    tableInsertAfterSection: 5,
    table: {
      caption: 'Thickness Planning Guide',
      headers: ['Nominal thickness', 'Visual effect', 'Typical use', 'Budget impact'],
      rows: [
        ['20mm', 'Light and modern', 'Most contemporary kitchens', 'Most budget-friendly'],
        ['30mm', 'Balanced premium feel', 'Family kitchens and islands', 'Moderate uplift'],
        ['40mm look (mitred)', 'Bold statement edge', 'Feature islands', 'Higher fabrication cost'],
      ],
    },
    relatedSlugs: [
      'stone-benchtop-cost-melbourne-2026',
      'granite-vs-marble-vs-quartz-australia',
      'stone-benchtop-edge-profiles-guide',
    ],
    complianceRelevant: true,
    pricingRelevant: true,
  },
  {
    title:
      'CSF Stone: Everything You Need to Know About Australia\'s Safest Benchtop Alternative',
    slug: 'csf-stone-crystalline-silica-free-guide-australia',
    category: 'Products & Materials',
    tags: [
      'CSF stone',
      'crystalline silica free',
      'safe benchtop',
      'engineered stone alternative',
      'australia',
    ],
    seoTitle: 'CSF Stone Australia | Crystalline Silica-Free Guide',
    seoDescription:
      'CSF (Crystalline Silica-Free) stone is Australia\'s compliant answer to the engineered stone ban. Learn what it is, how it performs and why it is a smart choice.',
    excerpt:
      'CSF stone is now central to compliant Australian renovations. Learn how it is made, how it performs, what it costs, and where it fits compared with legacy materials.',
    unsplashKeywords: [
      'white kitchen benchtop',
      'modern stone surface',
      'luxury kitchen countertop',
    ],
    publishedAt: '2025-09-09',
    sections: [
      'What CSF stone is and how it differs from legacy engineered stone',
      'Why CSF materials were developed after the Australian ban',
      'How CSF slabs are manufactured and quality controlled',
      'Performance comparison against older engineered products',
      'Brands available in Australia and what to compare',
      'Colour and finish options for different design directions',
      'Indicative pricing versus natural stone and porcelain',
      'Is CSF as durable and practical as previous engineered surfaces',
      'Health, safety and compliance checks homeowners should request',
    ],
    tableInsertAfterSection: 6,
    table: {
      caption: 'CSF Decision Snapshot',
      headers: ['Question', 'Practical answer'],
      rows: [
        ['Compliant after 1 Jul 2024?', 'Yes, when product documentation confirms current requirements'],
        ['Visual consistency?', 'Generally high, with broad contemporary colour ranges'],
        ['Maintenance burden?', 'Usually low, similar to other easy-care composite surfaces'],
        ['Outdoor suitability?', 'Typically indoor-focused; confirm UV guidance per brand'],
      ],
    },
    relatedSlugs: [
      'engineered-stone-ban-australia-homeowners-guide',
      'granite-vs-marble-vs-quartz-australia',
      'porcelain-benchtops-australia-guide',
    ],
    complianceRelevant: true,
    pricingRelevant: true,
  },
  {
    title:
      'Porcelain Benchtops: The Ultimate Low-Maintenance Kitchen Surface for Australian Homes',
    slug: 'porcelain-benchtops-australia-guide',
    category: 'Products & Materials',
    tags: [
      'porcelain benchtop',
      'low maintenance',
      'kitchen surface',
      'porcelain stone',
      'australia',
    ],
    seoTitle: 'Porcelain Benchtops Australia | Complete Guide 2026',
    seoDescription:
      'Porcelain benchtops are scratch-proof, heat-proof and virtually maintenance-free. Discover why more Australians are choosing porcelain for their kitchens.',
    excerpt:
      'Porcelain benchtops are growing fast in Australian renovations. This guide covers thickness options, performance, installation needs, and where porcelain outperforms traditional surfaces.',
    unsplashKeywords: [
      'porcelain kitchen',
      'modern kitchen renovation',
      'minimalist kitchen design',
    ],
    publishedAt: '2025-09-16',
    sections: [
      'What porcelain benchtops are and how they differ from ceramic',
      'Core performance benefits: heat, scratch, UV and low maintenance',
      'Large format slab formats and seam planning',
      'Thickness choices: 6mm, 12mm and 20mm applications',
      'Indoor and outdoor suitability in Australian climates',
      'Colour and texture options from concrete-look to marble-look',
      'Installation requirements and why specialist handling matters',
      'Price positioning versus granite, CSF and quartzite',
      'Who porcelain suits best and where limitations exist',
    ],
    tableInsertAfterSection: 3,
    table: {
      caption: 'Porcelain Thickness Guide',
      headers: ['Thickness', 'Best use case', 'Visual impact', 'Installation note'],
      rows: [
        ['6mm', 'Splashbacks and cladding', 'Slim, modern', 'Needs substrate support'],
        ['12mm', 'Most benchtops', 'Balanced look', 'Common residential choice'],
        ['20mm', 'Feature edges and premium detailing', 'Heavier profile', 'May involve mitred build-ups'],
      ],
    },
    relatedSlugs: [
      'outdoor-kitchen-stone-guide-australia',
      'csf-stone-crystalline-silica-free-guide-australia',
      'stone-benchtop-cost-melbourne-2026',
    ],
    pricingRelevant: true,
  },
  {
    title:
      'Stone Benchtop Edge Profiles Explained: A Complete Visual Guide for Australian Homeowners',
    slug: 'stone-benchtop-edge-profiles-guide',
    category: 'Design & Trends',
    tags: ['edge profiles', 'benchtop edges', 'waterfall edge', 'mitre edge', 'stone design'],
    seoTitle: 'Stone Benchtop Edge Profiles Guide | VPStoneMason',
    seoDescription:
      'From pencil round to waterfall mitre - learn about stone benchtop edge profiles, costs, appearance and where each option fits in Australian kitchens.',
    excerpt:
      'Edge profile choice shapes cost, safety, and final style. This guide explains the major profile options, where they work best, and what homeowners should budget for.',
    unsplashKeywords: [
      'kitchen benchtop edge detail',
      'marble countertop edge',
      'stone kitchen island',
    ],
    publishedAt: '2025-09-23',
    sections: [
      'Why edge profiles matter for aesthetics, safety and budget',
      'Square and eased edges for modern, cost-effective kitchens',
      'Pencil round edges for a soft timeless finish',
      'Bullnose edges for classic and family-friendly detailing',
      'Bevelled edges and how they catch natural light',
      'Waterfall and mitre edges for architectural impact',
      'Ogee and decorative profiles in traditional interiors',
      'Dupont and stacked edge profiles for bold visual weight',
      'How to choose the right profile for your cabinetry style',
      'Stonemason tips before final profile sign-off',
    ],
    tableInsertAfterSection: 7,
    table: {
      caption: 'Edge Profile Cost Comparison (Indicative)',
      headers: ['Profile', 'Visual style', 'Fabrication complexity', 'Indicative cost impact'],
      rows: [
        ['Eased/Square', 'Minimal modern', 'Low', 'Baseline'],
        ['Pencil round', 'Soft contemporary', 'Low to moderate', 'Small uplift'],
        ['Bullnose', 'Classic rounded', 'Moderate', 'Moderate uplift'],
        ['Bevelled', 'Crisp and elegant', 'Moderate', 'Moderate uplift'],
        ['Waterfall/Mitre', 'Architectural statement', 'High', 'Highest uplift'],
      ],
    },
    relatedSlugs: [
      'waterfall-edge-benchtops-guide-australia',
      'how-to-choose-stone-benchtop-kitchen',
      'kitchen-benchtop-trends-australia-2026',
    ],
    pricingRelevant: true,
  },
  {
    title:
      'How to Care for Your Natural Stone Benchtop: The Complete Australian Maintenance Guide',
    slug: 'how-to-care-for-natural-stone-benchtop',
    category: 'Care & Maintenance',
    tags: [
      'stone care',
      'maintenance guide',
      'sealing stone',
      'cleaning benchtop',
      'natural stone',
    ],
    seoTitle: 'How to Care for Natural Stone Benchtops | Full Guide',
    seoDescription:
      'Keep your stone benchtops looking beautiful for decades. Learn how to clean, seal and protect granite, marble and quartzite in Australian homes.',
    excerpt:
      'Keep granite, marble, and quartzite looking premium with a clear routine for cleaning, sealing, stain removal, and long-term protection in Australian homes.',
    unsplashKeywords: [
      'kitchen cleaning marble',
      'stone countertop care',
      'luxury kitchen maintenance',
    ],
    publishedAt: '2025-09-30',
    sections: [
      'Why natural stone needs specific care and cleaning chemistry',
      'Daily cleaning routine: products to use and avoid',
      'Granite care routine for busy family kitchens',
      'Marble care routine and how to manage etching risk',
      'Quartzite care routine and sealing strategy',
      'How often to reseal and what signs indicate resealing is due',
      'DIY sealing steps homeowners can follow safely',
      'How to treat common stains: oil, wine, coffee and rust',
      'Products and methods never recommended on stone',
      'Seasonal deep-clean and inspection checklist',
    ],
    tableInsertAfterSection: 7,
    table: {
      caption: 'Quick Stain Response Guide',
      headers: ['Stain type', 'First response', 'Avoid this', 'Escalation'],
      rows: [
        ['Oil/grease', 'Blot, then use pH-neutral degreaser', 'Abrasive scrubbing', 'Poultice if mark remains'],
        ['Wine/coffee', 'Blot immediately and rinse', 'Bleach or acidic cleaners', 'Professional treatment for deep penetration'],
        ['Rust', 'Use stone-safe rust remover', 'General-purpose bathroom acids', 'Specialist restoration if persistent'],
      ],
    },
    relatedSlugs: [
      'granite-vs-marble-vs-quartz-australia',
      'quartzite-vs-marble-comparison-australia',
      'how-to-choose-stone-benchtop-kitchen',
    ],
  },
  {
    title:
      'Quartzite vs Marble: Beauty vs Durability - Which is the Right Choice for Your Home?',
    slug: 'quartzite-vs-marble-comparison-australia',
    category: 'Stone Comparison',
    tags: ['quartzite', 'marble', 'stone comparison', 'natural stone', 'benchtop guide'],
    seoTitle: 'Quartzite vs Marble Benchtops Australia | 2026 Guide',
    seoDescription:
      'Quartzite and marble look similar but perform very differently. Compare durability, maintenance, cost and aesthetics to find the right stone for your kitchen.',
    excerpt:
      'Quartzite and marble can look similar but perform differently. Compare hardness, porosity, maintenance, and price to choose the right stone for your renovation.',
    unsplashKeywords: [
      'marble quartzite kitchen',
      'natural stone benchtop',
      'luxury kitchen white stone',
    ],
    publishedAt: '2025-10-07',
    sections: [
      'What quartzite is and why it is often confused with quartz',
      'What marble is and why it remains a design icon',
      'Visual comparison and how to tell them apart',
      'Durability differences using Mohs hardness context',
      'Porosity, stain resistance and sealing expectations',
      'Heat resistance and daily cooking resilience',
      'Etching risk and why marble needs extra care',
      'Indicative pricing differences in Melbourne projects',
      'Maintenance routines and lifecycle effort comparison',
      'Best applications for kitchens, bathrooms and feature areas',
      'Popular quartzite and marble varieties in Australia',
    ],
    tableInsertAfterSection: 8,
    table: {
      caption: 'Quartzite vs Marble Side-by-Side',
      headers: ['Criterion', 'Quartzite', 'Marble'],
      rows: [
        ['Hardness', 'Higher (typically 6-7)', 'Lower (typically 3-5)'],
        ['Etching resistance', 'Better resistance', 'More vulnerable'],
        ['Visual character', 'Natural movement, often subtle', 'Classic dramatic veining'],
        ['Maintenance load', 'Moderate', 'Higher'],
        ['Indicative installed price', '$650-$1,250/m2', '$550-$1,100/m2'],
      ],
    },
    relatedSlugs: [
      'granite-vs-marble-vs-quartz-australia',
      'how-to-care-for-natural-stone-benchtop',
      'stone-benchtop-cost-melbourne-2026',
    ],
    pricingRelevant: true,
  },
  {
    title: 'Kitchen Renovation Planning in Melbourne: A Complete Step-by-Step Timeline',
    slug: 'kitchen-renovation-planning-timeline-melbourne',
    category: 'Renovation Planning',
    tags: [
      'kitchen renovation',
      'renovation planning',
      'melbourne',
      'renovation timeline',
      'project management',
    ],
    seoTitle: 'Kitchen Renovation Timeline Melbourne | Planning Guide',
    seoDescription:
      'Planning a kitchen renovation in Melbourne? Follow our expert step-by-step timeline from budget to installation and avoid costly project mistakes.',
    excerpt:
      'Plan your Melbourne kitchen renovation with a realistic timeline from budget and design through fabrication, installation, and final handover to avoid costly delays.',
    unsplashKeywords: [
      'kitchen renovation melbourne',
      'home renovation planning',
      'new kitchen design',
    ],
    publishedAt: '2025-10-14',
    sections: [
      'Phase 1: Planning and budget alignment (weeks 1-2)',
      'Phase 2: Design direction and material selection (weeks 3-4)',
      'Phase 3: Quote comparison and scope clarification (weeks 5-6)',
      'Phase 4: Permits and compliance checks where applicable',
      'Phase 5: Demolition and site preparation (weeks 7-8)',
      'Phase 6: Plumbing and electrical rough-in coordination',
      'Phase 7: Cabinetry installation and pre-template checks',
      'Phase 8: Stone template, fabrication and quality checks (weeks 9-10)',
      'Phase 9: Stone installation and site finishing',
      'Phase 10: Splashback, appliances and final detailing',
      'Phase 11: Final inspection and handover checklist',
      'Common delay points and prevention tactics',
    ],
    tableInsertAfterSection: 8,
    table: {
      caption: 'Typical Melbourne Renovation Timeline (Guide)',
      headers: ['Phase', 'Typical duration', 'Critical dependency'],
      rows: [
        ['Planning and design', '4-6 weeks', 'Scope, budget and product availability'],
        ['Construction preparation', '2-4 weeks', 'Permits, trades scheduling, demolition'],
        ['Cabinetry and stone execution', '2-4 weeks', 'Template timing and fabrication lead times'],
        ['Finishing and sign-off', '1-2 weeks', 'Appliance install and defect close-out'],
      ],
    },
    relatedSlugs: [
      'stone-benchtop-cost-melbourne-2026',
      'how-to-choose-stone-benchtop-kitchen',
      'kitchen-splashback-ideas-stone-vs-tile-vs-glass',
    ],
    pricingRelevant: true,
  },
  {
    title: 'Outdoor Kitchen Stone Guide: The Best Benchtop Materials for Australian Weather',
    slug: 'outdoor-kitchen-stone-guide-australia',
    category: 'Outdoor Living',
    tags: [
      'outdoor kitchen',
      'outdoor stone',
      'alfresco benchtop',
      'australia weather',
      'BBQ area',
    ],
    seoTitle: 'Outdoor Kitchen Stone Guide Australia | Best Materials',
    seoDescription:
      'Not all stones suit outdoor kitchens. Discover materials that withstand UV, heat, rain and coastal conditions for Australian alfresco living.',
    excerpt:
      'Outdoor kitchens need material choices built for UV, heat, moisture, and salt. This guide explains which benchtop surfaces perform best in Australian weather.',
    unsplashKeywords: [
      'outdoor kitchen australia',
      'alfresco bbq area',
      'outdoor stone benchtop',
    ],
    publishedAt: '2025-10-21',
    sections: [
      'Why outdoor kitchens need a different material strategy',
      'Australian climate pressures: UV, heat, rain and coastal salt',
      'Granite performance outdoors and where it excels',
      'Porcelain as a leading UV-stable outdoor option',
      'Quartzite strengths and practical caveats outdoors',
      'Why marble is usually not recommended outdoors',
      'Why quartz and many CSF products are typically indoor-focused',
      'Outdoor finish and slip-safety planning',
      'Thickness and support recommendations for alfresco projects',
      'Sealing schedules for exposed installations',
      'Budget planning for Melbourne outdoor entertaining zones',
    ],
    tableInsertAfterSection: 6,
    table: {
      caption: 'Outdoor Material Suitability Guide',
      headers: ['Material', 'UV stability', 'Heat performance', 'Recommended outdoors'],
      rows: [
        ['Granite', 'Strong', 'Strong', 'Yes, widely used'],
        ['Porcelain', 'Excellent', 'Excellent', 'Yes, often first choice'],
        ['Quartzite', 'Good', 'Good', 'Yes, with sealing plan'],
        ['Marble', 'Variable', 'Moderate', 'Usually not recommended'],
        ['Quartz/CSF', 'Variable by brand', 'Good indoors', 'Generally indoor-focused'],
      ],
    },
    relatedSlugs: [
      'porcelain-benchtops-australia-guide',
      'stone-benchtop-cost-melbourne-2026',
      'kitchen-renovation-planning-timeline-melbourne',
    ],
    pricingRelevant: true,
  },
  {
    title:
      'Waterfall Edge Benchtops: The Ultimate Design Statement for Modern Australian Kitchens',
    slug: 'waterfall-edge-benchtops-guide-australia',
    category: 'Design & Trends',
    tags: ['waterfall edge', 'benchtop design', 'kitchen island', 'luxury kitchen', 'modern design'],
    seoTitle: 'Waterfall Edge Benchtops Australia | Design Guide',
    seoDescription:
      'Waterfall edge benchtops are the ultimate kitchen luxury statement. Learn styles, materials, costs and installation details for Australian homes.',
    excerpt:
      'Waterfall edges deliver a premium architectural look, but they need careful slab selection, vein matching, and fabrication planning to justify the investment.',
    unsplashKeywords: [
      'waterfall kitchen island',
      'marble waterfall benchtop',
      'luxury kitchen island',
    ],
    publishedAt: '2025-10-28',
    sections: [
      'What a waterfall edge benchtop is and why it stands out',
      'Why waterfall edges became popular in modern Australian interiors',
      'Best stone options for consistent vein matching',
      'Single waterfall vs double waterfall design impact',
      'Island applications vs run-end applications',
      'How mitre joints are fabricated and finished',
      'Cost uplift and where the premium is created',
      'Maintenance expectations for waterfall installations',
      'When waterfall edges are worth the investment',
    ],
    tableInsertAfterSection: 6,
    table: {
      caption: 'Waterfall Edge Cost Drivers',
      headers: ['Driver', 'Why it affects cost'],
      rows: [
        ['Extra slab area', 'Vertical returns increase material requirements'],
        ['Mitre fabrication', 'Precision cutting and joining add labour'],
        ['Vein matching', 'Selecting and aligning slabs increases planning effort'],
        ['Site handling', 'Larger pieces can require extra handling resources'],
      ],
    },
    relatedSlugs: [
      'stone-benchtop-edge-profiles-guide',
      'kitchen-benchtop-trends-australia-2026',
      'best-stone-colours-small-kitchen-australia',
    ],
    pricingRelevant: true,
  },
  {
    title: 'The Best Stone Colours and Finishes for Small Kitchens in Australian Homes',
    slug: 'best-stone-colours-small-kitchen-australia',
    category: 'Design & Trends',
    tags: ['small kitchen design', 'stone colours', 'light benchtop', 'kitchen design tips', 'australia'],
    seoTitle: 'Best Stone Colours for Small Kitchens Australia 2026',
    seoDescription:
      'Make your small kitchen feel larger with the right stone colour and finish. Expert advice from Melbourne stone specialists for compact spaces.',
    excerpt:
      'Small kitchens can feel larger and brighter with the right stone tone, finish, and veining strategy. Learn what works in Melbourne apartments and townhouses.',
    unsplashKeywords: ['small kitchen design', 'white kitchen compact', 'bright kitchen renovation'],
    publishedAt: '2025-11-04',
    sections: [
      'How stone colour changes perceived space in compact kitchens',
      'Best light tones: white, cream, pale grey and soft veining',
      'How veining scale influences visual calm in small rooms',
      'Polished vs honed finishes and their effect on brightness',
      'Using dark stone successfully in smaller layouts',
      'Matching benchtops with cabinetry in tight floorplans',
      'Thickness choices that keep compact kitchens visually light',
      'Stone and splashback combinations for a larger feel',
      'Examples from Melbourne apartments and townhouses',
      'Stone styles that can overcrowd small kitchens',
    ],
    tableInsertAfterSection: 7,
    table: {
      caption: 'Small Kitchen Colour Strategy',
      headers: ['Direction', 'Effect on space', 'Practical tip'],
      rows: [
        ['Light neutral base', 'Opens the room visually', 'Pair with warm cabinet tones for balance'],
        ['Soft directional veining', 'Adds movement without clutter', 'Keep pattern scale proportional to bench length'],
        ['High contrast dark top', 'Can feel dramatic and intimate', 'Use with strong lighting and lighter vertical surfaces'],
      ],
    },
    relatedSlugs: [
      'kitchen-benchtop-trends-australia-2026',
      'kitchen-splashback-ideas-stone-vs-tile-vs-glass',
      'waterfall-edge-benchtops-guide-australia',
    ],
    pricingRelevant: true,
  },
  {
    title:
      'Kitchen Splashback Ideas: Stone vs Tile vs Glass - Which is Best for Your Australian Home?',
    slug: 'kitchen-splashback-ideas-stone-vs-tile-vs-glass',
    category: 'Design & Trends',
    tags: ['splashback ideas', 'kitchen splashback', 'stone splashback', 'tile vs glass', 'kitchen design'],
    seoTitle: 'Kitchen Splashback Ideas: Stone vs Tile vs Glass',
    seoDescription:
      'Choosing a kitchen splashback? Compare stone, tile and glass options for Australian kitchens by cost, durability and style compatibility.',
    excerpt:
      'Choosing a splashback is about more than style. Compare stone, tile, glass and porcelain panel options by cost, upkeep, and long-term design flexibility.',
    unsplashKeywords: [
      'kitchen splashback design',
      'marble splashback kitchen',
      'kitchen backsplash tile',
    ],
    publishedAt: '2025-11-11',
    sections: [
      'The role of a splashback in both function and visual composition',
      'Stone splashbacks: continuity, luxury and premium detailing',
      'Tile splashbacks: range, affordability and maintenance trade-offs',
      'Glass splashbacks: seamless appearance and cleaning benefits',
      'Porcelain panel splashbacks and why they are trending in 2026',
      'How to pair splashback choice with your benchtop material',
      'Grout colour strategy and long-term maintenance implications',
      'Budget comparison across common splashback systems',
      'What Melbourne homeowners are choosing now and why',
    ],
    tableInsertAfterSection: 7,
    table: {
      caption: 'Splashback Comparison Snapshot',
      headers: ['Option', 'Indicative cost band', 'Durability', 'Maintenance'],
      rows: [
        ['Stone slab', '$$$', 'High', 'Low to moderate'],
        ['Tile', '$-$$', 'Moderate to high', 'Moderate (grout care)'],
        ['Glass', '$$-$$$', 'Moderate', 'Low'],
        ['Porcelain panel', '$$-$$$', 'High', 'Low'],
      ],
    },
    relatedSlugs: [
      'stone-benchtop-edge-profiles-guide',
      'best-stone-colours-small-kitchen-australia',
      'kitchen-renovation-planning-timeline-melbourne',
    ],
    pricingRelevant: true,
  },
];

function parseCliOptions(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    dryRun: false,
    skipUpload: false,
    uploadDelayMs: 500,
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--skip-upload') {
      options.skipUpload = true;
      continue;
    }

    if (arg.startsWith('--upload-delay=')) {
      const raw = Number(arg.slice('--upload-delay='.length));
      if (!Number.isFinite(raw) || raw < 0) {
        throw new Error(`Invalid --upload-delay value: ${arg}`);
      }
      options.uploadDelayMs = raw;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

function hashText(input: string): number {
  const digest = createHash('sha1').update(input).digest('hex').slice(0, 8);
  return Number.parseInt(digest, 16) || 0;
}

function pick<T>(items: T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length];
}

function slugLooksValid(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(html: string): string {
  return normalizeWhitespace(
    html
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  );
}

function countWordsFromHtml(html: string): number {
  const text = stripHtml(html);
  if (!text) return 0;
  return text.split(' ').length;
}

function calculateReadTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}

function ensureLength(
  input: string,
  minLength: number,
  maxLength: number,
  paddingSentence: string,
): string {
  let value = normalizeWhitespace(input);

  while (value.length < minLength) {
    value = normalizeWhitespace(`${value} ${paddingSentence}`);
  }

  if (value.length > maxLength) {
    value = value.slice(0, maxLength);
    const lastSpace = value.lastIndexOf(' ');
    if (lastSpace > 0) {
      value = value.slice(0, lastSpace);
    }

    value = value.replace(/[\s,;:-]+$/g, '');
    if (!/[.!?]$/.test(value)) {
      value = `${value}.`;
    }
  }

  if (value.length < minLength) {
    value = value.padEnd(minLength, '.');
  }

  return value;
}

function ensureExcerpt(input: string): string {
  return ensureLength(
    input,
    150,
    160,
    'Contact VPStoneMason for tailored Melbourne advice.',
  );
}

function ensureSeoDescription(input: string): string {
  return ensureLength(
    input,
    150,
    160,
    'Contact VPStoneMason for a tailored quote.',
  );
}

function ensureSeoTitle(input: string): string {
  const normalized = normalizeWhitespace(input);
  if (normalized.length <= 60) return normalized;

  const sliced = normalized.slice(0, 60);
  const lastSpace = sliced.lastIndexOf(' ');
  return (lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced).replace(/[\s,;:-]+$/g, '');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isCloudinaryUrl(urlValue: string): boolean {
  try {
    const hostname = new URL(urlValue).hostname.toLowerCase();
    return hostname === 'res.cloudinary.com' || hostname.endsWith('.cloudinary.com');
  } catch {
    return false;
  }
}

function signatureSha1(value: string): string {
  return createHash('sha1').update(value).digest('hex');
}

function buildCloudinarySignature(
  params: Record<string, string>,
  apiSecret: string,
): string {
  const serialised = Object.keys(params)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return signatureSha1(`${serialised}${apiSecret}`);
}

async function fetchWithTimeout(
  urlValue: string,
  init: RequestInit,
  timeoutMs = 60000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(urlValue, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function getCloudinaryConfig(skipUpload: boolean): CloudinaryConfig | null {
  if (skipUpload) return null;

  const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || '').trim();
  const apiKey = String(process.env.CLOUDINARY_API_KEY || '').trim();
  const apiSecret = String(process.env.CLOUDINARY_API_SECRET || '').trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
    );
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder: CLOUDINARY_FOLDER,
  };
}

async function uploadImageUrlToCloudinary(
  sourceUrl: string,
  config: CloudinaryConfig,
  publicIdSuffix: string,
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const publicId = `${publicIdSuffix}-${signatureSha1(sourceUrl).slice(0, 10)}`;
  const transformation = 'c_fill,w_1600,h_900,q_auto:good';

  const paramsToSign: Record<string, string> = {
    folder: config.folder,
    overwrite: 'true',
    public_id: publicId,
    timestamp,
    transformation,
  };

  const signature = buildCloudinarySignature(paramsToSign, config.apiSecret);

  const form = new FormData();
  form.append('file', sourceUrl);
  form.append('api_key', config.apiKey);
  form.append('timestamp', timestamp);
  form.append('folder', config.folder);
  form.append('overwrite', 'true');
  form.append('public_id', publicId);
  form.append('transformation', transformation);
  form.append('signature', signature);

  const response = await fetchWithTimeout(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      method: 'POST',
      body: form,
    },
    120000,
  );

  const payload = (await response.json().catch(() => ({}))) as {
    secure_url?: string;
    error?: { message?: string };
  };

  if (!response.ok) {
    const reason = payload.error?.message || `HTTP ${response.status}`;
    throw new Error(`Cloudinary upload failed: ${reason}`);
  }

  if (!payload.secure_url) {
    throw new Error('Cloudinary response missing secure_url');
  }

  return payload.secure_url;
}

function buildUnsplashSourceUrl(keyword: string, seed: string): string {
  const sig = hashText(seed) % 100000;
  return `https://source.unsplash.com/1600x900/?${encodeURIComponent(
    keyword,
  )}&sig=${sig}`;
}

async function fetchUnsplashUrlsViaApi(
  keyword: string,
  count: number,
  accessKey: string,
): Promise<string[]> {
  const url = new URL('https://api.unsplash.com/photos/random');
  url.searchParams.set('query', keyword);
  url.searchParams.set('count', String(count));
  url.searchParams.set('orientation', 'landscape');

  const response = await fetchWithTimeout(
    url.toString(),
    {
      method: 'GET',
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    },
    45000,
  );

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json().catch(() => null)) as any;
  const items = Array.isArray(payload) ? payload : payload ? [payload] : [];

  const urls: string[] = [];
  for (const item of items) {
    const candidate =
      String(item?.urls?.regular || '').trim() ||
      String(item?.urls?.full || '').trim() ||
      String(item?.links?.download || '').trim();

    if (!candidate) continue;

    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        urls.push(candidate);
      }
    } catch {
      // Ignore malformed URLs.
    }
  }

  return urls;
}

async function buildUnsplashSourceList(
  post: SeedPostDefinition,
  total: number,
  unsplashAccessKey?: string,
): Promise<string[]> {
  const urls: string[] = [];
  const seen = new Set<string>();

  if (unsplashAccessKey) {
    const perKeyword = Math.max(1, Math.ceil(total / post.unsplashKeywords.length));

    for (const keyword of post.unsplashKeywords) {
      const candidates = await fetchUnsplashUrlsViaApi(
        keyword,
        perKeyword,
        unsplashAccessKey,
      );

      for (const candidate of candidates) {
        if (seen.has(candidate)) continue;
        seen.add(candidate);
        urls.push(candidate);
        if (urls.length >= total) break;
      }

      if (urls.length >= total) break;
    }
  }

  let sourceIndex = 0;
  while (urls.length < total) {
    const keyword = post.unsplashKeywords[sourceIndex % post.unsplashKeywords.length] ||
      'kitchen stone benchtop';
    const sourceUrl = buildUnsplashSourceUrl(
      keyword,
      `${post.slug}-${sourceIndex}-${Date.now()}`,
    );

    if (!seen.has(sourceUrl)) {
      seen.add(sourceUrl);
      urls.push(sourceUrl);
    }

    sourceIndex += 1;
  }

  return urls.slice(0, total);
}

function pickFallbackImage(seed: number): string {
  return FALLBACK_CLOUDINARY_IMAGES[seed % FALLBACK_CLOUDINARY_IMAGES.length];
}

function dedupePreserveOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }

  return result;
}

async function resolvePostImages(
  post: SeedPostDefinition,
  options: CliOptions,
  cloudinaryConfig: CloudinaryConfig | null,
  unsplashAccessKey?: string,
): Promise<{ featuredImage: string; additionalImages: string[] }> {
  const seed = hashText(post.slug);

  if (options.skipUpload || !cloudinaryConfig) {
    const fallbackSet = Array.from({ length: TOTAL_IMAGES_PER_POST }, (_, index) =>
      pickFallbackImage(seed + index),
    );

    return {
      featuredImage: fallbackSet[0],
      additionalImages: fallbackSet.slice(1),
    };
  }

  const sourceUrls = await buildUnsplashSourceList(
    post,
    TOTAL_IMAGES_PER_POST,
    unsplashAccessKey,
  );

  const uploadedUrls: string[] = [];

  for (let index = 0; index < TOTAL_IMAGES_PER_POST; index += 1) {
    const sourceUrl = sourceUrls[index];
    const publicIdSuffix = `${post.slug}-${index === 0 ? 'featured' : `body-${index}`}`;

    try {
      const uploadedUrl = await uploadImageUrlToCloudinary(
        sourceUrl,
        cloudinaryConfig,
        publicIdSuffix,
      );
      uploadedUrls.push(uploadedUrl);
      console.log(`  [image ${index + 1}/${TOTAL_IMAGES_PER_POST}] Uploaded ${publicIdSuffix}`);
    } catch (error) {
      const fallback = pickFallbackImage(seed + index);
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `  [image ${index + 1}/${TOTAL_IMAGES_PER_POST}] Upload failed for ${post.slug}: ${message}. Using fallback image.`,
      );
      uploadedUrls.push(fallback);
    }

    await sleep(options.uploadDelayMs);
  }

  let finalUrls = dedupePreserveOrder(uploadedUrls);
  let guard = 0;
  while (finalUrls.length < TOTAL_IMAGES_PER_POST && guard < 20) {
    finalUrls.push(pickFallbackImage(seed + finalUrls.length + guard));
    finalUrls = dedupePreserveOrder(finalUrls);
    guard += 1;
  }

  return {
    featuredImage: finalUrls[0],
    additionalImages: finalUrls.slice(1, 1 + ADDITIONAL_IMAGES_PER_POST),
  };
}

function buildTopicDetail(post: SeedPostDefinition, topic: string): string {
  const lower = topic.toLowerCase();

  if (/(price|cost|budget|quote|aud|m2|comparison)/.test(lower)) {
    return 'Use like-for-like scopes when comparing figures, because edge detail, slab yield, and installation complexity can change totals significantly even when material names look similar.';
  }

  if (/(engineered|ban|silica|csf|compliant|regulation)/.test(lower)) {
    return 'Compliance should be treated as a baseline requirement, not an optional upgrade, and every specification should be checked against current Australian rules before fabrication is approved.';
  }

  if (/(outdoor|uv|weather|coastal|alfresco)/.test(lower)) {
    return 'Outdoor surfaces must tolerate UV exposure, thermal movement, and moisture cycling, so product suitability should be confirmed for your exact orientation and climate exposure.';
  }

  if (/(maintenance|care|clean|seal|stain|etch)/.test(lower)) {
    return 'Daily care habits matter more than occasional deep cleaning, and the right pH-neutral products can preserve finish quality while reducing long-term restoration costs.';
  }

  if (/(timeline|phase|week|planning|permit|inspection)/.test(lower)) {
    return 'Sequencing is critical, because cabinetry, templating, and stone installation each depend on prior milestones being completed accurately and on time.';
  }

  if (/(edge|waterfall|mitre|profile)/.test(lower)) {
    return 'Profile and join detail influence both appearance and fabrication complexity, so this choice should be finalised with technical drawings before slabs are cut.';
  }

  if (/(small kitchen|colour|finish|vein|veining|cabinetry)/.test(lower)) {
    return 'Colour balance, pattern scale, and reflected light can make compact kitchens feel either calm and open or visually crowded, so proportion is the key design lever.';
  }

  if (/(granite|marble|quartz|quartzite|porcelain|stone)/.test(lower)) {
    return 'Each material family offers a different balance of resilience, maintenance load, and visual character, so selections should align with how the space is actually used day to day.';
  }

  return 'This decision works best when technical performance, design intent, and practical installation constraints are evaluated together rather than in isolation.';
}

function shouldMentionPricing(
  post: SeedPostDefinition,
  topic: string,
  sectionIndex: number,
): boolean {
  if (/(price|cost|budget|quote|aud|m2)/i.test(topic)) return true;
  if (post.pricingRelevant && sectionIndex === 0) return true;
  return false;
}

function shouldMentionCompliance(
  post: SeedPostDefinition,
  topic: string,
  sectionIndex: number,
): boolean {
  if (/(engineered|ban|silica|csf|compliant)/i.test(topic)) return true;
  if (post.complianceRelevant && sectionIndex === 1) return true;
  return false;
}

function composeLeadParagraph(post: SeedPostDefinition): string {
  const seed = hashText(post.slug);
  const locationA = pick(MELBOURNE_LOCATIONS, seed, 0);
  const locationB = pick(MELBOURNE_LOCATIONS, seed, 2);

  const base =
    `Planning a renovation in ${locationA}, ${locationB}, or anywhere across Melbourne and Victoria requires clear decisions on performance, design, and budget. ` +
    `This guide explains ${post.title} with practical local context so homeowners can move from inspiration to installation without costly rework. ` +
    `VPStoneMason brings more than 15 years of Australian fabrication experience, with advice tailored to real household use, realistic timelines, and reliable outcomes.`;

  return normalizeWhitespace(base);
}

function composeSectionParagraph(
  post: SeedPostDefinition,
  topic: string,
  sectionIndex: number,
): string {
  const seed = hashText(`${post.slug}-${topic}-${sectionIndex}`);
  const opener = pick(SECTION_OPENERS, seed, 0);
  const planning = pick(PLANNING_LINES, seed, 1);
  const craft = pick(CRAFT_LINES, seed, 2);
  const action = pick(ACTION_LINES, seed, 3);
  const locationA = pick(MELBOURNE_LOCATIONS, seed, 0);
  const locationB = pick(MELBOURNE_LOCATIONS, seed, 1);
  const detail = buildTopicDetail(post, topic);

  const pricingSentence = shouldMentionPricing(post, topic, sectionIndex)
    ? pick(PRICING_SENTENCES, seed, 4)
    : '';

  const complianceSentence = shouldMentionCompliance(post, topic, sectionIndex)
    ? pick(COMPLIANCE_SENTENCES, seed, 5)
    : '';

  const text = `${opener} ${detail} ${planning} In projects across ${locationA}, ${locationB}, and greater Melbourne, we confirm slab availability, access constraints, and edge detailing before fabrication starts. ${craft} ${pricingSentence} ${complianceSentence} ${action}`;
  return normalizeWhitespace(text);
}

function composeTakeawayParagraph(post: SeedPostDefinition, topic: string): string {
  const seed = hashText(`${post.slug}-${topic}-takeaway`);
  const location = pick(MELBOURNE_LOCATIONS, seed, 0);

  const text =
    `Practical takeaway for ${topic.toLowerCase()}: request a written scope that confirms brand, finish, edge profile, cut-out count, and installation assumptions. ` +
    `This keeps quote comparisons fair and reduces avoidable variation claims during delivery. ` +
    `For projects around ${location}, early sign-off on these details usually protects both timeline and finish quality.`;

  return normalizeWhitespace(text);
}

function composeFillerSection(post: SeedPostDefinition, index: number): string {
  const headings = [
    'Checklist Before Final Approval',
    'Common Mistakes to Avoid',
    'How to Get Better Quote Clarity',
    'Quality-Control Steps Before Installation Day',
  ];

  const heading = headings[index % headings.length];
  const seed = hashText(`${post.slug}-filler-${index}`);
  const locationA = pick(MELBOURNE_LOCATIONS, seed, 0);
  const locationB = pick(MELBOURNE_LOCATIONS, seed, 2);

  const paragraphOne = normalizeWhitespace(
    `Before final approval, confirm slab identifiers, edge profile drawings, appliance cut-out dimensions, and access conditions in writing. ` +
      `This level of detail helps avoid rework and protects continuity from templating through install. ` +
      `In suburbs such as ${locationA} and ${locationB}, this simple discipline is often the difference between a smooth handover and costly adjustments.`,
  );

  const paragraphTwo = normalizeWhitespace(
    `Ask your stonemason to explain what is included, what is excluded, and what assumptions sit behind the quote. ` +
      `When inclusions are explicit, homeowners can compare suppliers fairly, manage budget risk early, and keep expectations realistic throughout the project lifecycle.`,
  );

  return [
    `<h2>${escapeHtml(heading)}</h2>`,
    `<p>${escapeHtml(paragraphOne)}</p>`,
    `<p>${escapeHtml(paragraphTwo)}</p>`,
  ].join('\n');
}

function renderComparisonTable(table: ComparisonTable): string {
  const headerHtml = table.headers
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join('');

  const rowHtml = table.rows
    .map(
      (row) =>
        `<tr>${row
          .map((cell) => `<td>${escapeHtml(cell)}</td>`)
          .join('')}</tr>`,
    )
    .join('');

  return [
    '<div class="comparison-table">',
    '<table>',
    `<caption>${escapeHtml(table.caption)}</caption>`,
    `<thead><tr>${headerHtml}</tr></thead>`,
    `<tbody>${rowHtml}</tbody>`,
    '</table>',
    '</div>',
  ].join('\n');
}

function renderFaq(items: FaqItem[]): string {
  const blocks: string[] = ['<h2>Frequently Asked Questions</h2>'];

  for (const item of items) {
    blocks.push(`<h3>${escapeHtml(item.question)}</h3>`);
    blocks.push(`<p>${escapeHtml(normalizeWhitespace(item.answer))}</p>`);
  }

  return blocks.join('\n');
}

function renderRelatedLinks(
  post: SeedPostDefinition,
  titleBySlug: Map<string, string>,
): string {
  const links = post.relatedSlugs
    .filter((slug) => slug !== post.slug)
    .slice(0, 3)
    .map((slug) => {
      const title = titleBySlug.get(slug) || slug;
      return `<a href="/blog/${escapeHtml(slug)}">${escapeHtml(title)}</a>`;
    });

  if (links.length === 0) return '';

  return [
    '<h2>Related Guides</h2>',
    `<p>For deeper planning, also read ${links.join(', ')}.</p>`,
  ].join('\n');
}

function renderCtaSection(): string {
  const paragraph =
    'Ready to move from planning to installation? VPStoneMason offers free consultations, site measures, and tailored advice for Melbourne and wider Victoria. With 15+ years of stonemasonry experience, our team can guide material selection, fabrication detail, and compliant delivery from start to finish.';

  return [
    '<h2>Ready to Transform Your Kitchen?</h2>',
    `<p>${escapeHtml(paragraph)}</p>`,
    '<a href="/contact" class="cta-button">Get a Free Quote Today</a>',
  ].join('\n');
}

function buildImageAlt(post: SeedPostDefinition, topic: string, imageIndex: number): string {
  return `${post.title} - ${topic} - Melbourne kitchen inspiration image ${
    imageIndex + 1
  }`;
}

function composeArticle(
  leadParagraph: string,
  coreBlocks: string[],
  optionalBlocks: string[],
  closingBlocks: string[],
): string {
  const allBlocks = [
    `<p class="lead">${escapeHtml(leadParagraph)}</p>`,
    ...coreBlocks,
    ...optionalBlocks,
    ...closingBlocks,
  ].filter(Boolean);

  return `<article>\n${allBlocks.join('\n')}\n</article>`;
}

function buildPostContent(
  post: SeedPostDefinition,
  contentImages: string[],
  titleBySlug: Map<string, string>,
): { html: string; wordCount: number } {
  const lead = composeLeadParagraph(post);
  const coreBlocks: string[] = [];
  const optionalBlocks: string[] = [];
  let imageCursor = 0;

  for (let index = 0; index < post.sections.length; index += 1) {
    const topic = post.sections[index];
    coreBlocks.push(`<h2>${escapeHtml(topic)}</h2>`);
    coreBlocks.push(`<p>${escapeHtml(composeSectionParagraph(post, topic, index))}</p>`);

    if (index % 3 === 1) {
      coreBlocks.push('<h3>Practical takeaway</h3>');
      coreBlocks.push(
        `<p>${escapeHtml(composeTakeawayParagraph(post, topic))}</p>`,
      );
    }

    if (
      post.table &&
      typeof post.tableInsertAfterSection === 'number' &&
      index === post.tableInsertAfterSection
    ) {
      coreBlocks.push(renderComparisonTable(post.table));
    }

    const shouldInsertImage =
      imageCursor < contentImages.length && (index % 2 === 1 || index === post.sections.length - 2);

    if (shouldInsertImage) {
      const imageUrl = contentImages[imageCursor];
      const alt = buildImageAlt(post, topic, imageCursor);
      coreBlocks.push(`<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(alt)}" />`);
      imageCursor += 1;
    }
  }

  while (imageCursor < contentImages.length) {
    const topic = post.sections[post.sections.length - 1] || post.title;
    const imageUrl = contentImages[imageCursor];
    const alt = buildImageAlt(post, topic, imageCursor);
    coreBlocks.push(`<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(alt)}" />`);
    imageCursor += 1;
  }

  if (post.faq && post.faq.length > 0) {
    coreBlocks.push(renderFaq(post.faq));
  }

  const related = renderRelatedLinks(post, titleBySlug);
  const closingBlocks = [related, renderCtaSection()].filter(Boolean);

  let html = composeArticle(lead, coreBlocks, optionalBlocks, closingBlocks);
  let words = countWordsFromHtml(html);

  let fillerIndex = 0;
  while (words < MIN_WORDS && fillerIndex < 6) {
    optionalBlocks.push(composeFillerSection(post, fillerIndex));
    html = composeArticle(lead, coreBlocks, optionalBlocks, closingBlocks);
    words = countWordsFromHtml(html);
    fillerIndex += 1;
  }

  while (words > MAX_WORDS && optionalBlocks.length > 0) {
    optionalBlocks.pop();
    html = composeArticle(lead, coreBlocks, optionalBlocks, closingBlocks);
    words = countWordsFromHtml(html);
  }

  return { html, wordCount: words };
}

function normalisePostDefinitions(posts: SeedPostDefinition[]): SeedPostDefinition[] {
  return posts.map((post) => ({
    ...post,
    excerpt: ensureExcerpt(post.excerpt),
    seoTitle: ensureSeoTitle(post.seoTitle),
    seoDescription: ensureSeoDescription(post.seoDescription),
    tags: post.tags.slice(0, 6),
    sections: post.sections.filter((section) => section.trim().length > 0),
  }));
}

function validateDefinitions(posts: SeedPostDefinition[]): void {
  if (posts.length !== TOTAL_POSTS) {
    throw new Error(
      `Expected ${TOTAL_POSTS} post definitions but found ${posts.length}.`,
    );
  }

  const slugSet = new Set<string>();

  for (const post of posts) {
    if (!slugLooksValid(post.slug)) {
      throw new Error(`Invalid slug format: ${post.slug}`);
    }

    if (slugSet.has(post.slug)) {
      throw new Error(`Duplicate slug: ${post.slug}`);
    }
    slugSet.add(post.slug);

    if (!post.title.trim()) {
      throw new Error(`Missing title for slug: ${post.slug}`);
    }

    if (post.tags.length < 4 || post.tags.length > 6) {
      throw new Error(
        `Post ${post.slug} must have 4-6 tags. Found ${post.tags.length}.`,
      );
    }

    if (post.sections.length < 6) {
      throw new Error(
        `Post ${post.slug} requires at least 6 content sections.`,
      );
    }

    const publishedAt = new Date(post.publishedAt);
    if (Number.isNaN(publishedAt.getTime())) {
      throw new Error(`Invalid publishedAt date for ${post.slug}: ${post.publishedAt}`);
    }

    if (post.seoTitle.length > 60) {
      throw new Error(`seoTitle exceeds 60 characters for ${post.slug}`);
    }
  }
}

async function preparePosts(
  posts: SeedPostDefinition[],
  options: CliOptions,
): Promise<PreparedPost[]> {
  const cloudinaryConfig = getCloudinaryConfig(options.skipUpload);
  const unsplashAccessKey = String(process.env.UNSPLASH_ACCESS_KEY || '').trim() || undefined;
  const titleBySlug = new Map<string, string>(posts.map((post) => [post.slug, post.title]));

  if (unsplashAccessKey) {
    console.log('[INFO] UNSPLASH_ACCESS_KEY detected. Official Unsplash API will be used when available.');
  } else {
    console.log('[INFO] UNSPLASH_ACCESS_KEY not set. Falling back to Unsplash Source URLs.');
  }

  const prepared: PreparedPost[] = [];

  for (let index = 0; index < posts.length; index += 1) {
    const post = posts[index];
    console.log(`\n[INFO] Preparing post ${index + 1}/${posts.length}: ${post.slug}`);

    const { featuredImage, additionalImages } = await resolvePostImages(
      post,
      options,
      cloudinaryConfig,
      unsplashAccessKey,
    );

    const { html, wordCount } = buildPostContent(post, additionalImages, titleBySlug);

    if (wordCount < MIN_WORDS || wordCount > MAX_WORDS) {
      throw new Error(
        `Post ${post.slug} generated ${wordCount} words (required ${MIN_WORDS}-${MAX_WORDS}).`,
      );
    }

    const readTime = calculateReadTime(wordCount);

    const payload: Record<string, any> = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: html,
      thumbnail: featuredImage,
      featuredImage,
      images: additionalImages,
      authorName: 'VPStoneMason Team',
      status: 'published',
      publishedAt: new Date(post.publishedAt),
      category: post.category,
      tags: post.tags,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      readTime,
    };

    prepared.push({
      definition: post,
      payload,
      wordCount,
    });

    console.log(
      `[INFO] Prepared ${post.slug} | words=${wordCount} | readTime=${readTime} min | images=${additionalImages.length}`,
    );
  }

  return prepared;
}

function toDateKey(value: unknown): string {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) return 'invalid-date';
  return date.toISOString().slice(0, 10);
}

async function runSeedChecks(
  BlogModel: Model<any>,
  preparedPosts: PreparedPost[],
): Promise<void> {
  const errors: string[] = [];
  const expectedSlugs = preparedPosts.map((item) => item.definition.slug);

  const totalCount = await BlogModel.countDocuments({}).exec();
  if (totalCount !== preparedPosts.length) {
    errors.push(
      `Expected total blog count ${preparedPosts.length} after seed, found ${totalCount}.`,
    );
  }

  const docs = await BlogModel.find({ slug: { $in: expectedSlugs } }).lean().exec();
  if (docs.length !== preparedPosts.length) {
    errors.push(
      `Expected ${preparedPosts.length} seeded slugs, found ${docs.length}.`,
    );
  }

  const bySlug = new Map<string, any>(docs.map((doc: any) => [String(doc.slug), doc]));

  for (const prepared of preparedPosts) {
    const expected = prepared.definition;
    const doc = bySlug.get(expected.slug);

    if (!doc) {
      errors.push(`Missing post in DB: ${expected.slug}`);
      continue;
    }

    const featured = String(doc.featuredImage || doc.thumbnail || '').trim();
    if (!featured || !isCloudinaryUrl(featured)) {
      errors.push(`Post ${expected.slug} missing Cloudinary featured image.`);
    }

    const imageArray = Array.isArray(doc.images) ? doc.images : [];
    if (imageArray.length < 3 || imageArray.length > 5) {
      errors.push(
        `Post ${expected.slug} should have 3-5 images[] entries. Found ${imageArray.length}.`,
      );
    }

    const nonCloudinary = imageArray.filter((url: unknown) => !isCloudinaryUrl(String(url || '')));
    if (nonCloudinary.length > 0) {
      errors.push(`Post ${expected.slug} contains non-Cloudinary image URLs in images[].`);
    }

    const html = String(doc.content || '');
    if (/unsplash\.com/i.test(`${featured} ${imageArray.join(' ')} ${html}`)) {
      errors.push(`Post ${expected.slug} still references Unsplash URLs.`);
    }

    const embeddedImages = (html.match(/<img\s+[^>]*src=/gi) || []).length;
    if (embeddedImages < 3) {
      errors.push(`Post ${expected.slug} has fewer than 3 embedded <img> tags.`);
    }

    const wordCount = countWordsFromHtml(html);
    if (wordCount < MIN_WORDS || wordCount > MAX_WORDS) {
      errors.push(
        `Post ${expected.slug} has ${wordCount} words (required ${MIN_WORDS}-${MAX_WORDS}).`,
      );
    }

    const storedReadTime = Number(doc.readTime || 0);
    const calculatedReadTime = calculateReadTime(wordCount);
    if (storedReadTime !== calculatedReadTime) {
      errors.push(
        `Post ${expected.slug} readTime mismatch. stored=${storedReadTime}, expected=${calculatedReadTime}.`,
      );
    }

    const storedDate = toDateKey(doc.publishedAt);
    const expectedDate = toDateKey(expected.publishedAt);
    if (storedDate !== expectedDate) {
      errors.push(
        `Post ${expected.slug} publishedAt mismatch. stored=${storedDate}, expected=${expectedDate}.`,
      );
    }

    const seoTitle = String(doc.seoTitle || '');
    if (seoTitle.length === 0 || seoTitle.length > 60) {
      errors.push(
        `Post ${expected.slug} seoTitle invalid length (${seoTitle.length}).`,
      );
    }

    const seoDescription = String(doc.seoDescription || '');
    if (seoDescription.length < 150 || seoDescription.length > 160) {
      errors.push(
        `Post ${expected.slug} seoDescription length should be 150-160. Found ${seoDescription.length}.`,
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(`Seed verification failed:\n- ${errors.join('\n- ')}`);
  }

  console.log('[INFO] Verification checks passed for all seeded posts.');
}

async function seedBlog(): Promise<void> {
  const options = parseCliOptions();
  const normalisedPosts = normalisePostDefinitions(BLOG_POSTS);
  validateDefinitions(normalisedPosts);

  console.log('[INFO] Blog seed configuration');
  console.log(`       dryRun: ${options.dryRun}`);
  console.log(`       skipUpload: ${options.skipUpload}`);
  console.log(`       uploadDelayMs: ${options.uploadDelayMs}`);

  const preparedPosts = await preparePosts(normalisedPosts, options);

  if (options.dryRun) {
    console.log('\n[INFO] Dry run complete. No database changes were made.');
    console.log(`[INFO] Prepared ${preparedPosts.length} posts successfully.`);
    return;
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const BlogModel = app.get<Model<any>>(getModelToken('BlogPost'));

    const existingCount = await BlogModel.countDocuments({}).exec();
    console.log(`\n[INFO] Existing blog posts before delete: ${existingCount}`);

    const deleteResult = await BlogModel.deleteMany({}).exec();
    const deletedCount = Number(deleteResult.deletedCount || 0);
    console.log(`[INFO] Deleted old blog posts: ${deletedCount}`);

    const afterDeleteCount = await BlogModel.countDocuments({}).exec();
    if (afterDeleteCount !== 0) {
      throw new Error(
        `Delete confirmation failed. Expected 0 posts after delete, found ${afterDeleteCount}.`,
      );
    }

    console.log('[INFO] Delete confirmation successful. Starting insert phase...');

    for (let index = 0; index < preparedPosts.length; index += 1) {
      const prepared = preparedPosts[index];
      await BlogModel.create(prepared.payload);
      console.log(
        `[INFO] Seeded ${index + 1}/${preparedPosts.length}: ${prepared.definition.title}`,
      );
    }

    await runSeedChecks(BlogModel, preparedPosts);

    console.log(`\n[SUCCESS] Blog seeding complete. ${preparedPosts.length} posts created.`);
  } finally {
    await app.close();
  }
}

seedBlog().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n[ERROR] Blog seed failed: ${message}`);
  process.exit(1);
});
