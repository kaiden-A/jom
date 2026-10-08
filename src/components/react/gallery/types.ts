export interface CommentItem {
  id: number;
  author: string;
  text: string;
  time: string;
}

export interface Photo {
  id: number;
  title: string;
  folder: string;
  seed: string;
  grad: string;
  likes: number;
  liked: boolean;
  comments: CommentItem[];
}

export type DemoMode = "visitor" | "admin";
export type AdminTab = "dashboard" | "photos" | "folder" | "settings";
