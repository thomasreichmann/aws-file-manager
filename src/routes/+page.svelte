<script lang="ts">
	import { convertToUppyFiles } from '$lib/uppyClient.js';
	import { formatBytes, formatDetailedTime, formatTime } from '$lib/utils.js';
	import { FileButton, ProgressBar } from '@skeletonlabs/skeleton';
	import type { UploadResult } from '@uppy/core';
	import type { UploadOptions } from '$lib/types';
	import AdvancedOptions from '$lib/components/AdvancedOptions.svelte';
	import UploadService from '$lib/services/uploadService';
	import FileManagement from '$lib/components/FileManagement.svelte';
	import UploadManager from '$lib/components/UploadManagement.svelte';

	let uploadService = UploadService.getInstance();
	let { status } = uploadService;

	// Extract file management loading to the fileService, and get it through the singleton instance in the same way as the upload
	let fileManagementLoading: boolean;

	// TODO: add an option to upload the file in a different storage category ie: 'deep-glacier'
</script>

<main class="h-full w-full flex-col gap-6 flex items-center justify-center">
	<UploadManager />

	<FileManagement bind:loading={fileManagementLoading} />
</main>

<div
	id="global-fetching-indicator-wrapper"
	class:visible={$status.loading || fileManagementLoading}
>
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
