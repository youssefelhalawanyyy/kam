"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type Lang = "en" | "ar";

const translations = {
  en: {
    // Nav
    home: "Home", products: "Products", search: "Search", brands: "🇪🇬 Brands",
    stores: "Stores", basket: "Basket", deals: "Deals", inflation: "Inflation",
    signIn: "Sign In", signOut: "Sign Out", dashboard: "Dashboard", admin: "Admin",
    // Product page
    bestPriceToday: "BEST PRICE TODAY", priceAlert: "Price Alert", addToBasket: "Add to Basket",
    saveToWishlist: "Save to Wishlist", priceComparison: "Price Comparison",
    priceHistory: "Price History", storesCompared: "stores compared",
    lastThirtyDays: "Last 30 days — track price trends", backToResults: "Back to results",
    productNotFound: "Product not found", goBack: "Go back",
    setAlert: "Set Alert", cancel: "Cancel", enterTargetPrice: "Enter target price in EGP",
    alertSet: "Price alert set! We'll notify you when the price drops.",
    saveUpTo: "Save up to", vsExpensive: "EGP vs. most expensive",
    shareLink: "Link copied!", reviews: "Reviews",
    // Search
    searchPlaceholder: "Search anything...", searchBtn: "Search",
    trackedProducts: "BKAM Tracked Products", liveMarket: "Live Market Prices",
    noResults: "No results found", browseAll: "← Browse all products",
    // Basket
    smartBasket: "Smart Basket", findCheapest: "Build your list — we'll find the cheapest store",
    clearAll: "Clear all", storeComparison: "Store Comparison", bestChoice: "Best choice:",
    addMore: "Add more products", noBasket: "Your basket is empty",
    // Common
    loading: "Loading...", noImage: "No image", viewPrice: "View",
    sponsored: "Sponsored", verified: "Verified", outOfStock: "Out of stock",
    share: "Share", whatsapp: "Share on WhatsApp", reportPrice: "Report wrong price",
    submitPrice: "Submit a price", howItWorks: "How it works",
  },
  ar: {
    // Nav
    home: "الرئيسية", products: "المنتجات", search: "بحث", brands: "🇪🇬 الماركات",
    stores: "المتاجر", basket: "السلة", deals: "العروض", inflation: "التضخم",
    signIn: "تسجيل الدخول", signOut: "تسجيل الخروج", dashboard: "لوحة التحكم", admin: "الإدارة",
    // Product page
    bestPriceToday: "أفضل سعر اليوم", priceAlert: "تنبيه السعر", addToBasket: "أضف للسلة",
    saveToWishlist: "حفظ في المفضلة", priceComparison: "مقارنة الأسعار",
    priceHistory: "تاريخ الأسعار", storesCompared: "متاجر مقارنة",
    lastThirtyDays: "آخر 30 يوم — تابع تغيرات الأسعار", backToResults: "العودة للنتائج",
    productNotFound: "المنتج غير موجود", goBack: "عودة",
    setAlert: "تفعيل التنبيه", cancel: "إلغاء", enterTargetPrice: "أدخل السعر المستهدف بالجنيه",
    alertSet: "تم تفعيل التنبيه! سنخبرك عند انخفاض السعر.",
    saveUpTo: "وفر حتى", vsExpensive: "جنيه مقارنة بالأغلى",
    shareLink: "تم نسخ الرابط!", reviews: "التقييمات",
    // Search
    searchPlaceholder: "ابحث عن أي منتج...", searchBtn: "بحث",
    trackedProducts: "منتجات بكام", liveMarket: "أسعار الأسواق المصرية",
    noResults: "لا توجد نتائج", browseAll: "← تصفح كل المنتجات",
    // Basket
    smartBasket: "السلة الذكية", findCheapest: "أضف منتجاتك — سنجد أرخص متجر",
    clearAll: "مسح الكل", storeComparison: "مقارنة المتاجر", bestChoice: "الأفضل:",
    addMore: "إضافة منتجات", noBasket: "سلتك فارغة",
    // Common
    loading: "جاري التحميل...", noImage: "لا توجد صورة", viewPrice: "عرض",
    sponsored: "مدفوع الإعلان", verified: "موثق", outOfStock: "نفذت الكمية",
    share: "مشاركة", whatsapp: "شارك على واتساب", reportPrice: "الإبلاغ عن خطأ في السعر",
    submitPrice: "أضف سعراً", howItWorks: "كيف يعمل",
  },
};

type TranslationKey = keyof typeof translations.en;
type Translations = typeof translations.en;

interface LanguageCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
  isAr: boolean;
}

const LanguageContext = createContext<LanguageCtx>({
  lang: "en", setLang: () => {}, t: (k) => k, isAr: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("bkam-lang") as Lang | null;
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("bkam-lang", l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  }

  const t = (key: TranslationKey): string =>
    (translations[lang] as Translations)[key] ?? (translations.en as Translations)[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isAr: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() { return useContext(LanguageContext); }
