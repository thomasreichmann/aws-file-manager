<script lang="ts">
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import type { UploadOptions } from '$lib/types';

	export let options: Partial<UploadOptions> = {};
</script>

<Accordion>
	<AccordionItem>
		<svelte:fragment slot="summary">Advanced options</svelte:fragment>
		<svelte:fragment slot="content">
			<div class="space-y-4">
				<span class="text-sm">Chunk Size</span>
				<input class="input" bind:value={options.chunkSizeMb} />
				<!--                <input-->
				<!--                    name="adapter-select"-->
				<!--                    id="adapter-select"-->
				<!--                    class="input-primary"-->
				<!--                    bind:value={options.chunkSize}-->
				<!--                />-->
			</div>
		</svelte:fragment>
	</AccordionItem>
</Accordion>
