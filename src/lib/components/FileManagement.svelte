<script lang="ts">
	import { onMount } from 'svelte';
	import type { _Object } from '@aws-sdk/client-s3';
	import ItemList from '$lib/components/ItemList.svelte';
	import { fade } from 'svelte/transition';

	let response: _Object[] | undefined = [];
	export let loading = true;

	onMount(async () => {
		const res = await fetch('/api/files');
		response = await res.json();
		loading = false;
	});
</script>

{#if !loading}
	<ItemList items={response ?? []} on:edit={(file) => {}}></ItemList>
{/if}
