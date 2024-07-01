import AwsS3Multipart, { type AwsS3Part, type AwsS3UploadParameters } from '@uppy/aws-s3-multipart';
import Uppy, { type AddFileOptions, type IndexedObject, type UppyFile } from '@uppy/core';
import { writable, type Writable } from 'svelte/store';
import type { UploadStatus } from '$lib/types';

const DEFAULT_CHUNK_SIZE_MB = 5;

let uppyClient: Uppy;

interface UppyAbortOpts {
	uploadId: string;
	key: string;
}

interface UppyListPartsOpts {
	uploadId: string;
	key: string;
	signal: AbortSignal;
}

interface SignPartOpts {
	partNumber: number;
	uploadId: string;
}

interface completeMultipartUploadOpts {
	uploadId: string;
	parts: AwsS3Part[];
}

export interface CreateUppyClientOptions {
	chunkSizeMb: number;
	abortMultipartUpload: (file: UppyFile, opts: UppyAbortOpts) => Promise<void>;
	listParts: (file: UppyFile, opts: UppyListPartsOpts) => Promise<any>;
	getChunkSize: (file: UppyFile) => number;
	createMultipartUpload: (file: UppyFile) => Promise<any>;
	signPart: (file: UppyFile, opts: SignPartOpts) => Promise<any>;
	completeMultipartUpload: (file: UppyFile, opts: completeMultipartUploadOpts) => Promise<any>;
}

export const createUppyClient = (
	statusStore: Writable<UploadStatus>,
	options: CreateUppyClientOptions
) =>
	new Uppy().use(AwsS3Multipart, {
		shouldUseMultipart: true,
		abortMultipartUpload: options.abortMultipartUpload,
		listParts: options.listParts,
		completeMultipartUpload: options.completeMultipartUpload,
		getChunkSize: (file) => options.chunkSizeMb * 1024 * 1024,
		createMultipartUpload: async (file) => {
			const response = await options.createMultipartUpload(file);

			statusStore.update((status) => {
				status.totalParts = Math.ceil(file.size / options.getChunkSize(file));
				status.totalBytes = file.size;
				return status;
			});

			return response;
		},
		signPart: async (file, opts): Promise<AwsS3UploadParameters> => {
			const response = await options.signPart(file, opts);

			statusStore.update((status) => {
				status.partsSigned++;
				return status;
			});

			return { url: await response.text() };
		}
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
