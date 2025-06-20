import { createItem } from '../services/itemService';
import { createLead } from '../services/leadService';

export const createSampleItems = async (userId) => {
  const sampleItems = [
    {
      name: 'Website Development',
      description: 'Custom website development with modern design',
      sku: 'WEB-001',
      price: 50000,
      type: 'service',
      category: 'Web Services',
      unit: 'project'
    },
    {
      name: 'Mobile App Development',
      description: 'Native mobile app for iOS and Android',
      sku: 'APP-001',
      price: 80000,
      type: 'service',
      category: 'Mobile Services',
      unit: 'project'
    },
    {
      name: 'SEO Optimization',
      description: 'Search engine optimization service',
      sku: 'SEO-001',
      price: 15000,
      type: 'service',
      category: 'Marketing',
      unit: 'month'
    },
    {
      name: 'Hosting Service',
      description: 'Web hosting with SSL certificate',
      sku: 'HOST-001',
      price: 2000,
      type: 'service',
      category: 'Hosting',
      unit: 'month'
    },
    {
      name: 'Logo Design',
      description: 'Professional logo design with revisions',
      sku: 'LOGO-001',
      price: 8000,
      type: 'service',
      category: 'Design',
      unit: 'piece'
    }
  ];

  const results = [];
  for (const item of sampleItems) {
    const result = await createItem(item, userId);
    results.push(result);
  }
  
  return results;
};

export const createSampleLeads = async (userId) => {
  const sampleLeads = [
    {
      name: 'John Doe',
      email: 'john.doe@company.com',
      phone: '+254712345678',
      company: 'Tech Solutions Ltd',
      source: 'website',
      status: 'new',
      value: 50000,
      notes: 'Interested in website development for their startup'
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@business.com',
      phone: '+254723456789',
      company: 'Business Corp',
      source: 'referral',
      status: 'contacted',
      value: 80000,
      notes: 'Needs mobile app for their e-commerce business'
    },
    {
      name: 'Mike Johnson',
      email: 'mike@restaurant.com',
      phone: '+254734567890',
      company: 'Restaurant Chain',
      source: 'social_media',
      status: 'qualified',
      value: 25000,
      notes: 'Looking for website and SEO services'
    }
  ];

  const results = [];
  for (const lead of sampleLeads) {
    const result = await createLead(lead, userId);
    results.push(result);
  }
  
  return results;
};