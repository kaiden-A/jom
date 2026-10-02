import type { Photo } from "./types";

export const initialFolders = ["Alam", "Makanan", "Kucing", "Jalanan"];

export const initialPhotos: Photo[] = [
  {
    id: 1,
    title: "Pagi kat gunung",
    folder: "Alam",
    seed: "gunung-pagi",
    grad: "from-sky-300 to-emerald-300",
    likes: 12,
    liked: false,
    comments: [
      {
        id: 1,
        author: "Aiman",
        text: "Fuh cantik gila. Ambik pakai apa ni?",
        time: "2 jam lalu",
      },
      { id: 2, author: "Siti", text: "Warna dia kena betul", time: "1 jam lalu" },
    ],
  },
  {
    id: 2,
    title: "Sunset tepi pantai",
    folder: "Alam",
    seed: "pantai-sunset",
    grad: "from-orange-300 to-rose-300",
    likes: 24,
    liked: true,
    comments: [
      { id: 3, author: "Hafiz", text: "Ni wallpaper phone aku dah", time: "semalam" },
    ],
  },
  {
    id: 3,
    title: "Nasi lemak pagi",
    folder: "Makanan",
    seed: "nasi-lemak",
    grad: "from-amber-200 to-orange-300",
    likes: 31,
    liked: false,
    comments: [],
  },
  {
    id: 4,
    title: "Kopi ais",
    folder: "Makanan",
    seed: "kopi-ais",
    grad: "from-stone-300 to-amber-200",
    likes: 8,
    liked: false,
    comments: [],
  },
  {
    id: 5,
    title: "Kucing jiran",
    folder: "Kucing",
    seed: "kucing-jiran",
    grad: "from-violet-200 to-indigo-300",
    likes: 45,
    liked: true,
    comments: [
      { id: 4, author: "Mei", text: "Gemuknya! Nama dia apa?", time: "3 jam lalu" },
    ],
  },
  {
    id: 6,
    title: "Kucing gemuk",
    folder: "Kucing",
    seed: "kucing-gemuk",
    grad: "from-pink-200 to-violet-300",
    likes: 19,
    liked: false,
    comments: [],
  },
  {
    id: 7,
    title: "Lorong belakang",
    folder: "Jalanan",
    seed: "lorong-belakang",
    grad: "from-slate-300 to-indigo-300",
    likes: 6,
    liked: false,
    comments: [],
  },
  {
    id: 8,
    title: "Hujan kat bandar",
    folder: "Jalanan",
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

export const UNCATEGORIZED = "Tak berkategori";
