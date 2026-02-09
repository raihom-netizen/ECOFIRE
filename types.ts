
export interface ImageHistoryItem {
  id: string;
  originalUrl: string;
  editedUrl: string;
  prompt: string;
  timestamp: number;
}

export interface ProcessingState {
  isProcessing: boolean;
  status: string;
  error: string | null;
}

export enum QuickAction {
  REMOVE_BACKGROUND = "Remove background and make it clean white",
  STUDIO_LIGHTING = "Add soft studio lighting and subtle shadows",
  POLISH = "Clean up the product, remove dust, and enhance colors",
  LIFESTYLE = "Place this product in a high-end minimalist lifestyle setting",
}
