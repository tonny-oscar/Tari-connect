import { create } from 'zustand';

const translations = {
  en: {
    welcome: 'Welcome back',
    dashboard: 'Dashboard',
    leads: 'Leads',
    quotes: 'Quotes',
    invoices: 'Invoices',
    items: 'Items',
    aiAgent: 'AI Agent Hub',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
    totalLeads: 'Total Leads',
    activeQuotes: 'Active Quotes',
    totalRevenue: 'Total Revenue',
    pendingRevenue: 'Pending Revenue',
    manageLead: 'Manage Leads',
    createQuotes: 'Create Quotes',
    manageInvoices: 'Manage Invoices',
    productCatalog: 'Product Catalog',
    aiChat: '🤖 AI Chat',
    autoReplies: '⚡ Auto Replies',
    templates: '📝 Templates',
    aiSettings: '⚙️ Settings',
    businessToday: "Here's what's happening with your business today.",
    newThisMonth: 'new this month',
    pending: 'pending',
    paidInvoices: 'paid invoices',
    unpaid: 'unpaid'
  },
  es: {
    welcome: 'Bienvenido de nuevo',
    dashboard: 'Panel de Control',
    leads: 'Prospectos',
    quotes: 'Cotizaciones',
    invoices: 'Facturas',
    items: 'Artículos',
    aiAgent: 'Centro de Agente IA',
    settings: 'Configuración',
    profile: 'Perfil',
    logout: 'Cerrar Sesión',
    totalLeads: 'Total de Prospectos',
    activeQuotes: 'Cotizaciones Activas',
    totalRevenue: 'Ingresos Totales',
    pendingRevenue: 'Ingresos Pendientes',
    manageLead: 'Gestionar Prospectos',
    createQuotes: 'Crear Cotizaciones',
    manageInvoices: 'Gestionar Facturas',
    productCatalog: 'Catálogo de Productos',
    aiChat: '🤖 Chat IA',
    autoReplies: '⚡ Respuestas Automáticas',
    templates: '📝 Plantillas',
    aiSettings: '⚙️ Configuración',
    businessToday: 'Esto es lo que está pasando con tu negocio hoy.',
    newThisMonth: 'nuevos este mes',
    pending: 'pendientes',
    paidInvoices: 'facturas pagadas',
    unpaid: 'sin pagar'
  },
  fr: {
    welcome: 'Bon retour',
    dashboard: 'Tableau de Bord',
    leads: 'Prospects',
    quotes: 'Devis',
    invoices: 'Factures',
    items: 'Articles',
    aiAgent: 'Centre Agent IA',
    settings: 'Paramètres',
    profile: 'Profil',
    logout: 'Déconnexion',
    totalLeads: 'Total des Prospects',
    activeQuotes: 'Devis Actifs',
    totalRevenue: 'Revenus Totaux',
    pendingRevenue: 'Revenus en Attente',
    manageLead: 'Gérer les Prospects',
    createQuotes: 'Créer des Devis',
    manageInvoices: 'Gérer les Factures',
    productCatalog: 'Catalogue de Produits',
    aiChat: '🤖 Chat IA',
    autoReplies: '⚡ Réponses Auto',
    templates: '📝 Modèles',
    aiSettings: '⚙️ Paramètres',
    businessToday: 'Voici ce qui se passe avec votre entreprise aujourd\'hui.',
    newThisMonth: 'nouveaux ce mois',
    pending: 'en attente',
    paidInvoices: 'factures payées',
    unpaid: 'impayées'
  }
};

export const useLanguage = create((set, get) => ({
  language: localStorage.getItem('language') || 'en',
  
  setLanguage: (lang) => {
    set({ language: lang });
    localStorage.setItem('language', lang);
  },
  
  t: (key) => {
    const { language } = get();
    return translations[language]?.[key] || translations.en[key] || key;
  }
}));