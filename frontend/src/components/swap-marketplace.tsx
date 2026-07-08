"use client";

import {
  CalendarDays,
  ChevronRight,
  Mail,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  ShoppingBag,
  Tag,
  UserRound,
  X,
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

function MarketItemCard({
  item,
  priority,
  onSelect,
}: {
  item: MarketItem;
  priority: boolean;
  onSelect: (item: MarketItem) => void;
}) {
  const isSwap = item.priceCents <= 0;

  return (
    <button
      aria-label={`${item.title} elanına bax`}
      className="group grid w-full grid-cols-[96px_1fr] gap-3 rounded-3xl bg-white p-3 text-left shadow-[0_8px_30px_rgb(0,0,0,0.035)] transition-all duration-300 md:block md:overflow-hidden md:p-0 md:hover:-translate-y-1 md:hover:shadow-md"
      type="button"
      onClick={() => onSelect(item)}
    >
      <div className="relative aspect-square w-24 overflow-hidden rounded-2xl bg-slate-100 md:aspect-[4/3] md:w-full md:rounded-none">
        <Image
          alt={item.title}
          className="object-cover transition duration-500 md:group-hover:scale-[1.03]"
          fill
          priority={priority}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 96px"
          src={item.imageUrl}
        />
        <div className="absolute left-4 top-4 hidden rounded-full bg-white/86 px-2 py-1 text-xs font-semibold text-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md md:block">
          {item.categoryName}
        </div>
        <div
          className={`absolute bottom-4 left-4 hidden rounded-full px-2 py-1 text-xs font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md md:block ${
            isSwap
              ? "bg-teal-50/92 text-teal-700"
              : "bg-white/92 text-gray-900"
          }`}
        >
          {formatMarketPrice(item)}
        </div>
      </div>

      <div className="min-w-0 p-1 md:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">
              {item.categoryName}
            </p>
            <h2 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-gray-900 md:mt-0 md:text-base md:leading-6">
              {item.title}
            </h2>
          </div>
          <ChevronRight className="mt-1 size-4 shrink-0 text-gray-300 transition md:group-hover:translate-x-0.5 md:group-hover:text-gray-900" />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              isSwap ? "bg-teal-50 text-teal-700" : "bg-gray-900 text-white"
            }`}
          >
            {formatMarketPrice(item)}
          </span>
          <span className="rounded-full bg-slate-50 px-2 py-1 text-xs text-gray-500">
            {conditionLabels[item.condition]}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{item.campusLocation || "Kampus"}</span>
        </div>

        <p className="mt-3 hidden line-clamp-2 text-sm leading-6 text-gray-600 md:block">
          {item.description}
        </p>
      </div>
    </button>
  );
}

function MarketItemDetailModal({
  item,
  onClose,
}: {
  item: MarketItem | null;
  onClose: () => void;
}) {
  if (!item) {
    return null;
  }

  const isSwap = item.priceCents <= 0;
  const contactIcon =
    item.contactMethod === "whatsapp" ? (
      <MessageCircle className="size-4" />
    ) : (
      <Mail className="size-4" />
    );

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end bg-slate-950/25 px-3 py-3 backdrop-blur-sm sm:items-center sm:justify-center"
      role="dialog"
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 sm:aspect-[16/9]">
          <Image
            alt={item.title}
            className="object-cover"
            fill
            sizes="(min-width: 768px) 672px, 100vw"
            src={item.imageUrl}
          />
          <button
            aria-label="Detal pəncərəsini bağla"
            className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-2xl bg-white/88 text-gray-500 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md transition hover:text-gray-900"
            type="button"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold text-gray-600">
              {item.categoryName}
            </span>
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                isSwap ? "bg-teal-50 text-teal-700" : "bg-gray-900 text-white"
              }`}
            >
              {formatMarketPrice(item)}
            </span>
          </div>

          <h2 className="mt-4 text-xl font-semibold leading-7 text-gray-900 sm:text-2xl">
            {item.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">{item.description}</p>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-3 text-xs text-gray-500">
              <div className="flex items-center gap-2 font-medium text-gray-900">
                <UserRound className="size-3.5" />
                Satıcı
              </div>
              <p className="mt-2 truncate">{item.sellerName}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 text-xs text-gray-500">
              <div className="flex items-center gap-2 font-medium text-gray-900">
                <MapPin className="size-3.5" />
                Məkan
              </div>
              <p className="mt-2 truncate">{item.campusLocation || "Kampus"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 text-xs text-gray-500">
              <div className="flex items-center gap-2 font-medium text-gray-900">
                <Tag className="size-3.5" />
                Vəziyyət
              </div>
              <p className="mt-2">{conditionLabels[item.condition]}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <CalendarDays className="size-3.5" />
            {formatMarketDate(item.createdAt)}
          </div>

          {isSwap && item.swapNote && (
            <p className="mt-4 rounded-2xl bg-teal-50 px-4 py-3 text-xs leading-5 text-teal-700">
              {item.swapNote}
            </p>
          )}

          <a
            aria-label={`Satıcı ilə əlaqə: ${getSellerContactText(item)}`}
            className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 text-sm font-semibold text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:bg-gray-800"
            href={getSellerContactHref(item)}
            rel="noreferrer"
            target={item.contactMethod === "whatsapp" ? "_blank" : undefined}
            title={getSellerContactText(item)}
          >
            {contactIcon}
            Satıcı ilə əlaqəyə keç
          </a>
        </div>
      </div>
    </div>
  );
}

export function SwapMarketplace() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategorySlug>("all");
  const [items, setItems] = useState<MarketItem[]>(mockMarketItems);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);

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
          <p className="mt-2 text-sm text-gray-500">
            {sortedItems.length} aktiv elan • ödənişsiz kampus vitrini
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

      <section className="-mx-1 overflow-hidden">
        <div className="flex gap-2 overflow-x-auto px-1 pb-1">
          {marketplaceCategories.map((category) => (
            <button
              className={`min-h-[40px] shrink-0 rounded-full px-3 text-xs font-semibold transition-all duration-300 md:hover:-translate-y-0.5 md:hover:shadow-md ${
                selectedCategory === category.slug
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-500 shadow-[0_8px_30px_rgb(0,0,0,0.035)]"
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
          <MarketItemCard
            item={item}
            key={item.id}
            priority={index < 4}
            onSelect={setSelectedItem}
          />
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

      <MarketItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      <MarketplaceItemForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onItemCreated={handleItemCreated}
      />
    </div>
  );
}
