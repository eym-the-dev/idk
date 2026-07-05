export type DiscoverItem = {
  title: string;
  year: string;
  format: string;
  genres: string[];
  hook: string;
  whyMatch: string;
  vibe: string;
  imageUrl?: string;
  youtubeSearchQuery?: string;
};

export type SavedRecommendations = {
  personalitySummary?: string;
  shelfTitle?: string;
  watched?: DiscoverItem[];
  toWatch?: DiscoverItem[];
  items?: DiscoverItem[];
};
