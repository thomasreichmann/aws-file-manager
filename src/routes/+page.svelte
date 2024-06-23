<script lang="ts">
	import { convertToUppyFiles } from '$lib/uppyClient.js';
	import { formatBytes, formatDetailedTime, formatTime } from '$lib/utils.js';
	import { FileButton, ProgressBar } from '@skeletonlabs/skeleton';
	import type { UploadResult } from '@uppy/core';
	import type { UploadOptions } from '$lib/types';
	import AdvancedOptions from '$lib/components/AdvancedOptions.svelte';
	import UploadService from '$lib/services/uploadService';

	let options: UploadOptions = {
		chunkSizeMb: 10
	};

	let uploadService = new UploadService(options.chunkSizeMb);

	let files: FileList;

	let uploadResult: UploadResult;
	let uploadProgress = 0;

	let previousUploadedBytes = 0;
	let previousTime = 0;

	let uploadSpeed = 0;
	let averageUploadSpeed = 0;
	let uploadSpeedHistory: number[] = [];
	let estimatedTimeRemainingSeconds = 0;
	const maxUploadSpeedHistory = 100;

	let loading = false;

	async function uploadFile(files: FileList, chunkSizeMb: number = 10) {
		if (!files.length) return;

		loading = true;

		let uppyClient = uploadService.getUppyClient(true, chunkSizeMb);

		uppyClient.addFiles(convertToUppyFiles(files));

		// Listen for progress updates
		uppyClient.on('upload-progress', (file, progress) => {
			loading = false;
			let rawProgress = (progress.bytesUploaded / progress.bytesTotal) * 100;
			uploadProgress = parseFloat(rawProgress.toFixed(2));

			// Calculate the current upload speed
			const currentTime = Date.now();
			const timeElapsed = (currentTime - previousTime) / 1000; // in seconds
			const bytesUploaded = progress.bytesUploaded - previousUploadedBytes;

			if (timeElapsed > 0) {
				uploadSpeed = bytesUploaded / timeElapsed; // in bytes per second

				uploadSpeedHistory.push(uploadSpeed);
				while (uploadSpeedHistory.length > maxUploadSpeedHistory) {
					uploadSpeedHistory.shift();
				}

				averageUploadSpeed =
					uploadSpeedHistory.reduce((acc, speed) => acc + speed, 0) /
					uploadSpeedHistory.length;

				estimatedTimeRemainingSeconds =
					(progress.bytesTotal - progress.bytesUploaded) / averageUploadSpeed;
			}

			previousUploadedBytes = progress.bytesUploaded;
			previousTime = currentTime;
		});

		uppyClient.on('complete', (result) => {
			uploadResult = result;
			uploadProgress = 100;
		});

		try {
			await uppyClient.upload();
		} catch (error) {
			console.error(error);
		} finally {
			loading = false;
		}
	}

	function cancelAll() {
		let uppyClient = uploadService.getUppyClient();

		uppyClient.cancelAll({ reason: 'user' });

		uploadProgress = 0;
		uploadSpeed = 0;
	}
</script>

<main class="h-full w-full flex-col gap-6 flex items-center justify-center">
	<div class="flex gap-2">
		{#if uploadProgress === 0 && !loading}
			<FileButton name="files" multiple bind:files />
		{/if}
		{#if files && uploadProgress === 0}
			<button
				class="btn variant-filled"
				on:click={() => uploadFile(files)}
				disabled={loading}
			>
				Upload
			</button>
		{/if}
		{#if uploadProgress > 0}
			<button class="btn variant-filled-error" on:click={() => cancelAll()}>Abort</button>
		{/if}
	</div>

	<div class="w-[200px] shrink-0 basis-auto">
		<AdvancedOptions bind:options />
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

	<div class="flex flex-col gap-2">
		{#if uploadProgress > 0}
			<p>Upload Progress: {uploadProgress}%</p>
		{/if}

		{#if uploadSpeed > 0}
			<p>
				Upload Speed: {formatBytes(averageUploadSpeed)}/s
			</p>
			<p>
				Estimated time remaining: {formatTime(estimatedTimeRemainingSeconds)}
			</p>
		{/if}

		{#if uploadResult}
			<h1>
				{JSON.stringify(uploadResult, null, 2)}
			</h1>
		{/if}
	</div>
</main>

<div id="global-fetching-indicator-wrapper" class:visible={loading}>
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
