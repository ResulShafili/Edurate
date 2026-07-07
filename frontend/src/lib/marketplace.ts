export type MarketplaceCategorySlug = "all" | "books" | "technology" | "clothing" | "other";

export type MarketplaceCondition = "new" | "like_new" | "good" | "fair" | "poor";

export type MarketplaceContactMethod = "whatsapp" | "email";

export type MarketItem = {
  id: string;
  sellerId?: string;
  sellerName: string;
  categoryId?: string;
  categoryName: string;
  categorySlug: Exclude<MarketplaceCategorySlug, "all">;
  title: string;
  description: string;
  priceCents: number;
  currency: "AZN";
  swapNote: string | null;
  condition: MarketplaceCondition;
  status: "available" | "reserved" | "sold" | "removed";
  campusLocation: string | null;
  contactMethod: MarketplaceContactMethod;
  contactValue: string;
  imageUrl: string;
  createdAt: string;
};

export const marketplaceApiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";

export const marketplaceCategories = [
  { slug: "all", label: "Hamısı" },
  { slug: "books", label: "Kitablar" },
  { slug: "technology", label: "Texnologiya" },
  { slug: "clothing", label: "Geyim" },
  { slug: "other", label: "Digər" },
] as const;

export const conditionLabels: Record<MarketplaceCondition, string> = {
  new: "Yeni",
  like_new: "Yeni kimi",
  good: "Yaxşı",
  fair: "Normal",
  poor: "Təmirli",
};

export const mockMarketItems: MarketItem[] = [
  {
    id: "market-1",
    sellerName: "Anonim tələbə",
    categoryName: "Kitablar",
    categorySlug: "books",
    title: "Introduction to Algorithms kitabı",
    description: "CLRS kitabının az istifadə olunmuş nüsxəsi. Algorithms dərsi üçün idealdır.",
    priceCents: 2800,
    currency: "AZN",
    swapNote: null,
    condition: "good",
    status: "available",
    campusLocation: "Kitabxana girişi",
    contactMethod: "whatsapp",
    contactValue: "+994501234567",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-07-06T11:40:00.000Z",
  },
  {
    id: "market-2",
    sellerName: "Nihat",
    categoryName: "Texnologiya",
    categorySlug: "technology",
    title: "USB-C adapter və HDMI keçid",
    description: "MacBook və ultrabook-lar üçün işlək adapter. Power delivery dəstəkləyir.",
    priceCents: 0,
    currency: "AZN",
    swapNote: "Qısa Type-C kabel və ya laptop stendi ilə dəyişmək olar.",
    condition: "like_new",
    status: "available",
    campusLocation: "Korpus B",
    contactMethod: "email",
    contactValue: "nihat@karabakh.edu.az",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-07-05T15:15:00.000Z",
  },
  {
    id: "market-3",
    sellerName: "Anonim tələbə",
    categoryName: "Geyim",
    categorySlug: "clothing",
    title: "Holberton hoodie",
    description: "M ölçü, çox az geyinilib. Eyni ölçüdə qara hoodie ilə swap mümkündür.",
    priceCents: 3500,
    currency: "AZN",
    swapNote: null,
    condition: "like_new",
    status: "available",
    campusLocation: "Cafeteria",
    contactMethod: "whatsapp",
    contactValue: "+994551112233",
    imageUrl: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-07-04T18:30:00.000Z",
  },
  {
    id: "market-4",
    sellerName: "Aysu",
    categoryName: "Digər",
    categorySlug: "other",
    title: "Desk lamp və notebook seti",
    description: "Gecə oxumaq üçün rahat lampa, yanında istifadə olunmamış A5 dəftər.",
    priceCents: 1400,
    currency: "AZN",
    swapNote: null,
    condition: "good",
    status: "available",
    campusLocation: "Study room",
    contactMethod: "email",
    contactValue: "aysu@karabakh.edu.az",
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    createdAt: "2026-07-03T10:10:00.000Z",
  },
];

export function formatMarketPrice(item: Pick<MarketItem, "priceCents" | "currency">) {
  if (item.priceCents <= 0) {
    return "Dəyiş-toxuş";
  }

  return `${(item.priceCents / 100).toFixed(2)} ${item.currency}`;
}

export function formatMarketDate(value: string) {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export function getSellerContactHref(item: Pick<MarketItem, "contactMethod" | "contactValue">) {
  if (item.contactMethod === "whatsapp") {
    const digits = item.contactValue.replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}` : "#";
  }

  return `mailto:${item.contactValue}`;
}

export function getSellerContactText(item: Pick<MarketItem, "contactMethod" | "contactValue">) {
  return item.contactMethod === "whatsapp" ? "WhatsApp" : item.contactValue;
}
