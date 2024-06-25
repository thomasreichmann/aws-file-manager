<script lang="ts">
	import { type _Object, ObjectStorageClass } from '@aws-sdk/client-s3';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	export let file: _Object;
	let initialFile: _Object = {};

	onMount(() => {
		initialFile = { ...file };
	});

	const onClose = () => {
		file = { ...initialFile };
		getModalStore().close();
	};

	const onSubmit = async () => {
		// Update file
		getModalStore().close();
	};
</script>

<div class="card p-4 w-modal shadow-xl space-y-4">
	<header class="text-2xl font-bold">Update file</header>
	<form class="modal-form border border-surface-500 p-4 space-y-4 rounded-container-token">
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
	</form>

	<footer class="modal-footer flex gap-4">
		<button class="btn variant-filled-error" on:click={onClose}>Cancel</button>
		<button class="btn variant-filled-primary" on:click={onSubmit}>Update</button>
	</footer>
</div>
