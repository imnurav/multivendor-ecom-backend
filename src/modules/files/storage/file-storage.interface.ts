export enum StorageProvider {
  IMAGEKIT = 'imagekit',
  CLOUDINARY = 'cloudinary',
}
export enum FileModuleFolder {
  USER_PROFILE = 'user-profiles',
  CATEGORY = 'categories',
  PRODUCT = 'products',
  VENDOR = 'vendors',
  GENERAL = 'general',
}

export type FileUploadInput = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  folder?: string;
};

export interface FileUploadOutput {
  provider: StorageProvider;
  path: string;
  url: string;
  size: number;
  meta?: Record<string, unknown>;
}

export interface FileDeleteInput {
  path: string;
  meta?: Record<string, unknown>;
}

export interface FileDeleteOutput {
  provider: StorageProvider;
  deleted: boolean;
}

export interface FileStorageProvider {
  upload(input: FileUploadInput): Promise<FileUploadOutput>;
  delete(input: FileDeleteInput): Promise<FileDeleteOutput>;
}
