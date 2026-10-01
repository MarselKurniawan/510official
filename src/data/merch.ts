import type { Lang } from "@/lib/i18n";

export type MerchBadge = "new" | "pre_order" | null;

export type MerchItem = {
  name: Record<Lang, string>;
  price: string;
  url: string;
  images: string[];
  badge: MerchBadge;
  in_stock: boolean;
};

export const MERCH: MerchItem[] = [
  {
    name: { EN: "Ember Sigil Tee", ID: "Kaos Ember Sigil" },
    price: "IDR 285K",
    url: "#",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200",
    ],
    badge: "new",
    in_stock: true,
  },
  {
    name: { EN: "Void Hoodie", ID: "Hoodie Void" },
    price: "IDR 645K",
    url: "#",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200",
    ],
    badge: null,
    in_stock: false,
  },
  {
    name: { EN: "Ripple LP — Vinyl", ID: "Ripple LP — Vinil" },
    price: "IDR 520K",
    url: "#",
    images: [
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1200",
      "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=1200",
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200",
    ],
    badge: "pre_order",
    in_stock: true,
  },
  {
    name: { EN: "Sigil Enamel Pin", ID: "Pin Enamel Sigil" },
    price: "IDR 85K",
    url: "#",
    images: [
      "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=1200",
      "https://images.unsplash.com/photo-1611915387288-fd8d2f5f928b?w=1200",
    ],
    badge: null,
    in_stock: true,
  },
  {
    name: { EN: "Tour Poster A2", ID: "Poster Tur A2" },
    price: "IDR 120K",
    url: "#",
    images: [
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200",
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200",
    ],
    badge: "new",
    in_stock: true,
  },
  {
    name: { EN: "Cassette — Live Sessions", ID: "Kaset — Live Sessions" },
    price: "IDR 175K",
    url: "#",
    images: [
      "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=1200",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200",
    ],
    badge: null,
    in_stock: true,
  },
];
