<script lang="ts">
	import { onMount } from 'svelte';
	import type { _Object } from '@aws-sdk/client-s3';
	import ItemList from '$lib/components/ItemList.svelte';
	import { fade } from 'svelte/transition';
	import { getModalStore, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
	import FileEditModal from '$lib/components/modals/FileEditModal.svelte';
	import { getConfirmActionModal, triggerConfirmActionModal } from '$lib/utils';

	let files: _Object[] = [];
	export let loading = true;

	onMount(async () => {
		await getFiles();
	});

	const getFiles = async () => {
		const res = await fetch('/api/files');
		files = await res.json();
		loading = false;
	};

	const deleteFile = async (file: _Object) => {
		loading = true;
		const res = await fetch(`/api/files?key=${file.Key}`, {
			method: 'DELETE'
		});

		await getFiles();
	};

	const updateFile = async (file: _Object, originalFile: _Object) => {
		loading = true;
		const res = await fetch(`/api/files?key=${originalFile.Key}`, {
			method: 'PUT',
			body: JSON.stringify(file)
		});

		await getFiles();
	};

	const getFileEditModal = (file: _Object): ModalSettings => {
		return {
			type: 'component',
			component: {
				ref: FileEditModal,
				props: { file }
			},
			response: (r) => updateFile(r.file, r.initialFile)
		};
	};

	const modalStore = getModalStore();
</script>

{#if !loading || files.length}
	<ItemList
		items={files ?? []}
		on:edit={(event) => {
			modalStore.trigger(getFileEditModal(event.detail));
		}}
		on:close={(event) => {
			triggerConfirmActionModal(modalStore, 'Delete File', () => deleteFile(event.detail));
		}}
	></ItemList>
{/if}
