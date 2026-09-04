<script lang="ts">
	import { ArrowLeftIcon, ArrowRightIcon, FileTextIcon } from '@lucide/svelte'

	let { data } = $props()

	const Content = $derived(data.content)
</script>

<header class="px-2 pt-4 pb-2">
	<h1 class="text-3xl font-bold tracking-tight">{data.doc.title}</h1>
	{#if data.doc.description}
		<p class="text-base-content/70 mt-2">{data.doc.description}</p>
	{/if}
</header>

<Content />

<nav class="surface flex flex-wrap items-center gap-2 p-3 text-sm">
	{#if data.previous}
		<a href={data.previous.path} class="btn btn-ghost btn-sm">
			<ArrowLeftIcon size={16} class="opacity-70" />
			{data.previous.label}
		</a>
	{/if}

	{#if data.next}
		<a href={data.next.path} class="btn btn-ghost btn-sm ml-auto">
			{data.next.label}
			<ArrowRightIcon size={16} class="opacity-70" />
		</a>
	{/if}
</nav>

<!-- Lien natif et non résolu: `.md` est une ressource servie, pas une route de l'application. -->
<a
	href="{data.doc.path}.md"
	class="text-base-content/60 hover:text-base-content mx-auto flex items-center gap-2 text-xs"
	data-sveltekit-reload
>
	<FileTextIcon size={14} />
	Cette page en markdown
</a>
