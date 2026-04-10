import { StorageProvider } from './storage/file-storage.interface';

export interface UploadFileOptions {
  folder: string;
  allowedMimePrefixes?: string[];
}

export interface UploadedFileResponse {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  provider: StorageProvider;
  path: string;
  url: string;
  createdAt: Date;
}

export interface DeletedFileResponse {
  id: string;
  provider: StorageProvider;
  deleted: boolean;
}
