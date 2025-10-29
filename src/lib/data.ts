import type { Product } from "@/lib/types";

export type ProductDetail = Product & {
  description: string;
  images?: string[];
};

const PRODUCTS: ProductDetail[] = [
  {
    id: "p1",
    slug: "signature-sourdough",
    name: "Signature Sourdough",
    price: 45000,
    description:
      "Our classic sourdough with a deep, tangy profile and caramelized crust. Fermented for 24 hours.",
    images: [],
  },
  {
    id: "p2",
    slug: "country-loaf",
    name: "Country Loaf",
    price: 50000,
    description:
      "A rustic daily loaf with an open crumb and thin crackly crust. Great for toast and sandwiches.",
    images: [],
  },
  {
    id: "p3",
    slug: "garlic-bread",
    name: "Garlic Bread",
    price: 35000,
    description:
      "Fragrant garlic butter baked into a soft pull-apart loaf. The perfect savory snack.",
    images: [],
  },
  {
    id: "p4",
    slug: "choco-babka",
    name: "Chocolate Babka",
    price: 65000,
    description:
      "Rich chocolate swirls in tender dough, finished with a shiny syrup glaze.",
    images: [],
  },
  {
    id: "p5",
    slug: "cinnamon-roll",
    name: "Cinnamon Roll (2 pcs)",
    price: 30000,
    description:
      "Soft rolls with cinnamon-sugar spirals and a light vanilla glaze.",
    images: [],
  },
  {
    id: "p6",
    slug: "croissant",
    name: "Butter Croissant (2 pcs)",
    price: 38000,
    description:
      "Layered, flaky croissants made with cultured butter and slow fermentation.",
    images: [],
  },
  {
    id: "p7",
    slug: "brownies",
    name: "Fudgy Brownies",
    price: 55000,
    description:
      "Dense, fudgy brownies with crackly tops and deep cocoa flavor.",
    images: [],
  },
  {
    id: "p8",
    slug: "banana-bread",
    name: "Banana Bread",
    price: 42000,
    description:
      "Moist banana loaf with a hint of cinnamon—great any time of day.",
    images: [],
  },
];

export function getAllProducts(): ProductDetail[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): ProductDetail | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return PRODUCTS.map((p) => p.slug);
}
