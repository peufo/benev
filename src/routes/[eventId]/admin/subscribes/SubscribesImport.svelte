<script lang="ts">
	import { DownloadIcon, FileSpreadsheetIcon } from '@lucide/svelte'
	import { derived } from 'svelte/store'
	import { page } from '$app/stores'
	import { ButtonCopy } from '$lib/fuma-legacy'
	import { DropDown } from 'fuma'
	import { eventPath } from '$lib/store'
	import { toast } from 'svelte-sonner'

	let dropdown: DropDown = $state()!

	let urlSubscribesCSV = derived(page, ({ url }) => {
		// Construit puis sérialisé immédiatement: pas un état réactif.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const params = new URLSearchParams(url.searchParams)
		const zone = Intl.DateTimeFormat().resolvedOptions()
		params.set('locale', zone.locale)
		return `${$eventPath}/admin/subscribes/csv?${params.toString()}`
	})

	const getSubscribesCSV = async () => {
		const res = await fetch($urlSubscribesCSV)
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
			onsuccess={() => {
				dropdown.hide()
				toast.success('Données copiées !')
			}}
			class="menu-item w-full"
			value={getSubscribesCSV}
			label="Copier les données"
		/>
		<a href={$urlSubscribesCSV} class="menu-item" target="_parent">
			<FileSpreadsheetIcon size={20} />
			<span>Télécharger un CSV</span>
		</a>
	</div>
</DropDown>
