import { useState } from "react";
import { Camera } from "lucide-react";
import type { Photo } from "./types";

interface Props {
  photo: Photo;
  className?: string;
}

export default function PhotoImg({ photo, className }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`grid place-items-center bg-linear-to-br ${photo.grad} ${className ?? ""}`}
      >
        <Camera className="size-7 text-white/80" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={`https://picsum.photos/seed/${photo.seed}/640/480`}
      alt={photo.title}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
