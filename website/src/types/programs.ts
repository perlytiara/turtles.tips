export interface ProgramArticleEntry {
  id: string;
  slug: string;
  title: string;
  category: string;
  programPaths: string[];
  youtubeVideoId: string | null;
  youtubePlaylistId: string | null;
  videoTitle: string | null;
  videoDescription: string | null;
  videoPublishedAt: string | null;
  videoThumbnailUrl: string | null;
  /** AI-generated hero image (or null to use video thumbnail). */
  imageMainPath?: string | null;
  /** Up to 3 AI-generated illustrations for the article. */
  imageIllustrations?: { path: string; caption?: string }[];
  transcriptPath: string | null;
  pastebinId: string | null;
  author: string;
  credits: string;
  metaDescription: string | null;
  summary: string | null;
}

export interface ProgramCategory {
  id: string;
  label: string;
  order: number;
}
