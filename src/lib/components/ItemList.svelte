<script lang="ts">
	import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
	import LinkIcon from '$lib/components/icons/LinkIcon.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { _Object } from '@aws-sdk/client-s3';
	export let items: _Object[];

	const dispatch = createEventDispatcher();

	const onClose = (upload: _Object) => {
		dispatch('close', upload);
	};
	console.log(items);
</script>

<ul class="flex flex-col gap-1.5 max-w-[75vw] p-0 list-none">
	{#each items as item}
		<li
			class="flex justify-between items-center gap-2 p-1.5 pl-3 rounded-2xl overflow-hidden bg-primary-500"
		>
			<p class="no-underline overflow-hidden text-ellipsis whitespace-nowrap">
				{item.Key}
			</p>
			<div class="flex">
				<IconButton
					on:click={() => {
						navigator.clipboard.writeText(item.url ?? '');
					}}
				>
					<LinkIcon />
				</IconButton>
				<IconButton
					on:click={() => {
						onClose(item);
					}}
				>
					<CloseIcon />
				</IconButton>
			</div>
		</li>
	{/each}
</ul>
