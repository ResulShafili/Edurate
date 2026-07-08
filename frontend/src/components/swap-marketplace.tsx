"use client";

import {
  Mail,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  ShoppingBag,
  Tag,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { MarketplaceItemForm } from "@/components/marketplace-item-form";
import {
  conditionLabels,
  formatMarketDate,
  formatMarketPrice,
  getSellerContactHref,
  getSellerContactText,
  marketplaceApiBaseUrl,
  marketplaceCategories,
  mockMarketItems,
} from "@/lib/marketplace";
import type {
  MarketItem,
  MarketplaceCategorySlug,
} from "@/lib/marketplace";

type MarketplaceResponse = {
  items?: MarketItem[];
};

function searchItems(items: MarketItem[], search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return items;
  }

  return items.filter((item) =>
    `${item.title} ${item.description} ${item.categoryName} ${item.campusLocation || ""}`
      .toLowerCase()
      .includes(normalizedSearch),
  );
}

function MarketItemCard({ item, priority }: { item: MarketItem; priority: boolean }) {
  const isSwap = item.priceCents <= 0;
  const contactIcon =
    item.contactMethod === "whatsapp" ? (
      <MessageCircle className="size-4" />
    ) : (
      <Mail className="size-4" />
    );

  return (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          alt={item.title}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          fill
          priority={priority}
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          src={item.imageUrl}
        />
        <div className="absolute left-4 top-4 rounded-xl bg-white/85 px-2 py-1 text-xs font-semibold text-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
          {item.categoryName}
        </div>
        <div
          className={`absolute bottom-4 left-4 rounded-xl px-2 py-1 text-xs font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md ${
            isSwap
              ? "bg-teal-50/92 text-teal-700"
              : "bg-white/92 text-gray-900"
          }`}
        >
          {formatMarketPrice(item)}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-6 text-gray-900">{item.title}</h2>
            <p className="mt-2 hidden line-clamp-2 text-sm leading-6 text-gray-600 md:block">{item.description}</p>
          </div>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShoppingBag className="size-4" />
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-2 py-1 text-xs text-gray-500">
            <span>{item.sellerName}</span>
            <span>{formatMarketDate(item.createdAt)}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-2 py-1 text-xs text-gray-500">
              <Tag className="size-3.5" />
              {conditionLabels[item.condition]}
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-2 py-1 text-xs text-gray-500">
              <MapPin className="size-3.5" />
              <span className="truncate">{item.campusLocation || "Kampus"}</span>
            </div>
          </div>
        </div>

        {isSwap && item.swapNote && (
          <p className="mt-4 rounded-xl bg-teal-50 px-2 py-1 text-xs leading-5 text-teal-700">
            {item.swapNote}
          </p>
        )}

        <a
          aria-label={`Satıcı ilə əlaqə: ${getSellerContactText(item)}`}
          className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 text-sm font-semibold text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 md:hover:-translate-y-0.5 md:hover:shadow-md"
          href={getSellerContactHref(item)}
          rel="noreferrer"
          target={item.contactMethod === "whatsapp" ? "_blank" : undefined}
          title={getSellerContactText(item)}
        >
          {contactIcon}
          Satıcı ilə əlaqə
        </a>
      </div>
    </article>
  );
}

export function SwapMarketplace() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategorySlug>("all");
  const [items, setItems] = useState<MarketItem[]>(mockMarketItems);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadItems() {
      if (!marketplaceApiBaseUrl) {
        const filteredByCategory =
          selectedCategory === "all"
            ? mockMarketItems
            : mockMarketItems.filter((item) => item.categorySlug === selectedCategory);

        setItems(searchItems(filteredByCategory, search));
        return;
      }

      setIsLoading(true);

      try {
        const params = new URLSearchParams();

        if (selectedCategory !== "all") {
          params.set("category", selectedCategory);
        }

        if (search.trim()) {
          params.set("search", search.trim());
        }

        const response = await fetch(`${marketplaceApiBaseUrl}/api/marketplace?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Marketplace request failed");
        }

        const data = (await response.json()) as MarketplaceResponse;
        setItems(data.items || []);
      } catch {
        if (!controller.signal.aborted) {
          const filteredByCategory =
            selectedCategory === "all"
              ? mockMarketItems
              : mockMarketItems.filter((item) => item.categorySlug === selectedCategory);

          setItems(searchItems(filteredByCategory, search));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    const timer = window.setTimeout(loadItems, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [search, selectedCategory]);

  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (first, second) =>
          new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
      ),
    [items],
  );

  function handleItemCreated(item: MarketItem) {
    setItems((currentItems) => [item, ...currentItems]);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-4 md:flex md:items-end md:justify-between md:space-y-0">
        <div>
          <p className="hidden text-xs font-medium uppercase tracking-[0.16em] text-gray-400 md:block">
            Modul E · Swap
          </p>
          <h1 className="text-2xl font-semibold tracking-normal text-gray-900 md:mt-1 md:text-3xl">
            Kampus bazarı
          </h1>
          <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-gray-600 md:block">
            Kitab, texnologiya və kampus əşyalarını elan kimi paylaş, sonra satıcı ilə kənarda əlaqə saxla.
          </p>
        </div>

        <div className="space-y-3 md:flex md:items-center md:gap-3 md:space-y-0">
          <label className="relative block w-full md:w-[360px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              className="min-h-[48px] w-full rounded-2xl border border-gray-200 bg-slate-50 pl-11 pr-4 text-sm text-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] outline-none transition focus:border-gray-400 focus:ring-0"
              placeholder="Elan, kateqoriya və ya məkan axtar"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <button
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 text-sm font-semibold text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 md:w-auto md:hover:-translate-y-0.5 md:hover:shadow-md"
            type="button"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="size-4" />
            Elan əlavə et
          </button>
        </div>
      </header>

      <section className="rounded-3xl bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex gap-3 overflow-x-auto">
          {marketplaceCategories.map((category) => (
            <button
              className={`min-h-[44px] shrink-0 rounded-2xl px-4 text-xs font-semibold transition-all duration-300 md:hover:-translate-y-0.5 md:hover:shadow-md ${
                selectedCategory === category.slug
                  ? "bg-gray-900 text-white"
                  : "bg-slate-50 text-gray-600"
              }`}
              key={category.slug}
              type="button"
              onClick={() => setSelectedCategory(category.slug)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sortedItems.map((item, index) => (
          <MarketItemCard item={item} key={item.id} priority={index < 4} />
        ))}
      </section>

      {sortedItems.length === 0 && (
        <div className="rounded-3xl bg-white p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <ShoppingBag className="mx-auto size-6 text-teal-700" />
          <p className="mt-3 text-sm font-semibold text-gray-900">Elan tapılmadı</p>
          <p className="mt-1 text-sm text-gray-500">Başqa kateqoriya və ya açar sözlə axtar.</p>
        </div>
      )}

      {isLoading && (
        <p className="text-center text-xs font-medium text-gray-400">Yenilənir...</p>
      )}

      <MarketplaceItemForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onItemCreated={handleItemCreated}
      />
    </div>
  );
}
