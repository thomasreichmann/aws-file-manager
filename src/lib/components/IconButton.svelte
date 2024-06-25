<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    const onClick = (event: MouseEvent) => {
        dispatch('click', event);
    };
</script>

<button
    class="p-1 rounded-full bg-transparent hover:bg-surface-hover-token transition-colors"
    on:click={onClick}
>
    <slot />
</button>
