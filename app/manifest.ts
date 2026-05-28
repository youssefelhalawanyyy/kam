import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BKAM – اشتري بدماغك",
    short_name: "BKAM",
    description: "قارن أسعار البقالة والصيدليات في مصر — Compare prices across Egyptian markets",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#10b981",
    orientation: "portrait",
    categories: ["shopping", "finance"],
    lang: "ar",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Search Prices", short_name: "Search", url: "/search", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "My Basket", short_name: "Basket", url: "/basket", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Local Brands", short_name: "Brands", url: "/brands/search", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
