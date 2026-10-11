export interface SaveFileInput {
  fileName: string;
  content: Buffer;
}

export interface IFileStorage {
  save(input: SaveFileInput): Promise<string>;
  read(fileUrl: string): Promise<Buffer>;
}
