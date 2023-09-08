<script lang="ts">
	import { mdiPencilOutline } from '@mdi/js'
	import InviteSubscribeForm from '$lib/InviteSubscribeForm.svelte'
	import { formatRange } from '$lib/formatRange.js'
	import { Card, Dialog, Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import PeriodForm from './PeriodForm.svelte'
	import Subscribes from '../Subscribes.svelte'

	export let data

	let editDialog: HTMLDialogElement
</script>

<Card class="max-w-4xl m-auto" returnUrl="{$eventPath}/teams/{data.period.teamId}">
	<h2 slot="title">{data.period.team.name}</h2>
	<h3 slot="subtitle" class="card-title">{formatRange(data.period)}</h3>
	<div slot="action">
		<button on:click={() => editDialog.showModal()} class="btn btn-square btn-sm">
			<Icon path={mdiPencilOutline} />
		</button>
	</div>

	<div class="flex flex-wrap gap-4">
		<div class="grow">PROGRESS</div>
		<div>
			<Subscribes subscribes={data.period.subscribes} />
			<InviteSubscribeForm />
		</div>
	</div>
</Card>

<Dialog bind:dialog={editDialog} title="Modification de la periode">
	<PeriodForm period={data.period} on:success={() => editDialog.close()} />
</Dialog>
