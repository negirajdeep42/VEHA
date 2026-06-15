// VEHA Jewelry Image Constants Management

export const IMAGES = {
  logo: {
    crown: '/images/logo/crown_logo.svg', // inline SVG or public asset
  },
  hero: {
    main: '/images/hero/hero_banner.jpeg',
  },
  collections: {
    royalEdit: '/images/collections/collection_cover.jpeg',
  },
  banners: {
    featured: '/images/banners/featured_collection.jpeg',
    about: '/images/banners/about_banner.jpeg',
  },
  lifestyle: {
    one: '/images/lifestyle/lifestyle_1.jpeg',
    two: '/images/lifestyle/lifestyle_2.jpeg',
    three: '/images/lifestyle/lifestyle_3.jpeg',
  },
  products: {
    detailHero: '/images/products/product_detail_hero.jpeg',
  },
  categories: {
    rings: '/images/rings/rings_cover.jpeg',
    earrings: '/images/earrings/earrings_cover.jpeg',
    necklaces: '/images/necklaces/necklaces_cover.jpeg',
    bracelets: '/images/bracelets/bracelets_cover.jpeg',
  }
};

// Fallback handlers
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" style="background:%23100F0D"><rect width="200" height="200" fill="%23100F0D"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23D9B85C">VEHA Jewelry</text></svg>';
};
