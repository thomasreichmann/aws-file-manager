export interface FileDetails {
    name: string;
    size: number;
    type: string;
    lastModified: number;
}

export interface UploadOptions {
    chunkSizeMb: number;
}
