export interface FileDetails {
	name: string;
	size: number;
	type: string;
	lastModified: number;
}

export interface UploadOptions {
	storageClass: _StorageClass;
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
export type _StorageClass =
	| 'DEEP_ARCHIVE'
	| 'EXPRESS_ONEZONE'
	| 'GLACIER'
	| 'GLACIER_IR'
	| 'INTELLIGENT_TIERING'
	| 'ONEZONE_IA'
	| 'OUTPOSTS'
	| 'REDUCED_REDUNDANCY'
	| 'SNOW'
	| 'STANDARD'
	| 'STANDARD_IA';

export const STORAGE_CLASS_KEYS = {
	DEEP_ARCHIVE: 'DEEP_ARCHIVE',
	EXPRESS_ONEZONE: 'EXPRESS_ONEZONE',
	GLACIER: 'GLACIER',
	GLACIER_IR: 'GLACIER_IR',
	INTELLIGENT_TIERING: 'INTELLIGENT_TIERING',
	ONEZONE_IA: 'ONEZONE_IA',
	OUTPOSTS: 'OUTPOSTS',
	REDUCED_REDUNDANCY: 'REDUCED_REDUNDANCY',
	SNOW: 'SNOW',
	STANDARD: 'STANDARD',
	STANDARD_IA: 'STANDARD_IA'
};
