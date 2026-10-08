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
}

export interface ProjectPreset {
  id: string;
  name: string;
  what: string;
  features: string[];
  defaultFeatures: string[];
  defaultPalette: string;
  defaultVibe: string;
}

export const palettes: Palette[] = [
  {
    id: "warm-indigo",
    name: "Cream + Indigo",
    desc: "Friendly, clean, easy to read.",
    colors: [
      { hex: "#FAF7F2" },
      { hex: "#4F46E5" },
      { hex: "#F97316" },
    ],
  },
  {
    id: "dark-neon",
    name: "Dark + Neon",
    desc: "Modern, techy, high contrast.",
    colors: [
      { hex: "#0F172A" },
      { hex: "#22D3EE" },
      { hex: "#A3E635" },
    ],
  },
  {
    id: "pastel",
    name: "Soft Pastel",
    desc: "Sweet, soft, gentle.",
    colors: [
      { hex: "#FDF2F8" },
      { hex: "#EC4899" },
      { hex: "#8B5CF6" },
    ],
  },
  {
    id: "earthy",
    name: "Earthy",
    desc: "Warm, natural, calm.",
    colors: [
      { hex: "#F5F0E8" },
      { hex: "#78716C" },
      { hex: "#C2703D" },
    ],
  },
  {
    id: "retro",
    name: "Bold Retro",
    desc: "Brave, cheerful, never boring.",
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
    desc: "lots of whitespace, tidy layout, no unnecessary decoration",
  },
  {
    id: "playful",
    name: "Playful & friendly",
    desc: "rounded corners, cheerful colors, friendly vibe",
  },
  {
    id: "dark",
    name: "Dark & modern",
    desc: "high contrast, techy and premium feel",
  },
  {
    id: "elegant",
    name: "Elegant & fancy",
    desc: "generous spacing, serif headings, expensive feel",
  },
  {
    id: "retro",
    name: "Retro & bold",
    desc: "thick borders, bold colors, slightly vintage",
  },
];

export const presets: ProjectPreset[] = [
  {
    id: "gallery",
    name: "Gallery Blog",
    what: "a photo website — people can view photos, filter by folder, like and comment. There's an admin section to upload new photos.",
    features: [
      "Image grid",
      "Folder/category filter",
      "Lightbox (click to enlarge)",
      "Like button on photos",
      "Comments on photos",
      "Admin: upload photos",
      "Admin: create folders",
      "Dark mode toggle",
      "Responsive (mobile friendly)",
    ],
    defaultFeatures: [
      "Image grid",
      "Folder/category filter",
      "Lightbox (click to enlarge)",
      "Like button on photos",
      "Comments on photos",
      "Admin: upload photos",
      "Admin: create folders",
      "Responsive (mobile friendly)",
    ],
    defaultPalette: "warm-indigo",
    defaultVibe: "clean",
  },
  {
    id: "portfolio",
    name: "Personal Portfolio",
    what: "a portfolio website — show off projects, tell your story, and let people get in touch.",
    features: [
      "Hero section",
      "Projects list",
      "Project detail modal",
      "About me section",
      "Contact form (mockup only)",
      "Dark mode toggle",
      "Responsive (mobile friendly)",
    ],
    defaultFeatures: [
      "Hero section",
      "Projects list",
      "Project detail modal",
      "About me section",
      "Contact form (mockup)",
      "Responsive (mobile friendly)",
    ],
    defaultPalette: "dark-neon",
    defaultVibe: "dark",
  },
  {
    id: "shop",
    name: "Online Shop",
    what: "an online shop — product list, cart, and a checkout page (mockup only, no real payments).",
    features: [
      "Product grid",
      "Category filter",
      "Product detail page",
      "Cart (add/remove)",
      "Checkout page",
      "Search bar",
      "Responsive (mobile friendly)",
    ],
    defaultFeatures: [
      "Product grid",
      "Category filter",
      "Product detail page",
      "Cart (add/remove)",
      "Checkout page",
      "Responsive (mobile friendly)",
    ],
    defaultPalette: "retro",
    defaultVibe: "playful",
  },
  {
    id: "recipe",
    name: "Recipe Blog",
    what: "a recipe blog — a list of recipes, a recipe page with cooking steps, and the ability to save favourites.",
    features: [
      "Recipe grid",
      "Filter (breakfast/lunch/dinner)",
      "Recipe page with steps",
      "Save favourites",
      "Comments",
      "Search bar",
      "Responsive (mobile friendly)",
    ],
    defaultFeatures: [
      "Recipe grid",
      "Filter (breakfast/lunch/dinner)",
      "Recipe page with steps",
      "Save favourites",
      "Comments",
      "Responsive (mobile friendly)",
    ],
    defaultPalette: "pastel",
    defaultVibe: "playful",
  },
];

export interface BuildPromptOptions {
  projectName: string;
  what: string;
  features: string[];
  palette: Palette;
  vibe: Vibe;
}

export function buildPrompt({
  projectName,
  what,
  features,
  palette,
  vibe,
}: BuildPromptOptions): string {
  const [bg, accent, highlight] = palette.colors;
  const featureList = features.length
    ? features.map((feature) => `- ${feature}`).join("\n")
    : "- (pick some features on the left first)";

  return `Build a website mockup using HTML + Tailwind CSS (via CDN) + Font Awesome + vanilla JavaScript.
Keep everything in a single index.html file — no build tools, open it straight in the browser.

Project: ${projectName} — ${what}

Features needed:
${featureList}

Colors: use this palette — background ${bg?.hex}, primary/accent ${accent?.hex}, highlight ${highlight?.hex}. Keep the colors consistent across the page.

Design: ${vibe.name} — ${vibe.desc}.

Make sure it is responsive on phone and desktop, use placeholder images from picsum.photos, and every basic interaction is clickable.`;
}
