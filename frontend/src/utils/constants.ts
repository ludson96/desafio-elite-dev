import type { EventType } from "@/types";

export const DEFAULT_SHOW_COVER =
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80";

export const DEFAULT_MOVIE_COVER =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80";

export function getEventCoverImage(imageUrl?: string | null, type?: EventType): string {
  if (imageUrl && imageUrl.trim().startsWith("http")) {
    return imageUrl.trim();
  }
  return type === "MOVIE" ? DEFAULT_MOVIE_COVER : DEFAULT_SHOW_COVER;
}
