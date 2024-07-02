<script lang="ts">
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { STORAGE_CLASS_KEYS, type UploadOptions } from '$lib/types';

	export let options: Partial<UploadOptions> = {};
</script>

<Accordion>
	<AccordionItem>
		<svelte:fragment slot="summary">Advanced options</svelte:fragment>
		<svelte:fragment slot="content">
			<form class="space-y-4">
				<label>
					<span class="text-sm">Chunk Size (mb)</span>
					<input class="input" bind:value={options.chunkSizeMb} />
				</label>
				<label>
					<span class="text-sm">File storage class</span>
					<select class="select" bind:value={options.storageClass}>
						{#each Object.entries(STORAGE_CLASS_KEYS) as [title]}
							<option class="select">{title}</option>
						{/each}
					</select>
				</label>
			</form>
		</svelte:fragment>
	</AccordionItem>
</Accordion>
