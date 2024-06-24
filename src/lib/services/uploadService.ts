import getUppyClient, { createUppyClient } from '$lib/uppyClient';
import type Uppy from '@uppy/core';
import type { UploadResult } from '@uppy/core';
import type { UploadOptions, UploadStatus } from '$lib/types';
import { writable, type Writable } from 'svelte/store';

const DEFAULT_CHUNK_SIZE_MB = 10;

export default class UploadService {
	private uppyClient: Uppy;

	defaultChunkSizeMb: number;

	options: UploadOptions;

	status: Writable<UploadStatus> = writable(UploadService.getDefaultUploadStatus());
	uploadResult?: UploadResult;

	constructor(
		options: UploadOptions = UploadService.getDefaultOptions(),
		defaultChunkSizeMb: number = DEFAULT_CHUNK_SIZE_MB
	) {
		this.defaultChunkSizeMb = defaultChunkSizeMb;
		this.options = options;

		this.uppyClient = this.getUppyClient(true);
	}

	getUppyClient(forceRecreate: boolean = false, chunkSize: number = this.defaultChunkSizeMb) {
		if (forceRecreate || !this.uppyClient) {
			this.uppyClient = createUppyClient(chunkSize);
			this.setupUploadEvents(this.uppyClient);
		}

		return this.uppyClient;
	}

	private setupUploadEvents(uppyClient: Uppy) {
		uppyClient.on('upload-progress', (file, progress) => {
			let status = this.status;
			let options = this.options;

			status.uploading = true;
			status.loading = false;

			let rawProgress = (progress.bytesUploaded / progress.bytesTotal) * 100;
			status.uploadProgress = parseFloat(rawProgress.toFixed(2));

			// Calculate the current upload speed
			const currentTime = Date.now();
			const timeElapsed = (currentTime - status.previousTime) / 1000; // in seconds
			const bytesUploaded = progress.bytesUploaded - status.previousUploadedBytes;

			if (timeElapsed > 0) {
				status.uploadSpeed = bytesUploaded / timeElapsed; // in bytes per second

				status.uploadSpeedHistory.push(status.uploadSpeed);
				while (status.uploadSpeedHistory.length > options.uploadSpeedHistorySize) {
					status.uploadSpeedHistory.shift();
				}

				status.averageUploadSpeed =
					status.uploadSpeedHistory.reduce((acc, speed) => acc + speed, 0) /
					status.uploadSpeedHistory.length;

				status.estimatedTimeRemainingSeconds =
					(progress.bytesTotal - progress.bytesUploaded) / status.averageUploadSpeed;
			}

			status.previousUploadedBytes = progress.bytesUploaded;
			status.previousTime = currentTime;
		});

		uppyClient.on('complete', (result) => {
			this.uploadResult = result;
			this.status.uploadProgress = 100;
			this.status.uploading = false;
		});

		uppyClient.on('cancel-all', () => {
			this.status = UploadService.getDefaultUploadStatus();
		});

		uppyClient.on('error', (error) => {
			this.status.uploading = false;

			console.error('Upload error:', error);
			// Add error message displaying
		});
	}

	static getDefaultOptions(): UploadOptions {
		return {
			chunkSizeMb: DEFAULT_CHUNK_SIZE_MB,
			uploadSpeedHistorySize: 100
		};
	}

	static getDefaultUploadStatus(): UploadStatus {
		return {
			uploading: false,
			averageUploadSpeed: 0,
			estimatedTimeRemainingSeconds: 0,
			loading: false,
			previousTime: 0,
			previousUploadedBytes: 0,
			uploadProgress: 0,
			uploadSpeed: 0,
			uploadSpeedHistory: []
		};
	}
}
