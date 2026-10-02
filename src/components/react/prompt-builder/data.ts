export interface PaletteColor {
  hex: string;
}

export interface Palette {
  id: string;
  name: string;
  desc: string;
  colors: PaletteColor[];
}

export interface Vibe {
  id: string;
  name: string;
  desc: string;
  descEn: string;
}

export interface Feature {
  bm: string;
  en: string;
}

export interface ProjectPreset {
  id: string;
  name: string;
  what: string;
  features: Feature[];
  defaultFeatures: string[];
  defaultPalette: string;
  defaultVibe: string;
}

export const palettes: Palette[] = [
  {
    id: "warm-indigo",
    name: "Krim + Indigo",
    desc: "Mesra, bersih, senang dibaca.",
    colors: [
      { hex: "#FAF7F2" },
      { hex: "#4F46E5" },
      { hex: "#F97316" },
    ],
  },
  {
    id: "dark-neon",
    name: "Gelap + Neon",
    desc: "Moden, techy, kontras tinggi.",
    colors: [
      { hex: "#0F172A" },
      { hex: "#22D3EE" },
      { hex: "#A3E635" },
    ],
  },
  {
    id: "pastel",
    name: "Pastel Lembut",
    desc: "Manja, lembut, mesra.",
    colors: [
      { hex: "#FDF2F8" },
      { hex: "#EC4899" },
      { hex: "#8B5CF6" },
    ],
  },
  {
    id: "earthy",
    name: "Earthy",
    desc: "Hangat, natural, tenang.",
    colors: [
      { hex: "#F5F0E8" },
      { hex: "#78716C" },
      { hex: "#C2703D" },
    ],
  },
  {
    id: "retro",
    name: "Bold Retro",
    desc: "Berani, ceria, tak bosan.",
    colors: [
      { hex: "#FFF7ED" },
      { hex: "#EA580C" },
      { hex: "#1E293B" },
    ],
  },
];

export const vibes: Vibe[] = [
  {
    id: "clean",
    name: "Clean & minimal",
    desc: "banyak ruang kosong, susunan kemas, takde hiasan berlebihan",
    descEn:
      "lots of whitespace, tidy layout, no unnecessary decoration",
  },
  {
    id: "playful",
    name: "Playful & mesra",
    desc: "sudut bulat, warna ceria, rasa macam kawan",
    descEn: "rounded corners, cheerful colors, friendly vibe",
  },
  {
    id: "dark",
    name: "Gelap & moden",
    desc: "kontras tinggi, rasa techy dan premium",
    descEn: "high contrast, techy and premium feel",
  },
  {
    id: "elegant",
    name: "Elegant & mewah",
    desc: "spacing luas, font serif untuk tajuk, rasa mahal",
    descEn: "generous spacing, serif headings, expensive feel",
  },
  {
    id: "retro",
    name: "Retro & bold",
    desc: "border tebal, warna berani, sedikit vintage",
    descEn: "thick borders, bold colors, slightly vintage",
  },
];

