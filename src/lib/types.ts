export interface FileDetails {
	name: string;
	size: number;
	type: string;
	lastModified: number;
}

export interface UploadOptions {
	chunkSizeMb: number;
	uploadSpeedHistorySize: number;
}

export interface UploadStatus {
	loading: boolean;

	uploading: boolean;
	uploadProgress: number;

	uploadSpeed: number;
	averageUploadSpeed: number;
	uploadSpeedHistory: number[];

	estimatedTimeRemainingSeconds: number;

	previousUploadedBytes: number;
	previousTime: number;

	totalBytes: number;

	partsSigned: number;
	totalParts: number;
}
