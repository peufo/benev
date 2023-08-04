<script lang="ts">
	import { browser } from '$app/environment'
	import { Icon } from '$lib/material'
	import { mdiFormatListChecks, mdiAlertOctagonOutline, mdiCheck } from '@mdi/js'
	import PeriodForm from './PeriodForm.svelte'
	import SubscribeForm from './SubscribeForm.svelte'
	import ThanksDialog from './ThanksDialog.svelte'

	export let data

	const formater = new Intl.DateTimeFormat('fr-ch', {
		weekday: 'long',
		day: 'numeric',
		month: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	})
	const formatRange = (start: Date, end: Date) => formater.formatRange(start, end)

	let subscribeDialog: HTMLDialogElement
	let thanksDialog: ThanksDialog
	let selectedPeriod: (typeof data.periods)[number] | undefined = undefined
</script>

<div class="p-4 card bg-base-100 max-w-4xl m-auto">
	<div class="flex gap-2 py-2 items-center">
		<div>
			<h2 class="text-2xl">{data.team.name}</h2>
			<p>{data.team.description || ''}</p>
		</div>
		<div class="grow" />
	</div>
	<div class="divider" />

	<table class="table">
		<thead>
			<tr>
				<th>Période de travail</th>
				<th>Bénévoles</th>
			</tr>
		</thead>

		<tbody>
			{#each data.periods as period}
				{@const nbSubscribe = period.subscribes.filter((sub) => sub.state !== 'denied').length}
				{@const userSubscribe = period.subscribes.find((sub) => sub.userId === data.user?.userId)}
				{@const disabled = userSubscribe || nbSubscribe >= period.maxSubscribe}
				<tr
					class="relative"
					class:hover={!disabled}
					class:cursor-pointer={!disabled}
					class:opacity-70={disabled}
					on:click={() => {
						if (disabled) return
						selectedPeriod = period
						subscribeDialog.showModal()
					}}
				>
					<td class="w-full">
						{#if browser}
							{formatRange(period.start, period.end)}
						{/if}
					</td>
					<td class="flex gap-2 items-center w-40">
						<progress class="progress" value={nbSubscribe} max={period.maxSubscribe} />
						{#if userSubscribe?.state === 'request'}
							<Icon path={mdiFormatListChecks} class="fill-info" title="En attente de validation" />
						{:else if userSubscribe?.state === 'accepted'}
							<Icon path={mdiCheck} class="fill-success" title="Validé" />
						{:else if userSubscribe?.state === 'denied'}
							<Icon path={mdiAlertOctagonOutline} class="fill-warning" title="Inscription refusé" />
						{/if}
						<span class="whitespace-nowrap">
							{nbSubscribe} / {period.maxSubscribe}
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if data.isLeader}
	<div class="p-4 card bg-base-100 max-w-4xl m-auto mt-4">
		<PeriodForm />
	</div>
{/if}

<dialog class="modal" bind:this={subscribeDialog}>
	<SubscribeForm
		userId={data.user?.userId || ''}
		periodId={selectedPeriod?.id || ''}
		teamName={data.team.name}
		periodLabel={selectedPeriod && formatRange(selectedPeriod.start, selectedPeriod.end)}
		on:close={() => subscribeDialog.close()}
		on:success={() => {
			subscribeDialog.close()
			thanksDialog.open()
		}}
	/>
</dialog>

<ThanksDialog bind:this={thanksDialog} />
