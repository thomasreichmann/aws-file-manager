<script lang="ts">
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import type { UploadOptions } from '$lib/types';

	export let options: Partial<UploadOptions> = {};
</script>

<Accordion>
	<AccordionItem>
		<svelte:fragment slot="summary">Advanced options</svelte:fragment>
		<svelte:fragment slot="content">
			<form class="space-y-4">
				<span class="text-sm">Chunk Size (mb)</span>
				<input class="input" bind:value={options.chunkSizeMb} />
			</form>
		</svelte:fragment>
	</AccordionItem>
</Accordion>
