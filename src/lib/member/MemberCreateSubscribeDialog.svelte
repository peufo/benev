<script lang="ts">
	import { tick } from 'svelte'
	import { fly } from 'svelte/transition'
	import type { Period, Team } from '@prisma/client'
	import { enhance } from '$app/forms'

	import { api } from '$lib/api'
	import { Dialog, Icon, InputRelation, SelectorList } from '$lib/material'
	import { useForm } from '$lib/validation'
	import { eventPath } from '$lib/store'
	import { mdiArrowLeft } from '@mdi/js'
	import { selector } from '$lib/action'

	export let dialog: HTMLDialogElement
	export let memberId: string

	type TeamWithPeriods = Team & { periods: Period[] }

	let selectedTeam: TeamWithPeriods | null = null
	let selectedPeriodId = ''
	let inputRelationTeam: InputRelation<TeamWithPeriods>
	let offsetWidth: number

	let formElement: HTMLFormElement
	const form = useForm({
		successCallback() {
			dialog.close()
		},
	})

	async function handleClickReturn() {
		selectedTeam = null
		await tick()
		inputRelationTeam.clear()
	}
	function handleSelectTeam(team: TeamWithPeriods) {
		setTimeout(async () => {
			selectedTeam = team
			await tick()
			dialog.focus()
		}, 0)
	}

	function onSelect(periodIndex: number) {
		if (!selectedTeam) return
		selectedPeriodId = selectedTeam.periods[periodIndex].id
		formElement.submit()
	}
</script>

<Dialog bind:dialog class="overflow-x-hidden">
	<h2 slot="header" class="title" bind:offsetWidth>Nouvelle inscription</h2>
	{#if !selectedTeam}
		<div class="content" in:fly={{ x: -offsetWidth, duration: 250 }}>
			<InputRelation
				bind:this={inputRelationTeam}
				flatMode
				search={(search) => $api.team.search(search, 10)}
				placeholder="Chercher un secteur"
				classList="max-h-80 overflow-y-auto relative"
				on:input={({ detail }) => handleSelectTeam(detail.value)}
			>
				<svelte:fragment slot="listItem" let:item>
					<span>{item.name}</span>
				</svelte:fragment>
			</InputRelation>
		</div>
	{:else}
		<form
			in:fly={{ x: offsetWidth, duration: 250 }}
			bind:this={formElement}
			action="{$eventPath}/admin/members/{memberId}?/subscribe"
			method="post"
			use:enhance={form.submit}
		>
			<div class="flex gap-2 items-center">
				<button type="button" class="btn btn-square btn-ghost btn-sm" on:click={handleClickReturn}>
					<Icon path={mdiArrowLeft} />
				</button>
				<h3 class="title text-lg">{selectedTeam.name}</h3>
			</div>

			<SelectorList
				trigger={dialog}
				items={selectedTeam.periods}
				class="w-full max-h-80 mt-2 overflow-y-auto relative"
				on:select={({ detail }) => onSelect(detail)}
			>
				<svelte:fragment let:item>
					{item.start}
				</svelte:fragment>
			</SelectorList>

			<input type="hidden" name="periodId" value={selectedPeriodId} />
		</form>
	{/if}
</Dialog>
