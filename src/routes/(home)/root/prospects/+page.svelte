<script lang="ts">
	import { onMount } from 'svelte'
	import type { Prospect } from '@prisma/client'
	import { mdiPlus } from '@mdi/js'
	import { Table, Pagination, Icon, type TableField } from '$lib/material'
	import SendEmail from './SendEmail.svelte'
	import { component } from '$lib/utils'

	export let data

	onMount(() => {
		const subscription = new EventSource('/root/mails/prospect')
		const handleSendEmail = (event: MessageEvent<Prospect>) => {
			console.log(event)
		}
		subscription.addEventListener('send_email', handleSendEmail)
	})

	const fields: TableField<Prospect>[] = [
		{
			key: 'id',
			label: 'Id',
			getCell: (item) => item.id,
		},
		{
			key: 'email',
			label: 'Email',
			getCell: (item) => item.email,
			visible: true,
		},
		{
			key: 'name',
			label: 'Name',
			getCell: (item) => item.name || '-',
			visible: true,
		},
		{
			key: 'site',
			label: 'Site',
			getCell: (item) => `<a href="${item.site}">${item.site}</a>`,
		},
		{
			key: 'lastContact',
			label: "Envoi de l'email",
			getCell: (item) => component(SendEmail, { prospect: item }),
			visible: true,
		},
		{
			key: 'openEmailAt',
			label: "Ouverture de l'email",
			getCell: (item) => item.emailOpenAt?.toLocaleString(),
			visible: true,
		},
		{
			key: 'linkOpenAt',
			label: 'Lien cliqué le',
			getCell: (item) => item.linkOpenAt?.toLocaleString(),
			visible: true,
		},
	]
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center">
		<h2>Prospects</h2>
		<div class="grow" />
		<a href="/root/prospects/add" class="btn btn-square">
			<Icon path={mdiPlus} />
		</a>
	</div>

	<Table key="prospects" items={data.prospects || []} {fields} />

	<div class="flex justify-end">
		<Pagination />
	</div>
</div>
