import { Branch, Product, Supplier } from '../types/business';

export const BRANCHES: Branch[] = [
  {
    id: 'HYD-001',
    name: 'Hyderabad Central',
    location: 'Madhapur, Hyderabad',
    manager: 'Ananya Sharma',
    employeeCount: 42,
  },
  {
    id: 'VIJ-001',
    name: 'Vijayawada Central',
    location: 'Benz Circle, Vijayawada',
    manager: 'Ravi Teja',
    employeeCount: 35,
  },
  {
    id: 'WAR-001',
    name: 'Warangal Central',
    location: 'Hanamkonda, Warangal',
    manager: 'K. Prakash',
    employeeCount: 28,
  },
  {
    id: 'GNT-001',
    name: 'Guntur Central',
    location: 'Arundelpet, Guntur',
    manager: 'Srinivas Rao',
    employeeCount: 31,
  },
];

export const PRODUCTS: Product[] = [
  // Beverages (6 products, 3 top sellers)
  { id: 'P001', name: 'Nectar Fresh Apple Juice', category: 'Beverages', price: 120, cost: 80, isTopSeller: true },
  { id: 'P002', name: 'Himalayan Spring Water', category: 'Beverages', price: 50, cost: 20, isTopSeller: false },
  { id: 'P003', name: 'Organic Masala Chai Blend', category: 'Beverages', price: 250, cost: 150, isTopSeller: true },
  { id: 'P004', name: 'Carbonated Cola Fizz', category: 'Beverages', price: 80, cost: 40, isTopSeller: false },
  { id: 'P005', name: 'Roasted Almond Cold Brew', category: 'Beverages', price: 180, cost: 100, isTopSeller: true },
  { id: 'P006', name: 'Zesty Lemon Iced Tea', category: 'Beverages', price: 95, cost: 60, isTopSeller: false },

  // Dairy (6 products, 4 top sellers)
  { id: 'P007', name: 'Pure Cow Milk 1L', category: 'Dairy', price: 74, cost: 55, isTopSeller: true },
  { id: 'P008', name: 'Salted Butter Premium', category: 'Dairy', price: 260, cost: 190, isTopSeller: true },
  { id: 'P009', name: 'Probiotic Greek Yogurt', category: 'Dairy', price: 90, cost: 60, isTopSeller: false },
  { id: 'P010', name: 'Artisanal Cheddar Cheese', category: 'Dairy', price: 450, cost: 310, isTopSeller: true },
  { id: 'P011', name: 'Fresh Paneer Block 200g', category: 'Dairy', price: 150, cost: 110, isTopSeller: true },
  { id: 'P012', name: 'Organic Mozzarella Pack', category: 'Dairy', price: 320, cost: 220, isTopSeller: false },

  // Snacks (5 products, 2 top sellers)
  { id: 'P013', name: 'Spiced Potato Wafers', category: 'Snacks', price: 40, cost: 20, isTopSeller: false },
  { id: 'P014', name: 'Baked Nacho Chips', category: 'Snacks', price: 90, cost: 55, isTopSeller: true },
  { id: 'P015', name: 'Roasted Cashews Chilli', category: 'Snacks', price: 350, cost: 240, isTopSeller: true },
  { id: 'P016', name: 'Diet Multigrain Cookies', category: 'Snacks', price: 120, cost: 80, isTopSeller: false },
  { id: 'P017', name: 'Dark Chocolate Truffles', category: 'Snacks', price: 220, cost: 140, isTopSeller: false },

  // Personal Care (5 products, 1 top seller)
  { id: 'P018', name: 'Aloe Vera Hydrating Gel', category: 'Personal Care', price: 180, cost: 110, isTopSeller: false },
  { id: 'P019', name: 'Herbal Anti-Dandruff Shampoo', category: 'Personal Care', price: 290, cost: 190, isTopSeller: true },
  { id: 'P020', name: 'Charcoal Face Wash', category: 'Personal Care', price: 150, cost: 95, isTopSeller: false },
  { id: 'P021', name: 'Organic Coconut Hair Oil', category: 'Personal Care', price: 240, cost: 160, isTopSeller: false },
  { id: 'P022', name: 'Sandalwood Luxury Soap', category: 'Personal Care', price: 85, cost: 50, isTopSeller: false },

  // Household (4 products, 3 top sellers)
  { id: 'P023', name: 'Eco-Friendly Dishwash Liquid', category: 'Household', price: 160, cost: 100, isTopSeller: true },
  { id: 'P024', name: 'Microfiber Cleaning Cloths', category: 'Household', price: 110, cost: 65, isTopSeller: false },
  { id: 'P025', name: 'Multipurpose Disinfectant Spray', category: 'Household', price: 199, cost: 130, isTopSeller: true },
  { id: 'P026', name: 'Citrus Liquid Detergent 2L', category: 'Household', price: 480, cost: 320, isTopSeller: true },

  // Packaged Foods (4 products, 2 top sellers)
  { id: 'P027', name: 'Premium Basmati Rice 5kg', category: 'Packaged Foods', price: 650, cost: 460, isTopSeller: true },
  { id: 'P028', name: 'Whole Wheat Atta 5kg', category: 'Packaged Foods', price: 280, cost: 210, isTopSeller: true },
  { id: 'P029', name: 'Instant Oats Classic', category: 'Packaged Foods', price: 160, cost: 110, isTopSeller: false },
  { id: 'P030', name: 'Extra Virgin Olive Oil 1L', category: 'Packaged Foods', price: 850, cost: 620, isTopSeller: false },
];

export const SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Apex Distributors',
    categoryServed: 'Beverages & Dairy',
    reliability: 95,
  },
  {
    id: 'SUP-002',
    name: 'Krishna Agro Foods',
    categoryServed: 'Snacks & Packaged Foods',
    reliability: 92,
  },
  {
    id: 'SUP-003',
    name: 'CleanHome Solutions',
    categoryServed: 'Household',
    reliability: 96,
  },
  {
    id: 'SUP-004',
    name: 'BioCare Essentials',
    categoryServed: 'Personal Care',
    reliability: 94,
  },
];
