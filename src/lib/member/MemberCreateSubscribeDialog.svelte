<script lang="ts">
	import { onMount, tick } from 'svelte'
	import { fly } from 'svelte/transition'
	import type { Period, Subscribe } from '@prisma/client'
	import { enhance } from '$app/forms'

	import { api } from '$lib/api'
	import { Dialog, Icon, InputRelation, SelectorList } from 'fuma'
	import { useForm } from 'fuma/validation'
	import { eventPath } from '$lib/store'
	import { mdiArrowLeft } from '@mdi/js'
	import { formatRange } from '$lib/formatRange'
	import Progress from '$lib/Progress.svelte'
	import type { TeamWithComputedValues } from '$lib/server'
	import { toast } from 'svelte-sonner'

	export let dialog: HTMLDialogElement
	export let memberId: string
	export let title = 'Nouvelle inscription'

	let selectedTeam: TeamWithComputedValues | null = null
	let selectedPeriod: Period | null = null
	let inputRelationTeam: InputRelation<TeamWithComputedValues>
	let offsetWidth: number

	let submitButton: HTMLButtonElement
	const form = useForm({
		successReset: false,
		onSuccess() {
			dialog.close()
		},
		onFail(failure) {
			toast.error(failure?.message)
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
	<h2 slot="header" class="title" bind:offsetWidth>{title}</h2>
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
				<svelte:fragment slot="suggestion" let:item>
					<span>{item.name}</span>
					<Progress
						class="ml-auto"
						period={{
							maxSubscribe: item.maxSubscribes,
							subscribes: item.periods.map((p) => p.subscribes).flat(),
						}}
					/>
				</svelte:fragment>
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
				<button type="button" class="btn btn-square btn-ghost btn-sm" on:click={handleClickReturn}>
					<Icon path={mdiArrowLeft} />
				</button>
				<h3 class="title text-lg">{selectedTeam.name}</h3>
			</div>

			<SelectorList
				trigger={dialog}
				items={selectedTeam.periods.filter((p) => p.isAvailable)}
				class="w-full max-h-80 mt-2 overflow-y-auto relative"
				on:select={({ detail }) => onSelect(detail)}
				let:item
			>
				<span>{formatRange(item)}</span>
				<Progress period={item} class="ml-auto" />
			</SelectorList>
			<input type="hidden" name="memberId" value={memberId} />
			<input type="hidden" name="periodId" value={selectedPeriod?.id} />
			<button type="submit" bind:this={submitButton} class="hidden">submit</button>
		</form>
	{/if}
</Dialog>
