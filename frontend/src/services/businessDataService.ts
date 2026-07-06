import { BRANCHES, PRODUCTS, SUPPLIERS } from './businessData';
import { Branch, Product, Supplier } from '../types/business';

export const businessDataService = {
  getBranches(): Branch[] {
    return BRANCHES;
  },

  getBranchById(id: string): Branch | undefined {
    return BRANCHES.find(b => b.id === id);
  },

  getProducts(): Product[] {
    return PRODUCTS;
  },

  getProductById(id: string): Product | undefined {
    return PRODUCTS.find(p => p.id === id);
  },

  getProductsByCategory(category: Product['category']): Product[] {
    return PRODUCTS.filter(p => p.category === category);
  },

  getTopSellers(): Product[] {
    return PRODUCTS.filter(p => p.isTopSeller);
  },

  getSuppliers(): Supplier[] {
    return SUPPLIERS;
  },

  getSupplierById(id: string): Supplier | undefined {
    return SUPPLIERS.find(s => s.id === id);
  }
};
