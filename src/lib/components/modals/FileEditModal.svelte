<script lang="ts">
	import { type _Object, ObjectStorageClass } from '@aws-sdk/client-s3';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { triggerConfirmActionModal } from '$lib/utils';

	export let parent;
	export let file: _Object;
	let initialFile: _Object = {};

	onMount(() => {
		initialFile = { ...file };
	});

	const modalStore = getModalStore();

	const onCancel = () => {
		file = { ...initialFile };
		modalStore.close();
	};

	const onSubmit = async () => {
		// Trigger confirm modal on top of current one
		triggerConfirmActionModal(modalStore, 'Update File', async () => {
			// Call API to update file
			if ($modalStore[1].response) $modalStore[1].response({ file, initialFile });
			modalStore.close();
		});
	};
</script>

<div class="card p-4 w-modal shadow-xl space-y-4">
	<header class="text-2xl font-bold">Update file</header>
	<form class="modal-form space-y-4 rounded-container-token">
		<label class="label">
			<span>File name</span>
			<input class="input" type="text" placeholder="Name" bind:value={file.Key} />
		</label>
		<label class="label">
			<span>Storage Category</span>
			<select class="select" bind:value={file.StorageClass}>
				{#each Object.values(ObjectStorageClass) as category}
					<option value={category}>{category}</option>
				{/each}
			</select>
		</label>

		<footer class="modal-footer flex gap-4">
			<button class="btn variant-filled-primary" on:click={onSubmit}>Update</button>
			<button class="btn variant-filled-error" on:click={onCancel}>Cancel</button>
		</footer>
	</form>
</div>
