export type FileStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface FileItemData {
  id: string;
  file: File;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
  progress: number;
  status: FileStatus;
  errorMessage?: string;
  previewUrl?: string;
}
