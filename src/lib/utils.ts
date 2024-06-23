// place files you want to import through the `$lib` alias in this folder.
import type { FileDetails } from '$lib/types';

export const formatBytes = (bytes: number, decimals = 2) => {
	if (!+bytes) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PiB', 'EiB', 'ZiB', 'YiB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export function getFileDetails(file: FileList): FileDetails[];
export function getFileDetails(file: File): FileDetails;
export function getFileDetails(file: File | FileList) {
	if (file instanceof FileList) {
		return Array.from(file).map(getFileDetails);
	}

	return {
		name: file.name,
		size: file.size,
		type: file.type,
		lastModified: file.lastModified
	};
}