export const presets: ProjectPreset[] = [
  {
    id: "gallery",
    name: "Gallery Blog",
    what: "website gambar — orang boleh tengok gambar, filter ikut folder, like dan komen. Ada admin section untuk upload gambar baru.",
    features: [
      { bm: "Grid gambar", en: "Image grid" },
      { bm: "Filter folder/kategori", en: "Folder/category filter" },
      { bm: "Lightbox (buka gambar besar)", en: "Lightbox (click to enlarge)" },
      { bm: "Like pada gambar", en: "Like button on photos" },
      { bm: "Komen pada gambar", en: "Comments on photos" },
      { bm: "Admin: upload gambar", en: "Admin: upload photos" },
      { bm: "Admin: create folder", en: "Admin: create folders" },
      { bm: "Dark mode toggle", en: "Dark mode toggle" },
      { bm: "Responsive (ok dalam phone)", en: "Responsive (mobile friendly)" },
    ],
    defaultFeatures: [
      "Grid gambar",
      "Filter folder/kategori",
      "Lightbox (buka gambar besar)",
      "Like pada gambar",
      "Komen pada gambar",
      "Admin: upload gambar",
      "Admin: create folder",
      "Responsive (ok dalam phone)",
    ],
    defaultPalette: "warm-indigo",
    defaultVibe: "clean",
  },
  {
    id: "portfolio",
    name: "Portfolio Peribadi",
    what: "website portfolio — tunjuk projek, cerita tentang diri, dan cara orang boleh hubungi.",
    features: [
      { bm: "Hero section", en: "Hero section" },
      { bm: "Senarai projek", en: "Projects list" },
      { bm: "Modal detail projek", en: "Project detail modal" },
      { bm: "Section tentang aku", en: "About me section" },
      { bm: "Borang hubungi (mockup)", en: "Contact form (mockup only)" },
      { bm: "Dark mode toggle", en: "Dark mode toggle" },
      { bm: "Responsive (ok dalam phone)", en: "Responsive (mobile friendly)" },
    ],
    defaultFeatures: [
      "Hero section",
      "Senarai projek",
      "Modal detail projek",
      "Section tentang aku",
      "Borang hubungi (mockup)",
      "Responsive (ok dalam phone)",
    ],
    defaultPalette: "dark-neon",
    defaultVibe: "dark",
  },
  {
    id: "shop",
    name: "Kedai Online",
    what: "kedai online — senarai produk, cart, dan page checkout (mockup sahaja, takde bayaran sebenar).",
    features: [
      { bm: "Grid produk", en: "Product grid" },
      { bm: "Filter kategori", en: "Category filter" },
      { bm: "Page detail produk", en: "Product detail page" },
      { bm: "Cart (tambah/buang)", en: "Cart (add/remove)" },
      { bm: "Checkout page", en: "Checkout page" },
      { bm: "Search bar", en: "Search bar" },
      { bm: "Responsive (ok dalam phone)", en: "Responsive (mobile friendly)" },
    ],
    defaultFeatures: [
      "Grid produk",
      "Filter kategori",
      "Page detail produk",
      "Cart (tambah/buang)",
      "Checkout page",
      "Responsive (ok dalam phone)",
    ],
    defaultPalette: "retro",
    defaultVibe: "playful",
  },
  {
    id: "recipe",
    name: "Blog Resepi",
    what: "blog resepi — senarai resepi, page resepi dengan langkah masakan, dan boleh simpan resepi kegemaran.",
    features: [
      { bm: "Grid resepi", en: "Recipe grid" },
      {
        bm: "Filter (sarapan/makan tengah/malam)",
        en: "Filter (breakfast/lunch/dinner)",
      },
      { bm: "Page resepi + langkah", en: "Recipe page with steps" },
      { bm: "Simpan kegemaran", en: "Save favourites" },
      { bm: "Komen", en: "Comments" },
      { bm: "Search bar", en: "Search bar" },
      { bm: "Responsive (ok dalam phone)", en: "Responsive (mobile friendly)" },
    ],
    defaultFeatures: [
      "Grid resepi",
      "Filter (sarapan/makan tengah/malam)",
      "Page resepi + langkah",
      "Simpan kegemaran",
      "Komen",
      "Responsive (ok dalam phone)",
    ],
    defaultPalette: "pastel",
    defaultVibe: "playful",
  },
];

export interface BuildPromptOptions {
  lang: "bm" | "en";
  projectName: string;
  what: string;
  features: Feature[];
  palette: Palette;
  vibe: Vibe;
}

export function buildPrompt({
  lang,
  projectName,
  what,
  features,
  palette,
  vibe,
}: BuildPromptOptions): string {
  const [bg, accent, highlight] = palette.colors;
  const featureList = features.length
    ? features.map((f) => `- ${lang === "bm" ? f.bm : f.en}`).join("\n")
    : lang === "bm"
      ? "- (pilih feature dulu kat sebelah kiri)"
      : "- (pick some features on the left first)";

  if (lang === "en") {
    return `Build a website mockup using HTML + Tailwind CSS (via CDN) + Font Awesome + vanilla JavaScript.
Keep everything in a single index.html file — no build tools, open it straight in the browser.

Project: ${projectName} — ${what}

Features needed:
${featureList}

Colors: use this palette — background ${bg?.hex}, primary/accent ${accent?.hex}, highlight ${highlight?.hex}. Keep the colors consistent across the page.

Design: ${vibe.name} — ${vibe.descEn}.

Make sure it is responsive on phone and desktop, use placeholder images from picsum.photos, and every basic interaction is clickable.`;
  }

  return `Buat mockup laman web guna HTML + Tailwind CSS (via CDN) + Font Awesome + vanilla JavaScript.
Semua dalam satu fail index.html sahaja — takde build tool, buka terus dalam browser.

Projek: ${projectName} — ${what}

Feature yang perlu ada:
${featureList}

Warna: guna palette ni — background ${bg?.hex}, warna utama/aksen ${accent?.hex}, highlight ${highlight?.hex}. Pastikan warna konsisten seluruh page.

Design: ${vibe.name} — ${vibe.desc}.

Pastikan responsive untuk phone dan desktop, guna gambar placeholder dari picsum.photos, dan setiap interaksi asas boleh klik.`;
}
