export const PRODUCT_LABELS = {
  catalog: {
    title: 'Products Catalog',
    subtitle: 'Browse our complete selection of electronic components',
    searchPlaceholder: 'Search products...',
    searchButton: 'Search',
    filtersButton: 'Filters',
    applyFilters: 'Apply Filters',
    clearAll: 'Clear All',
    showingResults: 'Showing {count} of {total} products',
    loading: 'Loading...',
    noProducts: 'No products found',
    sortBy: 'Sort by:',
  },
  filters: {
    category: 'Category',
    allCategories: 'All Categories',
    condition: 'Condition',
    allConditions: 'All Conditions',
    conditionNew: 'New',
    conditionUsed: 'Used',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    vendor: 'Vendor',
    allVendors: 'All Vendors',
  },
  sorting: {
    newest: 'Newest',
    oldest: 'Oldest',
    priceLowToHigh: 'Price: Low to High',
    priceHighToLow: 'Price: High to Low',
    nameAtoZ: 'Name: A to Z',
    nameZtoA: 'Name: Z to A',
  },
  card: {
    viewDetails: 'View Details',
    addToWishlist: 'Add to Wishlist',
    addToCompare: 'Add to Compare',
    by: 'by',
  },
  details: {
    backToProducts: 'Back to Products',
    description: 'Description',
    specifications: 'Product Specifications',
    relatedProducts: 'Related Products',
    quantity: 'Quantity:',
    addToCart: 'Add to Cart',
    wishlist: 'Wishlist',
    makeOffer: 'Make Offer',
    signInToPurchase: 'Sign In to Purchase',
    buyersOnly: 'Only buyers can purchase products. Switch to a buyer account to add items to cart.',
    category: 'Category',
    vendor: 'Sold by:',
    productId: 'Product ID:',
    condition: 'Condition:',
    priceIncludesVat: 'Price includes VAT',
    qualityAssured: 'Quality Assured',
    fastDelivery: 'Fast Delivery',
    securePayment: 'Secure Payment',
  },
  errors: {
    loadFailed: 'Failed to load products',
    productNotFound: 'Product not found',
    tryAgain: 'Try Again',
    browseProducts: 'Browse Products',
  },
  pagination: {
    previous: 'Previous',
    next: 'Next',
  },
};

export const PRODUCT_CONDITIONS = {
  NEW: 'new',
  USED: 'used',
} as const;

export const SORT_OPTIONS = {
  NEWEST: { sortBy: 'created_at', sortOrder: 'desc' },
  OLDEST: { sortBy: 'created_at', sortOrder: 'asc' },
  PRICE_LOW: { sortBy: 'price', sortOrder: 'asc' },
  PRICE_HIGH: { sortBy: 'price', sortOrder: 'desc' },
  NAME_ASC: { sortBy: 'name', sortOrder: 'asc' },
  NAME_DESC: { sortBy: 'name', sortOrder: 'desc' },
} as const;

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 12,
} as const;
