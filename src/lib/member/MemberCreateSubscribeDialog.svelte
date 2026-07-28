<script lang="ts">
	import { onMount, tick } from 'svelte'
	import { fly } from 'svelte/transition'
	import type { Period } from '@prisma/client'
	import { enhance } from '$app/forms'

	import { api } from '$lib/api'
	import { Dialog, Icon, InputRelation, SelectorList } from '$lib/fuma'
	import { useForm } from '$lib/fuma'
	import { eventPath } from '$lib/store'
	import { mdiArrowLeft } from '@mdi/js'
	import { formatRange } from '$lib/formatRange'
	import Progress from '$lib/Progress.svelte'
	import type { TeamWithComputedValues } from '$lib/server'

	interface Props {
		dialog: HTMLDialogElement
		memberId: string
		title?: string
	}

	let { dialog = $bindable(), memberId, title = 'Nouvelle inscription' }: Props = $props()

	let selectedTeam: TeamWithComputedValues | null = $state(null)
	let selectedPeriod: Period | null = $state(null)
	let inputRelationTeam: InputRelation<TeamWithComputedValues> = $state()
	let offsetWidth: number = $state()

	let submitButton: HTMLButtonElement = $state()
	const form = useForm({
		successReset: false,
		onSuccess() {
			dialog.close()
		},
	})

	async function handleClickReturn() {
		selectedTeam = null
		await tick()
		inputRelationTeam.clear()
	}
	function handleSelectTeam(team: TeamWithComputedValues) {
		setTimeout(async () => {
			selectedTeam = team
			await tick()
			dialog.focus()
		}, 0)
	}

	async function onSelect(periodIndex: number) {
		if (!selectedTeam) return
		selectedPeriod = selectedTeam.periods.filter((p) => p.isAvailable)[periodIndex]
		await tick()
		submitButton.click()
	}

	onMount(() => {
		const returnKey = (event: KeyboardEvent) => event.key === 'Backspace' && handleClickReturn()
		dialog.addEventListener('keydown', returnKey)
		return () => {
			dialog.removeEventListener('keydown', returnKey)
		}
	})
</script>

<Dialog bind:dialog class="overflow-x-hidden">
	{#snippet header()}
		<h2 class="title" bind:offsetWidth>{title}</h2>
	{/snippet}
	{#if !selectedTeam}
		<div class="content" in:fly={{ x: -offsetWidth, duration: 250 }}>
			<InputRelation
				bind:this={inputRelationTeam}
				flatMode
				search={(search) => $api.team.search(search, { take: 10, onlyAvailable: true })}
				placeholder="Chercher un secteur"
				classList="max-h-80 overflow-y-auto relative"
				on:input={({ detail }) => handleSelectTeam(detail.value)}
			>
				{#snippet suggestion({ item })}
					<span>{item.name}</span>
					<Progress
						class="ml-auto"
						period={{
							maxSubscribe: item.maxSubscribes,
							subscribes: item.periods.map((p) => p.subscribes).flat(),
						}}
					/>
				{/snippet}
			</InputRelation>
		</div>
	{:else}
		<form
			in:fly={{ x: offsetWidth, duration: 250 }}
			action="{$eventPath}/subscribes?/subscribe_create"
			method="post"
			use:enhance={form.submit}
		>
			<div class="flex gap-2 items-center">
				<button type="button" class="btn btn-square btn-ghost btn-sm" onclick={handleClickReturn}>
					<Icon path={mdiArrowLeft} />
				</button>
				<h3 class="title text-lg">{selectedTeam.name}</h3>
			</div>

			<SelectorList
				trigger={dialog}
				items={selectedTeam.periods.filter((p) => p.isAvailable)}
				class="w-full max-h-80 mt-2 overflow-y-auto relative"
				on:select={({ detail }) => onSelect(detail)}
			>
				{#snippet children({ item })}
					<span>{formatRange(item)}</span>
					<Progress period={item} class="ml-auto" />
				{/snippet}
			</SelectorList>
			<input type="hidden" name="memberId" value={memberId} />
			<input type="hidden" name="periodId" value={selectedPeriod?.id} />
			<button type="submit" bind:this={submitButton} class="hidden">submit</button>
		</form>
	{/if}
</Dialog>
