"use client";

import { Check, ImagePlus, Loader2, Mail, MessageCircle, Plus, X } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import {
  conditionLabels,
  marketplaceApiBaseUrl,
  marketplaceCategories,
} from "@/lib/marketplace";
import type {
  MarketItem,
  MarketplaceCondition,
  MarketplaceContactMethod,
} from "@/lib/marketplace";

type MarketplaceItemFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated?: (item: MarketItem) => void;
};

type MarketplaceResponse = {
  message?: string;
  item?: MarketItem;
  errors?: string[];
};

const sellableCategories = marketplaceCategories.filter((category) => category.slug !== "all");
const conditions = Object.entries(conditionLabels) as Array<[MarketplaceCondition, string]>;

export function MarketplaceItemForm({
  isOpen,
  onClose,
  onItemCreated,
}: MarketplaceItemFormProps) {
  const [listingMode, setListingMode] = useState<"sale" | "swap">("sale");
  const [contactMethod, setContactMethod] = useState<MarketplaceContactMethod>("whatsapp");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const token = window.localStorage.getItem("edurate_token");

    if (!token) {
      setStatus("error");
      setMessage("Elan yerləşdirmək üçün əvvəlcə hesabına daxil ol.");
      return;
    }

    if (!marketplaceApiBaseUrl) {
      setStatus("error");
      setMessage("Backend API URL aktiv deyil. NEXT_PUBLIC_API_URL dəyərini əlavə et.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get("title") || ""),
      description: String(formData.get("description") || ""),
      categorySlug: String(formData.get("categorySlug") || "other"),
      condition: String(formData.get("condition") || "good"),
      campusLocation: String(formData.get("campusLocation") || ""),
      imageUrl: String(formData.get("imageUrl") || ""),
      price: listingMode === "swap" ? "" : String(formData.get("price") || ""),
      swapNote: listingMode === "swap" ? String(formData.get("swapNote") || "") : "",
      contactMethod,
      contactValue: String(formData.get("contactValue") || ""),
    };

    try {
      const response = await fetch(`${marketplaceApiBaseUrl}/api/marketplace`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as MarketplaceResponse;

      if (!response.ok) {
        throw new Error(data.errors?.join(", ") || data.message || "Elan yaradılmadı");
      }

      if (data.item) {
        onItemCreated?.(data.item);
      }

      event.currentTarget.reset();
      setListingMode("sale");
      setContactMethod("whatsapp");
      setStatus("success");
      setMessage("Elan uğurla əlavə edildi.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Server ilə əlaqə alınmadı");
    }
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end bg-black/18 px-3 py-3 backdrop-blur-sm sm:items-center sm:justify-center"
      role="dialog"
    >
      <form
        className="max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-lg border border-white/70 bg-white/92 p-4 shadow-[0_26px_70px_rgba(31,28,24,0.20)] backdrop-blur-xl"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-[#fbf4e5] text-[#8a6f45]">
              <Plus className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold">Elan əlavə et</h2>
              <p className="text-xs text-muted">Məhsul məlumatlarını və əlaqə yolunu yaz.</p>
            </div>
          </div>
          <button
            aria-label="Modalı bağla"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-[#f7f5f0] hover:text-foreground"
            type="button"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-line bg-white p-1">
          <button
            className={`h-9 rounded-md text-sm font-semibold transition ${
              listingMode === "sale" ? "bg-ink text-white" : "text-muted hover:bg-[#f7f5f0]"
            }`}
            type="button"
            onClick={() => setListingMode("sale")}
          >
            Satış
          </button>
          <button
            className={`h-9 rounded-md text-sm font-semibold transition ${
              listingMode === "swap" ? "bg-ink text-white" : "text-muted hover:bg-[#f7f5f0]"
            }`}
            type="button"
            onClick={() => setListingMode("swap")}
          >
            Dəyiş-toxuş
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-muted">Kateqoriya</span>
            <select
              className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-sage"
              name="categorySlug"
              required
            >
              {sellableCategories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted">Vəziyyət</span>
            <select
              className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-sage"
              defaultValue="good"
              name="condition"
            >
              {conditions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-3 block">
          <span className="text-xs font-medium text-muted">Başlıq</span>
          <input
            className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none placeholder:text-[#aaa49b] focus:border-sage"
            maxLength={140}
            minLength={3}
            name="title"
            placeholder="Məsələn: Calculus kitabı"
            required
          />
        </label>

        <label className="mt-3 block">
          <span className="text-xs font-medium text-muted">Təsvir</span>
          <textarea
            className="mt-1 min-h-24 w-full resize-none rounded-lg border border-line bg-white px-3 py-3 text-sm outline-none placeholder:text-[#aaa49b] focus:border-sage"
            maxLength={1200}
            minLength={8}
            name="description"
            placeholder="Əşyanın vəziyyəti, hansı dərs və ya ehtiyac üçün uyğun olduğunu yaz..."
            required
          />
        </label>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-muted">
              {listingMode === "swap" ? "Qiymət" : "Qiymət (AZN)"}
            </span>
            <input
              className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none placeholder:text-[#aaa49b] focus:border-sage disabled:bg-[#f7f5f0]"
              disabled={listingMode === "swap"}
              min={0}
              name="price"
              placeholder={listingMode === "swap" ? "Dəyiş-toxuş elanıdır" : "25"}
              step="0.01"
              type="number"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted">Görüş yeri</span>
            <input
              className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none placeholder:text-[#aaa49b] focus:border-sage"
              maxLength={120}
              name="campusLocation"
              placeholder="Məsələn: Kitabxana"
            />
          </label>
        </div>

        {listingMode === "swap" && (
          <label className="mt-3 block">
            <span className="text-xs font-medium text-muted">Dəyiş-toxuş şərti</span>
            <input
              className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none placeholder:text-[#aaa49b] focus:border-sage"
              maxLength={240}
              name="swapNote"
              placeholder="Məsələn: Data structures kitabı ilə dəyişmək olar"
            />
          </label>
        )}

        <div className="mt-3 rounded-lg border border-line bg-white p-3">
          <span className="text-xs font-medium text-muted">Əlaqə vasitəsi</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              className={`flex h-9 items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${
                contactMethod === "whatsapp" ? "bg-ink text-white" : "bg-[#f7f5f0] text-muted"
              }`}
              type="button"
              onClick={() => setContactMethod("whatsapp")}
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </button>
            <button
              className={`flex h-9 items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${
                contactMethod === "email" ? "bg-ink text-white" : "bg-[#f7f5f0] text-muted"
              }`}
              type="button"
              onClick={() => setContactMethod("email")}
            >
              <Mail className="size-4" />
              Email
            </button>
          </div>
          <input
            className="mt-2 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none placeholder:text-[#aaa49b] focus:border-sage"
            name="contactValue"
            placeholder={contactMethod === "whatsapp" ? "+994501234567" : "ad@karabakh.edu.az"}
            required
            type={contactMethod === "email" ? "email" : "tel"}
          />
        </div>

        <label className="mt-3 block">
          <span className="text-xs font-medium text-muted">Şəkil URL-i</span>
          <div className="mt-1 flex items-center gap-2 rounded-lg border border-line bg-white px-3">
            <ImagePlus className="size-4 text-sage" />
            <input
              className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#aaa49b]"
              name="imageUrl"
              placeholder="Boş qalsa kateqoriyaya uyğun mock şəkil seçiləcək"
              type="url"
            />
          </div>
        </label>

        {message && (
          <p
            className={`mt-4 rounded-lg border px-3 py-2 text-xs ${
              status === "success"
                ? "border-[#cfe3d7] bg-[#f0f8f3] text-[#3f6f58]"
                : "border-[#efd4ca] bg-[#fff4ef] text-[#9b4d37]"
            }`}
          >
            {message}
          </p>
        )}

        <button
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(38,52,47,0.18)] transition hover:-translate-y-0.5 hover:bg-[#1f2b27] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status === "loading"}
          type="submit"
        >
          {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          Elanı paylaş
        </button>
      </form>
    </div>
  );
}
