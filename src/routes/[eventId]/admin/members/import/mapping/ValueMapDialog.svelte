<script lang="ts">
	import { ArrowRightIcon } from '@lucide/svelte'
	import { onMount } from 'svelte'
	import { Dialog, InputSelect, parseOptions } from 'fuma'
	import {
		distinctValues,
		matchOption,
		replaceValues,
		type ImportField,
	} from '#lib/member/import/index.js'

	interface Props {
		columnName: string
		column: number
		rows: string[][]
		field: ImportField
		onclose: () => void
	}

	let { columnName, column, rows, field, onclose }: Props = $props()

	let dialog: HTMLDialogElement = $state()!

	// Monté le temps d'une correspondance: le parent le retire à la fermeture.
	onMount(() => dialog.showModal())

	const multiple = $derived(field.type === 'multiselect')
	const options = $derived(parseOptions(field.options ?? []).map((option) => option.value))
	const values = $derived(distinctValues(rows, column, multiple))

	type Item = { value: string; label: string }
	const KEEP: Item = { value: '', label: 'Garder telle quelle' }
	const items = $derived([KEEP, ...options.map((value) => ({ value, label: value }))])

	// Proposé d'office: l'option reconnue, ou rien. Une valeur qui est déjà une option se garde.
	let choices: Record<string, string> = $state({})
	onMount(() => {
		for (const { value } of values) {
			const match = matchOption(value, options)
			if (match && match !== value) choices[value] = match
		}
	})

	const isOption = (value: string) => options.includes(value)

	function apply() {
		const map = Object.fromEntries(Object.entries(choices).filter(([, choice]) => !!choice))
		replaceValues(rows, column, map, multiple)
		dialog.close()
	}
</script>

<Dialog bind:dialog onClose={onclose} class="max-w-xl">
	{#snippet header()}
		<h2 class="title">Correspondance des valeurs</h2>
		<p class="text-sm text-base-content/70">
			Colonne « {columnName} » vers le champ « {field.name} »
		</p>
	{/snippet}

	<ul class="flex flex-col gap-1 p-4">
		{#each values as { value, count } (value)}
			{@const unresolved = !choices[value] && !isOption(value)}
			<li
				class={[
					'grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-field px-2 py-1',
					unresolved && 'bg-error/10',
				]}
			>
				<span class="truncate">
					{value}
					<span class="text-xs text-base-content/60">× {count}</span>
				</span>
				<ArrowRightIcon size={16} class="opacity-50" />
				<InputSelect
					{items}
					bind:value={
						() => items.find((item) => item.value === (choices[value] ?? '')),
						(item) => (choices[value] = item?.value ?? '')
					}
					class="input-sm"
				>
					{#snippet selected(item)}
						<span class={[!item.value && 'text-base-content/60']}>{item.label}</span>
					{/snippet}
					{#snippet proposal(item)}
						<span class={[!item.value && 'text-base-content/60']}>{item.label}</span>
					{/snippet}
				</InputSelect>
			</li>
		{/each}
	</ul>

	<div class="flex justify-end gap-2 border-t border-hard p-4">
		<button type="button" class="btn btn-ghost" onclick={() => dialog.close()}>Annuler</button>
		<button type="button" class="btn btn-primary" onclick={apply}>Appliquer</button>
	</div>
</Dialog>
