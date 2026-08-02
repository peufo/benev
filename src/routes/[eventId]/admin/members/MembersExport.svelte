<script lang="ts">
	import { ContactIcon, DownloadIcon, FileSpreadsheetIcon } from '@lucide/svelte'
	import { ButtonCopy, DropDown, tip } from 'fuma'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import { derived } from 'svelte/store'

	let dropdown: DropDown = $state()!
	type Mode = 'csv' | 'vcard'

	let urlMembers = derived(page, ({ url }) => {
		// Construit puis sérialisé immédiatement: pas un état réactif.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const params = new URLSearchParams(url.searchParams)
		const zone = Intl.DateTimeFormat().resolvedOptions()
		params.set('locale', zone.locale)
		return (mode: Mode) => `${$eventPath}/admin/members/${mode}?${params.toString()}`
	})

	const getMembersCSV = async () => {
		const res = await fetch($urlMembers('csv'))
		const csv = await res.text()
		return csv
	}
</script>

<DropDown bind:this={dropdown} hideOnBlur>
	{#snippet activator()}
		<button class="btn btn-square btn-sm">
			<span class="inline-flex" use:tip={{ content: 'Exporter les données des membres' }}
				><DownloadIcon size={20} /></span
			>
		</button>
	{/snippet}

	<div class="flex flex-col gap-1">
		<ButtonCopy
			onSuccess={() => dropdown.hide()}
			successMessage="Données copiées !"
			class="menu-item w-full"
			value={getMembersCSV}
			label="Copier les données"
		/>
		<a href={$urlMembers('csv')} class="menu-item" target="_parent">
			<FileSpreadsheetIcon size={20} />
			<span>Télécharger un CSV</span>
		</a>
		<a href={$urlMembers('vcard')} class="menu-item" target="_parent">
			<ContactIcon size={20} />
			<span>Télécharger les contacts</span>
		</a>
	</div>
</DropDown>
