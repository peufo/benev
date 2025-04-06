<script lang="ts">
	import { ButtonCopy, DropDown, Icon, param } from 'fuma'
	import { mdiCardAccountMailOutline, mdiFileDelimitedOutline, mdiTrayArrowDown } from '@mdi/js'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import { toast } from 'svelte-sonner'

	let dropdown: DropDown
	$: urlMembersCSV = `${$eventPath}/admin/members/csv?${$page.url.searchParams.toString()}`
	$: urlMembersVCard = `${$eventPath}/admin/members/vcard?${$page.url.searchParams.toString()}`

	const getMembersCSV = async () => {
		const res = await fetch(urlMembersCSV)
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
			value={getMembersCSV}
			label="Copier les données"
		/>
		<a href={urlMembersCSV} class="menu-item" target="_parent">
			<Icon path={mdiFileDelimitedOutline} size={20} />
			<span>Télécharger un CSV</span>
		</a>
		<a href={urlMembersVCard} class="menu-item" target="_parent">
			<Icon path={mdiCardAccountMailOutline} size={20} />
			<span>Télécharger les contacts</span>
		</a>
	</div>
</DropDown>
