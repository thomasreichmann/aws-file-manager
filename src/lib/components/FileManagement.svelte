<script lang="ts">
	import { onMount } from 'svelte';
	import type { _Object } from '@aws-sdk/client-s3';
	import ItemList from '$lib/components/ItemList.svelte';
	import { fade } from 'svelte/transition';
	import { getModalStore, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
	import FileEditModal from '$lib/components/modals/FileEditModal.svelte';
	import { getConfirmActionModal, triggerConfirmActionModal } from '$lib/utils';

	let response: _Object[] | undefined = [];
	export let loading = true;

	onMount(async () => {
		const res = await fetch('/api/files');
		response = await res.json();
		loading = false;
	});

	const deleteFile = (file: _Object) => {
		console.log(`Delete file: ${file.Key}`);
	};

	const updateFile = (file: _Object) => {
		console.log(`Update file: ${file.Key}`);
	};

	const getFileEditModal = (file: _Object): ModalSettings => {
		return {
			type: 'component',
			component: {
				ref: FileEditModal,
				props: { file }
			},
			response: (r) => updateFile(r)
		};
	};

	const modalStore = getModalStore();
</script>

{#if !loading}
	<ItemList
		items={response ?? []}
		on:edit={(event) => {
			modalStore.trigger(getFileEditModal(event.detail));
		}}
		on:close={(event) => {
			triggerConfirmActionModal(modalStore, 'Delete File', () => deleteFile(event.detail));
		}}
	></ItemList>
{/if}
