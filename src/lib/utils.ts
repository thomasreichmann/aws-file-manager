// place files you want to import through the `$lib` alias in this folder.
import type { FileDetails } from '$lib/types';
import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';

export const formatBytes = (bytes: number, decimals = 2) => {
	if (!+bytes) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PiB', 'EiB', 'ZiB', 'YiB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const formatTime = (seconds: number) => {
	if (!+seconds) return '0s';

	const units = [
		{ unit: 'y', seconds: 365 * 24 * 60 * 60 },
		{ unit: 'w', seconds: 7 * 24 * 60 * 60 },
		{ unit: 'd', seconds: 24 * 60 * 60 },
		{ unit: 'h', seconds: 60 * 60 },
		{ unit: 'm', seconds: 60 },
		{ unit: 's', seconds: 1 }
	];

	let remainingSeconds = seconds;
	const result = [];

	for (let i = 0; i < units.length; i++) {
		if (remainingSeconds >= units[i].seconds) {
			const value = Math.floor(remainingSeconds / units[i].seconds);
			remainingSeconds %= units[i].seconds;
			result.push(`${value}${units[i].unit}`);
		}
	}

	return result.join(' ');
};

// Helper function for detailed time formatting (e.g., HH:MM:SS)
export const formatDetailedTime = (seconds: number) => {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}h`;
	} else if (minutes > 0) {
		return `${minutes}:${secs.toString().padStart(2, '0')}m`;
	} else {
		return `${secs}s`;
	}
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

export const getConfirmActionModal = (
	action: string,
	onConfirm: () => void,
	message?: string
): ModalSettings => {
	return {
		type: 'confirm',
		title: `Confirm Action`,
		body: message || `Are you sure you want to perform the action: '${action}'?`,
		response: (r) => {
			if (r) onConfirm();
		}
	};
};

export const triggerConfirmActionModal = (
	action: string,
	onConfirm: () => void,
	message?: string
) => {
	const modalStore = getModalStore();
	const modal = getConfirmActionModal(action, onConfirm, message);

	modalStore.update((state) => [modal, ...state]);
};
