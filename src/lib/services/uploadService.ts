import { createUppyClient, type CreateUppyClientOptions } from '$lib/uppyClient';
import type Uppy from '@uppy/core';
import type { UploadResult } from '@uppy/core';
import type { UploadOptions, UploadStatus } from '$lib/types';
import { writable, type Writable } from 'svelte/store';
import { Service } from '$lib/services/Service';
import type { AwsS3UploadParameters } from '@uppy/aws-s3-multipart';

const DEFAULT_CHUNK_SIZE_MB = 10;

export default class UploadService extends Service {
	private uppyClient: Uppy;

	defaultChunkSizeMb: number;

	options: UploadOptions;

	status: Writable<UploadStatus> = writable(UploadService.getDefaultUploadStatus());
	uploadResult?: UploadResult;

	constructor(
		options: UploadOptions = UploadService.getDefaultOptions(),
		defaultChunkSizeMb: number = DEFAULT_CHUNK_SIZE_MB
	) {
		super('/api/upload');

		this.defaultChunkSizeMb = defaultChunkSizeMb;
		this.options = options;

		this.uppyClient = this.getUppyClient(true);
	}

	async upload() {
		this.status.update((status) => {
			status.loading = true;
			return status;
		});

		let result = await this.getUppyClient().upload();

		// clear the client after the upload is complete
		this.uppyClient = this.getUppyClient(true);

		return result;
	}

	getUppyClient(forceRecreate: boolean = false, chunkSize: number = this.defaultChunkSizeMb) {
		if (forceRecreate || !this.uppyClient) {
			this.uppyClient = createUppyClient(
				this.status,
				this.getCreateUppyClientOptions(chunkSize)
			);
			this.setupUploadEvents(this.uppyClient);
		}

		return this.uppyClient;
	}

	getCreateUppyClientOptions(chunkSizeMb: number): CreateUppyClientOptions {
		return {
			chunkSizeMb,
			abortMultipartUpload: async (file, opts) => {
				const { uploadId } = opts;
				await fetch(`${this.baseURL}/presign?uploadId=${uploadId}&key=${opts.key}`, {
					method: 'DELETE'
				});
			},
			listParts: async (file, opts) => {
				const { uploadId, key } = opts;
				const response = await fetch(
					`${this.baseURL}/parts?uploadId=${uploadId}&key=${key}`
				);

				return response.json();
			},
			getChunkSize: (file) => chunkSizeMb * 1024 * 1024,
			createMultipartUpload: async (file) => {
				const response = await fetch(`${this.baseURL}/presign`, {
					method: 'POST',
					body: JSON.stringify({ filename: file.name })
				});

				return response.json();
			},
			signPart: async (file, { partNumber, uploadId }): Promise<Response> => {
				const response = await fetch(
					`${this.baseURL}/presign?filename=${file.name}&uploadId=${uploadId}&partNumber=${partNumber}`
				);

				return response.json();
			},
			completeMultipartUpload: async (file, { uploadId, parts }) => {
				const response = await fetch(`${this.baseURL}/presign`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ uploadId, parts, filename: file.name })
				});

				return response.json();
			}
		};
	}

	private setupUploadEvents(uppyClient: Uppy) {
		uppyClient.on('upload-progress', (file, progress) => {
			this.status.update((status) => {
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
					while (status.uploadSpeedHistory.length > this.options.uploadSpeedHistorySize) {
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

				return status;
			});
		});

		uppyClient.on('complete', (result) => {
			this.uploadResult = result;
			this.status.update((status) => {
				status.uploadProgress = 100;
				status.uploading = false;
				return status;
			});
		});

		uppyClient.on('cancel-all', () => {
			this.status.set(UploadService.getDefaultUploadStatus());
		});

		uppyClient.on('error', (error) => {
			this.status.update((status) => {
				status.uploading = false;
				console.error('Upload error:', error);
				// Add error message displaying
				return status;
			});
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
			uploadSpeedHistory: [],
			partsSigned: 0,
			totalParts: 0,
			totalBytes: 0
		};
	}
}
