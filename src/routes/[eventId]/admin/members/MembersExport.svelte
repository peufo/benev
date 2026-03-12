<script lang="ts">
	import { ButtonCopy, DropDown, Icon } from 'fuma'
	import {
		mdiCardAccountMailOutline,
		mdiFileDelimitedOutline,
		mdiTrayArrowDown,
		mdiAccountMultiplePlus,
	} from '@mdi/js'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import { toast } from 'svelte-sonner'
	import { derived } from 'svelte/store'
	import MemberImportDialog from '$lib/member/MemberImportDialog.svelte'

	let dropdown: DropDown
	let importDialog: HTMLDialogElement
	type Mode = 'csv' | 'vcard'

	let urlMembers = derived(page, ({ url }) => {
		const params = new URLSearchParams(url.searchParams)
		const zone = Intl.DateTimeFormat().resolvedOptions()
		params.set('locale', zone.locale)
		params.set('timeZone', zone.timeZone)
		return (mode: Mode) => `${$eventPath}/admin/members/${mode}?${params.toString()}`
	})

	const getMembersCSV = async () => {
		const res = await fetch($urlMembers('csv'))
		const csv = await res.text()
		return csv
	}

	function openImportDialog() {
		dropdown.hide()
		importDialog.showModal()
	}
</script>

<DropDown bind:this={dropdown} hideOnBlur>
	<button slot="activator" class="btn btn-square btn-sm">
		<Icon path={mdiTrayArrowDown} size={20} title="Exporter les données des membres" />
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
		<a href={$urlMembers('csv')} class="menu-item" target="_parent">
			<Icon path={mdiFileDelimitedOutline} size={20} />
			<span>Télécharger un CSV</span>
		</a>
		<a href={$urlMembers('vcard')} class="menu-item" target="_parent">
			<Icon path={mdiCardAccountMailOutline} size={20} />
			<span>Télécharger les contacts</span>
		</a>
		<div class="divider my-1" />
		<button class="menu-item" on:click={openImportDialog}>
			<Icon path={mdiAccountMultiplePlus} size={20} />
			<span>Importer des membres</span>
		</button>
	</div>
</DropDown>

<MemberImportDialog bind:dialog={importDialog} />
