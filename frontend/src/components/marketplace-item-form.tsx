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
      className="fixed inset-0 z-50 flex items-end bg-slate-950/20 px-3 py-3 backdrop-blur-sm sm:items-center sm:justify-center"
      role="dialog"
    >
      <form
        className="max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Plus className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Elan əlavə et</h2>
              <p className="hidden text-xs text-gray-400 md:block">Məhsul məlumatlarını və əlaqə yolunu yaz.</p>
            </div>
          </div>
          <button
            aria-label="Modalı bağla"
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-gray-400 transition hover:bg-slate-50 hover:text-gray-900"
            type="button"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-1">
          <button
            className={`min-h-[44px] rounded-2xl text-sm font-semibold transition ${
              listingMode === "sale" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-white"
            }`}
            type="button"
            onClick={() => setListingMode("sale")}
          >
            Satış
          </button>
          <button
            className={`min-h-[44px] rounded-2xl text-sm font-semibold transition ${
              listingMode === "swap" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-white"
            }`}
            type="button"
            onClick={() => setListingMode("swap")}
          >
            Dəyiş-toxuş
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-gray-500">Kateqoriya</span>
            <select
              className="mt-2 min-h-[44px] w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-0"
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
            <span className="text-xs font-medium text-gray-500">Vəziyyət</span>
            <select
              className="mt-2 min-h-[44px] w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-0"
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

        <label className="mt-4 block">
          <span className="text-xs font-medium text-gray-500">Başlıq</span>
          <input
            className="mt-2 min-h-[44px] w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-0"
            maxLength={140}
            minLength={3}
            name="title"
            placeholder="Məsələn: Calculus kitabı"
            required
          />
        </label>

        <label className="mt-4 block">
          <span className="text-xs font-medium text-gray-500">Təsvir</span>
          <textarea
            className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-0"
            maxLength={1200}
            minLength={8}
            name="description"
            placeholder="Əşyanın vəziyyəti, hansı dərs və ya ehtiyac üçün uyğun olduğunu yaz..."
            required
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-gray-500">
              {listingMode === "swap" ? "Qiymət" : "Qiymət (AZN)"}
            </span>
            <input
              className="mt-2 min-h-[44px] w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 disabled:bg-slate-50"
              disabled={listingMode === "swap"}
              min={0}
              name="price"
              placeholder={listingMode === "swap" ? "Dəyiş-toxuş elanıdır" : "25"}
              step="0.01"
              type="number"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-gray-500">Görüş yeri</span>
            <input
              className="mt-2 min-h-[44px] w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-0"
              maxLength={120}
              name="campusLocation"
              placeholder="Məsələn: Kitabxana"
            />
          </label>
        </div>

        {listingMode === "swap" && (
          <label className="mt-4 block">
            <span className="text-xs font-medium text-gray-500">Dəyiş-toxuş şərti</span>
            <input
              className="mt-2 min-h-[44px] w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-0"
              maxLength={240}
              name="swapNote"
              placeholder="Məsələn: Data structures kitabı ilə dəyişmək olar"
            />
          </label>
        )}

        <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-4">
          <span className="text-xs font-medium text-gray-500">Əlaqə vasitəsi</span>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              className={`flex min-h-[44px] items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition ${
                contactMethod === "whatsapp" ? "bg-gray-900 text-white" : "bg-slate-50 text-gray-500"
              }`}
              type="button"
              onClick={() => setContactMethod("whatsapp")}
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </button>
            <button
              className={`flex min-h-[44px] items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition ${
                contactMethod === "email" ? "bg-gray-900 text-white" : "bg-slate-50 text-gray-500"
              }`}
              type="button"
              onClick={() => setContactMethod("email")}
            >
              <Mail className="size-4" />
              Email
            </button>
          </div>
          <input
            className="mt-3 min-h-[44px] w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-0"
            name="contactValue"
            placeholder={contactMethod === "whatsapp" ? "+994501234567" : "ad@karabakh.edu.az"}
            required
            type={contactMethod === "email" ? "email" : "tel"}
          />
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-medium text-gray-500">Şəkil URL-i</span>
          <div className="mt-2 flex min-h-[44px] items-center gap-2 rounded-2xl border border-gray-200 bg-slate-50 px-4 focus-within:border-gray-400 focus-within:ring-0">
            <ImagePlus className="size-4 text-teal-700" />
            <input
              className="min-h-[44px] min-w-0 flex-1 bg-slate-50 text-sm text-gray-900 outline-none placeholder:text-gray-400"
              name="imageUrl"
              placeholder="Boş qalsa kateqoriyaya uyğun mock şəkil seçiləcək"
              type="url"
            />
          </div>
        </label>

        {message && (
          <p
            className={`mt-5 rounded-2xl border px-4 py-3 text-xs ${
              status === "success"
                ? "border-teal-100 bg-teal-50 text-teal-700"
                : "border-orange-100 bg-orange-50 text-orange-700"
            }`}
          >
            {message}
          </p>
        )}

        <button
          className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 text-sm font-semibold text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 md:hover:-translate-y-0.5 md:hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
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
