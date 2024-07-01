<script lang="ts">
	import { onMount } from 'svelte';
	import type { _Object } from '@aws-sdk/client-s3';
	import ItemList from '$lib/components/ItemList.svelte';
	import { fade } from 'svelte/transition';
	import { getModalStore, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
	import FileEditModal from '$lib/components/modals/FileEditModal.svelte';
	import { getConfirmActionModal, triggerConfirmActionModal } from '$lib/utils';
	import { fileService } from '$lib/services/fileService';

	export let loading: boolean;

	onMount(async () => {
		loading = true;
		await fileService.fetchFiles();
		loading = false;
	});

	const getFileEditModal = (file: _Object): ModalSettings => {
		return {
			type: 'component',
			component: {
				ref: FileEditModal,
				props: { file }
			},
			response: async (r) => {
				if (!r) return;

				loading = true;
				await fileService.updateFile(r.file, r.initialFile);
				loading = false;
			}
		};
	};

	const modalStore = getModalStore();
</script>

<ItemList
	items={fileService.fileStore}
	on:edit={(event) => {
		modalStore.trigger(getFileEditModal(event.detail));
	}}
	on:close={(event) => {
		triggerConfirmActionModal(modalStore, 'Delete File', () => {
			loading = true;
			fileService.deleteFile(event.detail);
			loading = false;
		});
	}}
/>
