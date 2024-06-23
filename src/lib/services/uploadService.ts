import getUppyClient, { createUppyClient } from '$lib/uppyClient';
import type Uppy from '@uppy/core';

const DEFAULT_CHUNK_SIZE_MB = 5;

export default class UploadService {
	private uppyClient: Uppy;

	defaultChunkSizeMb: number;

	constructor(defaultChunkSizeMb: number = DEFAULT_CHUNK_SIZE_MB) {
		this.defaultChunkSizeMb = defaultChunkSizeMb;

		this.uppyClient = this.getUppyClient(true);
	}
	getUppyClient(forceRecreate: boolean = false, chunkSize: number = this.defaultChunkSizeMb) {
		if (forceRecreate || !this.uppyClient) {
			this.uppyClient = createUppyClient(chunkSize);
		}

		return this.uppyClient;
	}
}
