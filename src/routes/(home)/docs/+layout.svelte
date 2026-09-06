<script lang="ts">
	import { cubicOut } from 'svelte/easing'
	import { fly } from 'svelte/transition'
	import { page } from '$app/state'
	import { DocNav } from '$lib/doc'

	let { data, children } = $props()

	// Les chapitres appartiennent à la page, la navigation entre pages au layout: c'est le seul
	// point où les deux se rejoignent.
	let doc = $derived(page.data.doc)
</script>

<div class="mx-auto w-full max-w-6xl gap-3 pb-40 lg:flex lg:items-start">
	{#if page.route.id !== '/(home)/docs'}
		<DocNav pages={data.docNav} sections={doc?.sections} slug={doc?.slug} />
	{/if}
	{#key doc}
		<div
			class="mx-auto flex w-full max-w-2xl min-w-0 flex-col gap-3"
			in:fly={{ y: 20, opacity: 0, duration: 500, easing: cubicOut }}
		>
			{@render children?.()}
		</div>
	{/key}
</div>
