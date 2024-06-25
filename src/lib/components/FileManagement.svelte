<script lang="ts">
	import { onMount } from 'svelte';
	import type { _Object } from '@aws-sdk/client-s3';
	import ItemList from '$lib/components/ItemList.svelte';
	import { fade } from 'svelte/transition';
	import { getModalStore, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
	import FileEditModal from '$lib/components/modals/FileEditModal.svelte';

	let response: _Object[] | undefined = [];
	export let loading = true;

	onMount(async () => {
		const res = await fetch('/api/files');
		response = await res.json();
		loading = false;
	});

	const getFileEditModal = (file: _Object): ModalSettings => {
		return {
			type: 'component',
			component: {
				ref: FileEditModal,
				props: { file }
			}
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
	></ItemList>
{/if}
