<script lang="ts">
	import { convertToUppyFiles } from '$lib/uppyClient.js';
	import { formatBytes, formatDetailedTime, formatTime } from '$lib/utils.js';
	import { FileButton, ProgressBar } from '@skeletonlabs/skeleton';
	import type { UploadResult } from '@uppy/core';
	import type { UploadOptions } from '$lib/types';
	import AdvancedOptions from '$lib/components/AdvancedOptions.svelte';
	import UploadService from '$lib/services/uploadService';
	import FileManagement from '$lib/components/FileManagement.svelte';

	let uploadService = new UploadService();
	let { status } = uploadService;

	let files: FileList | undefined;

	async function uploadFile(fileList?: FileList) {
		if (!fileList?.length) return;

		let uppyClient = uploadService.getUppyClient(true);

		uppyClient.addFiles(convertToUppyFiles(fileList));

		files = undefined;
		await uploadService.upload();
	}

	function cancelAll() {
		let uppyClient = uploadService.getUppyClient();

		uppyClient.cancelAll({ reason: 'user' });
	}
</script>

<main class="h-full w-full flex-col gap-6 flex items-center justify-center">
	<div class="flex gap-2">
		{#if $status.uploadProgress === 0 && !$status.loading}
			<FileButton name="files" multiple bind:files />
		{/if}
		{#if files && !$status.uploading}
			<button
				class="btn variant-filled"
				on:click={() => uploadFile(files)}
				disabled={$status.loading}
			>
				Upload
			</button>
		{/if}
		{#if $status.uploading}
			<button class="btn variant-filled-error" on:click={() => cancelAll()}>Abort</button>
		{/if}
	</div>

	<div class="w-[200px] shrink-0 basis-auto">
		<AdvancedOptions bind:options={uploadService.options} />
	</div>

	<div>
		{#if files}
			<p>{files.length} file(s) selected</p>
			<p>
				Total size: {formatBytes(
					Array.from(files).reduce((acc, file) => acc + file.size, 0)
				)}
			</p>
		{:else}
			No files selected
		{/if}
	</div>

	<div id="upload-status" class="flex flex-col gap-2">
		{#if $status.uploading}
			<p>Upload Progress: {$status.uploadProgress}%</p>
		{/if}

		{#if $status.uploading}
			<p>
				Upload Speed: {formatBytes($status.averageUploadSpeed)}/s
			</p>
			<p>
				Estimated time remaining: {formatTime($status.estimatedTimeRemainingSeconds)}
			</p>
			<p>
				Total uploaded: {formatBytes($status.previousUploadedBytes)}/{formatBytes(
					$status.totalBytes
				)}
			</p>
			<p>
				Parts signed: {$status.partsSigned}/{$status.totalParts}
			</p>
		{/if}
	</div>

	<FileManagement />
</main>

<div id="global-fetching-indicator-wrapper" class:visible={$status.loading}>
	<ProgressBar meter="bg-secondary-500" />
</div>

<style lang="postcss">
	#global-fetching-indicator-wrapper {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100vw;
		opacity: 0;
		transform: translateY(100%);
		transition:
			opacity 0.2s,
			transform 0.2s;
	}

	#global-fetching-indicator-wrapper.visible {
		opacity: 1;
		transform: translateY(0);
	}
</style>
