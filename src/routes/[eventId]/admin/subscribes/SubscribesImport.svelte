<script lang="ts">
	import { derived } from 'svelte/store'
	import { page } from '$app/stores'
	import { ButtonCopy, DropDown, Icon } from 'fuma'
	import { mdiFileDelimitedOutline, mdiTrayArrowDown } from '@mdi/js'
	import { eventPath } from '$lib/store'
	import { toast } from 'svelte-sonner'

	let dropdown: DropDown

	let urlSubscribesCSV = derived(page, ({ url }) => {
		const params = new URLSearchParams(url.searchParams)
		const zone = Intl.DateTimeFormat().resolvedOptions()
		params.set('locale', zone.locale)
		params.set('timeZone', zone.timeZone)
		return `${$eventPath}/admin/subscribes/csv?${params.toString()}`
	})

	const getSubscribesCSV = async () => {
		const res = await fetch($urlSubscribesCSV)
		const csv = await res.text()
		return csv
	}
</script>

<DropDown bind:this={dropdown} hideOnBlur>
	<button slot="activator" class="btn btn-square btn-sm">
		<Icon path={mdiTrayArrowDown} size={20} />
	</button>

	<div class="flex flex-col gap-1">
		<ButtonCopy
			on:success={() => {
				dropdown.hide()
				toast.success('Données copiées !')
			}}
			class="menu-item w-full"
			value={getSubscribesCSV}
			label="Copier les données"
		/>
		<a href={$urlSubscribesCSV} class="menu-item" target="_parent">
			<Icon path={mdiFileDelimitedOutline} size={20} />
			<span>Télécharger un CSV</span>
		</a>
	</div>
</DropDown>
