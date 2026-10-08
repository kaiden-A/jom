import type { Photo } from "./types";

export const initialFolders = ["Nature", "Food", "Cats", "Street"];

export const initialPhotos: Photo[] = [
  {
    id: 1,
    title: "Morning at the mountain",
    folder: "Nature",
    seed: "gunung-pagi",
    grad: "from-sky-300 to-emerald-300",
    likes: 12,
    liked: false,
    comments: [
      {
        id: 1,
        author: "Aiman",
        text: "Whoa, gorgeous. What did you shoot this with?",
        time: "2 hours ago",
      },
      { id: 2, author: "Siti", text: "The colours are spot on", time: "1 hour ago" },
    ],
  },
  {
    id: 2,
    title: "Sunset by the beach",
    folder: "Nature",
    seed: "pantai-sunset",
    grad: "from-orange-300 to-rose-300",
    likes: 24,
    liked: true,
    comments: [
      { id: 3, author: "Hafiz", text: "This is my phone wallpaper now", time: "yesterday" },
    ],
  },
  {
    id: 3,
    title: "Nasi lemak morning",
    folder: "Food",
    seed: "nasi-lemak",
    grad: "from-amber-200 to-orange-300",
    likes: 31,
    liked: false,
    comments: [],
  },
  {
    id: 4,
    title: "Iced coffee",
    folder: "Food",
    seed: "kopi-ais",
    grad: "from-stone-300 to-amber-200",
    likes: 8,
    liked: false,
    comments: [],
  },
  {
    id: 5,
    title: "The neighbour's cat",
    folder: "Cats",
    seed: "kucing-jiran",
    grad: "from-violet-200 to-indigo-300",
    likes: 45,
    liked: true,
    comments: [
      { id: 4, author: "Mei", text: "So chubby! What's its name?", time: "3 hours ago" },
    ],
  },
  {
    id: 6,
    title: "Chubby cat",
    folder: "Cats",
    seed: "kucing-gemuk",
    grad: "from-pink-200 to-violet-300",
    likes: 19,
    liked: false,
    comments: [],
  },
  {
    id: 7,
    title: "Back alley",
    folder: "Street",
    seed: "lorong-belakang",
    grad: "from-slate-300 to-indigo-300",
    likes: 6,
    liked: false,
    comments: [],
  },
  {
    id: 8,
    title: "Rain in the city",
    folder: "Street",
    seed: "hujan-bandar",
    grad: "from-cyan-200 to-slate-400",
    likes: 14,
    liked: false,
    comments: [],
  },
];

export const uploadSeeds = [
  "kamera-baru-1",
  "kamera-baru-2",
  "kamera-baru-3",
] as const;

export const uploadGrads = [
  "from-indigo-300 to-sky-300",
  "from-rose-300 to-amber-200",
  "from-emerald-300 to-cyan-300",
] as const;

export const UNCATEGORIZED = "Uncategorised";
