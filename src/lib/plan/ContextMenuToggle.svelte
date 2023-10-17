<script lang="ts">
	import { mdiClipboardTextMultipleOutline, mdiPencilOutline } from '@mdi/js'
	import { Icon } from '$lib/material'

	type Mode = 'subscribes' | 'edit'

	export let mode: Mode = 'subscribes'

	const tabs: { value: Mode; title: string; path: string }[] = [
		{ value: 'subscribes', title: 'Gérer les inscriptions', path: mdiClipboardTextMultipleOutline },
		{ value: 'edit', title: 'Éditer la période', path: mdiPencilOutline },
	]
</script>

<div class="flex items-center border rounded-lg gap-[3px] p-[3px]">
	{#each tabs as { value, title, path }}
		<button
			on:click={() => (mode = value)}
			class="h-6 w-6 p-1 grid place-content-center rounded"
			class:bg-base-300={mode === value}
		>
			<Icon {path} {title} size={20} tippyProps={{ appendTo: 'parent' }} />
		</button>
	{/each}
</div>
