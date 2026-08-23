<script lang="ts">
	import { DownloadIcon, FileSpreadsheetIcon } from '@lucide/svelte'
	import { page } from '$app/state'
	import { ButtonCopy, DropDown } from 'fuma'
	import { eventPath } from '$lib/eventPath'

	let dropdown: DropDown = $state()!

	let urlSubscribesCSV = $derived.by(() => {
		// Construit puis sérialisé immédiatement: pas un état réactif.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const params = new URLSearchParams(page.url.searchParams)
		const zone = Intl.DateTimeFormat().resolvedOptions()
		params.set('locale', zone.locale)
		return `${eventPath('/admin/subscribes/csv')}?${params.toString()}`
	})

	const getSubscribesCSV = async () => {
		const res = await fetch(urlSubscribesCSV)
		const csv = await res.text()
		return csv
	}
</script>

<DropDown bind:this={dropdown} hideOnBlur>
	{#snippet activator()}
		<button class="btn btn-square btn-sm">
			<DownloadIcon size={20} />
		</button>
	{/snippet}

	<div class="flex flex-col gap-1">
		<ButtonCopy
			onSuccess={() => dropdown.hide()}
			successMessage="Données copiées !"
			class="menu-item w-full"
			value={getSubscribesCSV}
			label="Copier les données"
		/>
		<a href={urlSubscribesCSV} class="menu-item" target="_parent">
			<FileSpreadsheetIcon size={20} />
			<span>Télécharger un CSV</span>
		</a>
	</div>
</DropDown>
