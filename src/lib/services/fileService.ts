import { writable, type Writable } from 'svelte/store';
import type {
	_Object,
	CopyObjectCommandOutput,
	DeleteObjectCommandOutput
} from '@aws-sdk/client-s3';
import { Service } from '$lib/services/Service';

type DownloadUrlStatus = 'success' | 'restore-in-progress' | 'restore-initiated' | 'error';

class FileService extends Service {
	public fileStore: Writable<_Object[]> = writable([]);

	constructor() {
		super('/api/files');
	}

	public async fetchDownloadUrl(file: _Object): Promise<{
		status: DownloadUrlStatus;
		url?: string;
		error?: string;
		message?: string;
	}> {
		const fetchResponse = await fetch(`${this.baseURL.toString()}/${file.Key}`);
		const res = await fetchResponse.json();

		if (!fetchResponse.ok) return { status: 'error', message: res.message };

		return { status: res.status, url: res.url };
	}

	public async fetchFiles(): Promise<_Object[]> {
		const res = await (await fetch(this.baseURL)).json();
		const fetchedFiles = res as _Object[];

		this.fileStore.set(fetchedFiles);
		return fetchedFiles;
	}

	public async deleteFile(file: _Object): Promise<DeleteObjectCommandOutput> {
		const res = await fetch(this.baseURL, {
			method: 'DELETE'
		});

		await this.fetchFiles();

		return res.json();
	}

	public async updateFile(
		file: _Object,
		originalFile: Required<_Object>
	): Promise<CopyObjectCommandOutput> {
		const url = this.baseURL;
		url.searchParams.append('key', originalFile.Key);

		const res = await fetch(url, {
			method: 'PUT',
			body: JSON.stringify(file)
		});

		await this.fetchFiles();

		return res.json();
	}

	static fileService: FileService;
	public static getInstance() {
		if (!FileService.fileService) {
			FileService.fileService = new FileService();
		}

		return FileService.fileService;
	}
}

export const fileService = FileService.getInstance();
