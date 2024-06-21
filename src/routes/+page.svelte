<script lang="ts">
	import uppy from '$lib/uppy.js';
	import { onMount } from 'svelte';

	onMount(async () => {
		const file = new File(['test content'], 'test-file.txt', { type: 'text/plain' });

		uppy.addFile({
			name: 'test-file.txt',
			type: 'text/plain',
			data: file
		});

		const result = await uppy.upload();
	});
</script>
