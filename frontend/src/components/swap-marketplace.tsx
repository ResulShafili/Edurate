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
    <article className="group overflow-hidden rounded-lg border border-white/70 bg-white/84 shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f7f5f0]">
        <Image
          alt={item.title}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          fill
          priority={priority}
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          src={item.imageUrl}
        />
        <div className="absolute left-3 top-3 rounded-lg border border-white/70 bg-white/86 px-2 py-1 text-xs font-semibold text-foreground shadow-[0_8px_20px_rgba(31,28,24,0.10)] backdrop-blur-md">
          {item.categoryName}
        </div>
        <div
          className={`absolute bottom-3 left-3 rounded-lg px-3 py-2 text-sm font-semibold shadow-[0_10px_24px_rgba(31,28,24,0.14)] backdrop-blur-md ${
            isSwap
              ? "bg-[#eef6f1]/92 text-sage"
              : "bg-white/92 text-foreground"
          }`}
        >
          {formatMarketPrice(item)}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-6 text-foreground">{item.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{item.description}</p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#fbf4e5] text-[#8a6f45]">
            <ShoppingBag className="size-4" />
          </span>
        </div>

        <div className="mt-4 grid gap-2">
          <div className="flex items-center justify-between gap-3 rounded-lg bg-[#f7f5f0] px-3 py-2 text-xs text-muted">
            <span>{item.sellerName}</span>
            <span>{formatMarketDate(item.createdAt)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-xs text-muted">
              <Tag className="size-3.5" />
              {conditionLabels[item.condition]}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-xs text-muted">
              <MapPin className="size-3.5" />
              <span className="truncate">{item.campusLocation || "Kampus"}</span>
            </div>
          </div>
        </div>

        {isSwap && item.swapNote && (
          <p className="mt-3 rounded-lg border border-[#dce8de] bg-[#f3faf5] px-3 py-2 text-xs leading-5 text-[#4f745f]">
            {item.swapNote}
          </p>
        )}

        <a
          aria-label={`Satıcı ilə əlaqə: ${getSellerContactText(item)}`}
          className="mt-4 flex h-10 items-center justify-center gap-2 rounded-lg bg-ink px-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(38,52,47,0.16)] transition hover:-translate-y-0.5 hover:bg-[#1f2b27] hover:shadow-md"
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
    <div className="space-y-4">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Modul E · Swap
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
            Kampus bazarı
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Kitab, texnologiya və kampus əşyalarını elan kimi paylaş, sonra satıcı ilə kənarda əlaqə saxla.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative block w-full sm:w-[360px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              className="h-11 w-full rounded-lg border border-line bg-white/82 pl-9 pr-3 text-sm shadow-[0_10px_28px_rgba(31,28,24,0.06)] outline-none backdrop-blur-md transition focus:border-sage"
              placeholder="Elan, kateqoriya və ya məkan axtar"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <button
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(38,52,47,0.18)] transition hover:-translate-y-0.5 hover:bg-[#1f2b27] hover:shadow-md"
            type="button"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="size-4" />
            Elan əlavə et
          </button>
        </div>
      </header>

      <section className="rounded-lg border border-white/70 bg-white/68 p-3 shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl">
        <div className="flex gap-2 overflow-x-auto">
          {marketplaceCategories.map((category) => (
            <button
              className={`h-9 shrink-0 rounded-lg border px-3 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-md ${
                selectedCategory === category.slug
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white/84 text-muted"
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

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {sortedItems.map((item, index) => (
          <MarketItemCard item={item} key={item.id} priority={index < 4} />
        ))}
      </section>

      {sortedItems.length === 0 && (
        <div className="rounded-lg border border-white/70 bg-white/84 p-8 text-center shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl">
          <ShoppingBag className="mx-auto size-6 text-sage" />
          <p className="mt-3 text-sm font-semibold">Elan tapılmadı</p>
          <p className="mt-1 text-sm text-muted">Başqa kateqoriya və ya açar sözlə axtar.</p>
        </div>
      )}

      {isLoading && (
        <p className="text-center text-xs font-medium text-muted">Yenilənir...</p>
      )}

      <MarketplaceItemForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onItemCreated={handleItemCreated}
      />
    </div>
  );
}
