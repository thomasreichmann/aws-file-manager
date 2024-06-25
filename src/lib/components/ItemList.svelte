<script lang="ts">
	import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
	import LinkIcon from '$lib/components/icons/LinkIcon.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { _Object } from '@aws-sdk/client-s3';
	import EditIcon from '$lib/components/icons/EditIcon.svelte';

	export let items: _Object[];

	const dispatch = createEventDispatcher();

	const onClose = (upload: _Object) => {
		dispatch('close', upload);
	};

	// Placeholder function to extract metadata from item.Key
	const getMetadata = (item: _Object) => {
		return {
			uploader: item.Owner?.DisplayName,
			uploadedAt: new Date(item.LastModified as unknown as string).toLocaleString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: true
			}),
			storageCategory: item.StorageClass
		};
	};
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[75vw] p-0">
	{#each items as item}
		<div class="card bg-primary-500">
			<div class="card-header flex justify-between items-start">
				<h3 class="text-lg font-bold">{item.Key}</h3>
				<div class="flex space-x-2">
					<IconButton on:click={() => {}}>
						<EditIcon />
					</IconButton>
					<IconButton
						on:click={() => {
							onClose(item);
						}}
					>
						<CloseIcon />
					</IconButton>
				</div>
			</div>
			<section class="p-4">
				<p><strong>Uploader:</strong> {getMetadata(item).uploader}</p>
				<p><strong>Uploaded At:</strong> {getMetadata(item).uploadedAt}</p>
				<p><strong>Storage Category:</strong> {getMetadata(item).storageCategory}</p>
			</section>
		</div>
	{/each}
</div>

<style>
	/* Additional styling if necessary */
</style>
