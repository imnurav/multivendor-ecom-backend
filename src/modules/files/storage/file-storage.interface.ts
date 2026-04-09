export type FileUploadInput = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  folder?: string;
};

export type FileUploadOutput = {
  provider: string;
  path: string;
  url: string;
  size: number;
  meta?: Record<string, unknown>;
};

export interface FileStorageProvider {
  upload(input: FileUploadInput): Promise<FileUploadOutput>;
}
