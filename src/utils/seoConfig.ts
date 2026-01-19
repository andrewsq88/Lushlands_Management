export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl: string;
}

const baseUrl = 'https://www.lushlandsmanagement.com';

export const seoConfig: Record<string, SEOConfig> = {
  home: {
    title: 'LushLands Management - All-in-One Property Management Platform | Landlord Software',
    description: 'International property management platform for landlords and property managers. AI-powered tenant screening, maintenance tracking, online rent collection, financing, and insurance solutions. Manage properties worldwide.',
    keywords: [
      'property management software',
      'landlord software',
      'rental property management',
      'all-in-one property platform',
      'international property management',
      'AI tenant screening',
      'online rent collection',
      'maintenance tracking software',
      'property portfolio management',
      'real estate management platform'
    ],
    ogTitle: 'LushLands Management - Complete Property Management Solution',
    ogDescription: 'Manage your rental properties with AI-powered features: tenant screening, maintenance tracking, payments, financing, and more. Trusted by landlords worldwide.',
    canonicalUrl: `${baseUrl}/`
  },

  properties: {
    title: 'Property Management | Manage Your Rental Portfolio | LushLands Management',
    description: 'Comprehensive property management system for landlords. Track multiple properties, monitor occupancy status, manage property details, view analytics, and organize your entire rental portfolio in one place.',
    keywords: [
      'property management system',
      'rental property tracking',
      'multi-property management',
      'property portfolio software',
      'vacancy management',
      'occupancy tracking',
      'property analytics dashboard',
      'residential property management',
      'commercial property management',
      'real estate portfolio management'
    ],
    ogTitle: 'Property Management System - Track All Your Rental Properties',
    ogDescription: 'Centralized property management dashboard. Track occupancy, manage details, view analytics, and organize your entire rental portfolio efficiently.',
    canonicalUrl: `${baseUrl}/properties`
  },

  tenants: {
    title: 'Tenant Management & AI Screening | Landlord Tenant Software | LushLands',
    description: 'Advanced tenant management software with AI-powered screening. Background checks, lease management, tenant communication, rental history tracking, and automated tenant onboarding for landlords and property managers.',
    keywords: [
      'tenant management software',
      'AI tenant screening',
      'tenant background checks',
      'renter screening platform',
      'lease management software',
      'tenant database management',
      'tenant communication tools',
      'rental application processing',
      'tenant onboarding automation',
      'landlord tenant software'
    ],
    ogTitle: 'AI-Powered Tenant Screening & Management Software',
    ogDescription: 'Screen tenants with AI technology, manage leases, track rental history, and streamline tenant communication. Complete tenant management solution for landlords.',
    canonicalUrl: `${baseUrl}/tenants`
  },

  maintenance: {
    title: 'Maintenance Request Tracking | AI Prioritization | Property Maintenance Software',
    description: 'Smart maintenance management system with AI-powered prioritization. Track work orders, manage maintenance requests, coordinate with contractors, schedule preventive maintenance, and reduce property repair costs.',
    keywords: [
      'maintenance request tracking',
      'work order management',
      'AI maintenance prioritization',
      'property maintenance software',
      'preventive maintenance scheduling',
      'maintenance contractor management',
      'repair tracking system',
      'maintenance ticketing system',
      'property upkeep management',
      'maintenance analytics'
    ],
    ogTitle: 'Smart Maintenance Tracking with AI Prioritization',
    ogDescription: 'AI-powered maintenance management. Automatically prioritize urgent issues, track work orders, manage contractors, and keep properties in top condition.',
    canonicalUrl: `${baseUrl}/maintenance`
  },

  payments: {
    title: 'Online Rent Collection | Automated Payment Processing | Landlord Payment Software',
    description: 'Streamlined rent collection and payment processing for landlords. Accept online payments, automate rent reminders, track payment history, process late fees, and manage multi-currency transactions worldwide.',
    keywords: [
      'online rent collection',
      'automated rent payment',
      'landlord payment processing',
      'rent collection software',
      'payment tracking system',
      'multi-currency rent payments',
      'automatic rent reminders',
      'rental income tracking',
      'payment history management',
      'secure payment processing'
    ],
    ogTitle: 'Online Rent Collection & Automated Payment Processing',
    ogDescription: 'Accept rent payments online, automate reminders, track payment history, and manage multi-currency transactions. Simplified payment management for landlords.',
    canonicalUrl: `${baseUrl}/payments`
  },

  financing: {
    title: 'Property Financing Solutions | Mortgage Partners | Real Estate Investment Funding',
    description: 'Access property financing options and mortgage partners for real estate investors. Investment property loans, refinancing solutions, partnership with top lenders, and financing calculator tools for landlords.',
    keywords: [
      'property financing solutions',
      'real estate investment funding',
      'mortgage partners for landlords',
      'investment property loans',
      'property refinancing options',
      'real estate lending partners',
      'property acquisition financing',
      'landlord financing programs',
      'rental property mortgages',
      'investment property calculator'
    ],
    ogTitle: 'Property Financing & Mortgage Partner Solutions',
    ogDescription: 'Connect with trusted mortgage partners and explore financing options for your rental properties. Investment loans, refinancing, and lending solutions for real estate investors.',
    canonicalUrl: `${baseUrl}/financing`
  },

  downPayment: {
    title: 'Down Payment Calculator | Property Investment Planning | Real Estate Financing',
    description: 'Calculate down payments for investment properties. Property financing calculator, mortgage estimate tools, investment planning resources, and down payment assistance programs for real estate investors.',
    keywords: [
      'down payment calculator',
      'property investment calculator',
      'mortgage payment estimator',
      'real estate investment planning',
      'property financing calculator',
      'down payment assistance',
      'investment property calculator',
      'property purchase planning',
      'mortgage affordability calculator',
      'real estate investment tools'
    ],
    ogTitle: 'Property Down Payment Calculator & Investment Planning Tools',
    ogDescription: 'Calculate down payments, estimate mortgages, and plan your property investments. Free tools and resources for real estate investors and landlords.',
    canonicalUrl: `${baseUrl}/down-payment`
  },

  subscription: {
    title: 'Pricing & Plans | Property Management Software Subscription | LushLands',
    description: 'Flexible property management software pricing plans. Free tier for small landlords, premium features for growing portfolios, enterprise solutions for property managers. Transparent pricing with no hidden fees.',
    keywords: [
      'property management software pricing',
      'landlord software subscription',
      'property management plans',
      'free property management software',
      'premium landlord features',
      'property management software cost',
      'subscription plans for landlords',
      'enterprise property management',
      'affordable property software',
      'property management pricing comparison'
    ],
    ogTitle: 'Property Management Software Pricing & Subscription Plans',
    ogDescription: 'Choose the perfect plan for your property portfolio. Free tier available. Premium features include AI screening, advanced analytics, and priority support.',
    canonicalUrl: `${baseUrl}/subscription`
  }
};

export const getPageSEO = (page: string): SEOConfig => {
  return seoConfig[page] || seoConfig.home;
};

export const generateStructuredData = {
  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url
    }))
  }),

  faq: (faqs: Array<{ question: string; answer: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  }),

  service: (serviceName: string, description: string, areaServed: string = 'Worldwide') => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    'serviceType': serviceName,
    'provider': {
      '@type': 'Organization',
      'name': 'LushLands Management'
    },
    'description': description,
    'areaServed': areaServed,
    'availableChannel': {
      '@type': 'ServiceChannel',
      'serviceUrl': baseUrl
    }
  }),

  product: (name: string, description: string, price: string, currency: string = 'USD') => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': name,
    'description': description,
    'offers': {
      '@type': 'Offer',
      'price': price,
      'priceCurrency': currency,
      'availability': 'https://schema.org/InStock',
      'url': baseUrl
    }
  })
};
