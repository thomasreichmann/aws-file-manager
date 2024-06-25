<script lang="ts">
	import { onMount } from 'svelte';
	import type { _Object } from '@aws-sdk/client-s3';
	import ItemList from '$lib/components/ItemList.svelte';

	let response: _Object[] | undefined = [];
	export let loading = true;

	onMount(async () => {
		const res = await fetch('/api/files');
		response = await res.json();
		loading = false;
	});
</script>

{#if !loading}
	<ItemList items={response ?? []}></ItemList>
{/if}
