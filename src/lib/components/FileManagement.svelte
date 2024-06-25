<script lang="ts">
	import { onMount } from 'svelte';
	import type { _Object, MultipartUpload } from '@aws-sdk/client-s3';
	import { CodeBlock } from '@skeletonlabs/skeleton';
	import ItemList from '$lib/components/ItemList.svelte';

	let response: _Object[] | undefined;

	let loading = false;

	onMount(async () => {
		const res = await fetch('/api/files');

		response = await res.json();
	});
</script>

{#if response}
	<ItemList items={response}></ItemList>
{:else}
	loading : {loading}
{/if}

<!--{#if false}-->
<!--	<CodeBlock language="json" code={JSON.stringify(response, null, 2)} />-->
<!--{/if}-->
