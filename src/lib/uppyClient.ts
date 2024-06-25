import AwsS3Multipart, { type AwsS3UploadParameters } from '@uppy/aws-s3-multipart';
import Uppy, { type AddFileOptions, type IndexedObject, type UppyFile } from '@uppy/core';
import { writable, type Writable } from 'svelte/store';
import type { UploadStatus } from '$lib/types';

const DEFAULT_CHUNK_SIZE_MB = 5;

let uppyClient: Uppy;

export const createUppyClient = (
	chunkSizeMb: number = DEFAULT_CHUNK_SIZE_MB * 1024 * 1024,
	store: Writable<UploadStatus>
) =>
	new Uppy().use(AwsS3Multipart, {
		abortMultipartUpload: (file, opts) => {
			const { uploadId } = opts;
			fetch(`/api/upload/presign?uploadId=${uploadId}&key=${opts.key}`, {
				method: 'DELETE'
			}).then((r) => console.log);
		},
		listParts: async (file, opts) => {
			const { uploadId, key } = opts;
			return fetch(`/api/upload/parts?uploadId=${uploadId}&key=${key}`).then((r) => r.json());
		},
		getChunkSize: (file) => chunkSizeMb * 1024 * 1024,
		createMultipartUpload: async (file) => {
			const response = await fetch('/api/upload/presign', {
				method: 'POST',
				body: JSON.stringify({ filename: file.name })
			});

			store.update((status) => {
				status.totalParts = Math.ceil(file.size / (chunkSizeMb * 1024 * 1024));
				status.totalBytes = file.size;
				return status;
			});

			return (await response.clone().json()) as unknown as { uploadId: string; key: string };
		},
		signPart: async (file, { partNumber, uploadId }): Promise<AwsS3UploadParameters> => {
			const response = await fetch(
				`/api/upload/presign?filename=${file.name}&uploadId=${uploadId}&partNumber=${partNumber}`
			);

			store.update((status) => {
				status.partsSigned++;
				return status;
			});

			return { url: await response.text() };
		},
		completeMultipartUpload: async (file, { uploadId, parts }) => {
			const response = await fetch('/api/upload/presign', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ uploadId, parts, filename: file.name })
			});

			const data = await response.json();
			return { location: data.location };
		},
		shouldUseMultipart: true
	});

export const convertToUppyFile = (file: File): AddFileOptions => {
	return {
		name: file.name,
		size: file.size,
		data: file
	};
};

export const convertToUppyFiles = (files: FileList): AddFileOptions<Record<string, unknown>>[] => {
	return Array.from(files).map(convertToUppyFile);
};
