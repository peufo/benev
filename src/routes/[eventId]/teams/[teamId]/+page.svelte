<script lang="ts">
	import { Icon } from '$lib/material'
	import { mdiChevronRight, mdiPencilOutline } from '@mdi/js'
	import PeriodForm from './PeriodForm.svelte'
	import SubscribeForm from './SubscribeForm.svelte'
	import ThanksDialog from './ThanksDialog.svelte'
	import Subscribes from './Subscribes.svelte'
	import { urlParam } from '$lib/store'
	import { goto } from '$app/navigation'
	import SubscribeState from '$lib/SubscribeState.svelte'
	import { formatRange } from '$lib/formatRange'

	export let data

	let subscribeDialog: HTMLDialogElement
	let updateDialog: HTMLDialogElement
	let thanksDialog: ThanksDialog
	let periodUpdatForm: PeriodForm
	let selectedPeriod: (typeof data.periods)[number] | undefined = undefined

	const periodOpenKey = 'periodOpen'
</script>

<div class="p-4 card bg-base-100 max-w-4xl m-auto">
	<div class="flex gap-2 py-2 items-center">
		<div>
			<h2 class="text-2xl">{data.team.name}</h2>
			<p>{data.team.description || ''}</p>
			<div>
				Responsables :
				<!-- TODO: menu de lien utils vers les responsables -->
				{#each data.team.leaders as {user}}
					<a href="#" class="btn btn-xs btn-ghost">
						{user.firstName}
						{user.lastName}
					</a>
				{/each}
			</div>
		</div>
		<div class="grow" />
	</div>
	<div class="divider" />

	<table class="table text-base">
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
					class:border-0={$urlParam.hasValue(periodOpenKey, period.id)}
					on:click={() => {
						if (disabled) return
						selectedPeriod = period
						subscribeDialog.showModal()
					}}
				>
					<td class="w-full">
						{formatRange(period)}
					</td>
					<td class="flex gap-2 items-center">
						<progress class="progress max-w-[100px] w-[8vw]" value={nbSubscribe} max={period.maxSubscribe} />
						
						<span class="whitespace-nowrap text-xs">
							{nbSubscribe}/{period.maxSubscribe}
						</span>

						{#if userSubscribe}
							<SubscribeState state={userSubscribe.state} />
						{:else}
							<div class="grow"></div>
						{/if}

					{#if data.isLeader}
							<div class="flex gap-2">
								<button
									class="btn btn-square btn-sm"
									on:click|stopPropagation={() => {
										periodUpdatForm.setPeriod(period)
										updateDialog.showModal()
									}}
								>
									<Icon path={mdiPencilOutline} />
								</button>

								<button
									class="btn btn-square btn-sm"
									on:click|stopPropagation={() => {
										if ($urlParam.hasValue(periodOpenKey, period.id)) {
											goto($urlParam.without(periodOpenKey), { replaceState: true })
											return
										}
										goto($urlParam.with({ [periodOpenKey]: period.id }), { replaceState: true })
									}}
								>
									<Icon
										path={mdiChevronRight}
										class=" transition-transform
											{$urlParam.hasValue(periodOpenKey, period.id) ? 'rotate-90' : ''}
										"
									/>
								</button>
							</div>
							{/if}
						</td>
				</tr>

				<Subscribes
					subscribes={period.subscribes}
					isOpen={$urlParam.hasValue(periodOpenKey, period.id)}
				/>
			{/each}
		</tbody>
	</table>
</div>

{#if data.isLeader}
	<div class="p-4 card bg-base-100 max-w-4xl m-auto mt-4">
		<PeriodForm />
	</div>
{/if}

<dialog class="modal" bind:this={updateDialog}>
	<div class="modal-box">
		<PeriodForm
			isUpdate
			bind:this={periodUpdatForm}
			on:cancel={() => updateDialog.close()}
			on:success={() => updateDialog.close()}
		/>
	</div>
</dialog>

<dialog class="modal" bind:this={subscribeDialog}>
	<SubscribeForm
		userId={data.user?.userId || ''}
		periodId={selectedPeriod?.id || ''}
		teamName={data.team.name}
		periodLabel={selectedPeriod && formatRange(selectedPeriod)}
		on:close={() => subscribeDialog.close()}
		on:success={() => {
			subscribeDialog.close()
			thanksDialog.open()
		}}
	/>
</dialog>

<ThanksDialog bind:this={thanksDialog} />
