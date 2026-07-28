<script lang="ts">
	import { ButtonCopy, DropDown, Icon } from '$lib/fuma'
	import { mdiCardAccountMailOutline, mdiFileDelimitedOutline, mdiTrayArrowDown } from '@mdi/js'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import { toast } from 'svelte-sonner'
	import { derived } from 'svelte/store'

	let dropdown: DropDown = $state()
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
			<Icon path={mdiTrayArrowDown} size={20} title="Exporter les données des membres" />
		</button>
	{/snippet}

	<div class="flex flex-col gap-1">
		<ButtonCopy
			on:success={() => {
				dropdown.hide()
				toast.success('Données copiées !')
			}}
			class="menu-item w-full"
			value={getMembersCSV}
			label="Copier les données"
		/>
		<a href={$urlMembers('csv')} class="menu-item" target="_parent">
			<Icon path={mdiFileDelimitedOutline} size={20} />
			<span>Télécharger un CSV</span>
		</a>
		<a href={$urlMembers('vcard')} class="menu-item" target="_parent">
			<Icon path={mdiCardAccountMailOutline} size={20} />
			<span>Télécharger les contacts</span>
		</a>
	</div>
</DropDown>
