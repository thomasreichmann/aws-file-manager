<script lang="ts">
	import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
	import LinkIcon from '$lib/components/icons/LinkIcon.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { _Object } from '@aws-sdk/client-s3';
	import EditIcon from '$lib/components/icons/EditIcon.svelte';
	import type { Writable } from 'svelte/store';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { fileService } from '$lib/services/fileService';

	export let items: Writable<_Object[]>;
	let generatingLink = false;

	const dispatch = createEventDispatcher();

	const onClose = (obj: _Object) => {
		dispatch('close', obj);
	};

	const onEdit = (obj: _Object) => {
		dispatch('edit', obj);
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

	const toastStore = getToastStore();
	const onLink = async (item: _Object) => {
		generatingLink = true;
		const toastId = toastStore.trigger({
			autohide: false,
			hideDismiss: true,
			message: `Generating download link...`
		});

		try {
			const res = await fileService.fetchDownloadUrl(item);
			if (res.status === 'error') {
				toastStore.trigger({
					message: `Error fetching download URL: ${res.error}`,
					timeout: 3000,
					background: 'variant-filled-error'
				});
			} else if (res.status === 'restore-in-progress') {
				toastStore.trigger({
					message: 'Deep Glacier file restoration is still in progress, try again later',
					timeout: 3000,
					background: 'variant-filled-secondary'
				});
			} else if (res.status === 'restore-initiated') {
				toastStore.trigger({
					message:
						'Deep Glacier file restoration initiated, this might take a while, click this button again later to check restoration status',
					timeout: 3000,
					background: 'variant-filled-primary'
				});
			} else if (res.status === 'success') {
				toastStore.trigger({
					message: 'Download URL copied to your clipboard!',
					timeout: 3000,
					background: 'variant-filled-success'
				});

				await navigator.clipboard.writeText(res.url ?? 'something bad happened');
			}

			toastStore.close(toastId);
		} catch (e: any) {
			toastStore.trigger({
				message: `Error fetching download URL: ${e.message}`,
				timeout: 3000,
				background: 'variant-filled-error'
			});
		} finally {
			generatingLink = false;
		}
	};
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[75vw] p-0">
	{#each $items as item}
		<div class="card bg-primary-500 flex flex-col justify-between">
			<div class="card-header flex justify-between items-start">
				<h3 class="text-lg font-bold">{item.Key}</h3>
				<div class="flex space-x-2">
					<IconButton
						on:click={() => {
							onLink(item);
						}}
						disabled={generatingLink}
					>
						<LinkIcon />
					</IconButton>
					<IconButton
						on:click={() => {
							onEdit(item);
						}}
					>
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
				<p><strong>Uploaded At:</strong> {getMetadata(item).uploadedAt} (UTC-0)</p>
				<p><strong>Storage Category:</strong> {getMetadata(item).storageCategory}</p>
			</section>
		</div>
	{/each}
</div>
