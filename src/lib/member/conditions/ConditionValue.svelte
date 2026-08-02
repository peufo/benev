<script lang="ts">
	import type { Field } from '@prisma/client'
	import { parseOptions } from 'fuma'
	import type { MemberCondition } from '$lib/models'

	type ProfileCondition = Extract<MemberCondition, { type: 'profile' }>

	interface Props {
		field: Field
		condition: ProfileCondition
	}

	// `condition` est un proxy `$state` du parent: écrire dans `args.expectedValue` suffit.
	// Pas de `bind:` ici, il faudrait rétrécir l'union du modèle au type du champ, ce que
	// les liaisons ne savent pas faire.
	let { field, condition }: Props = $props()

	let asString = $derived(
		typeof condition.args.expectedValue === 'string' ? condition.args.expectedValue : ''
	)
	let asArray = $derived(
		Array.isArray(condition.args.expectedValue) ? condition.args.expectedValue : []
	)

	function toggle(value: string, checked: boolean) {
		condition.args.expectedValue = checked
			? [...asArray, value]
			: asArray.filter((v) => v !== value)
	}
</script>

{#if field.type === 'string' || field.type === 'textarea'}
	<input
		class="input w-full"
		type="text"
		value={asString}
		oninput={({ currentTarget }) => (condition.args.expectedValue = currentTarget.value)}
	/>
{:else if field.type === 'number'}
	<input
		class="input w-full"
		type="number"
		value={typeof condition.args.expectedValue === 'number' ? condition.args.expectedValue : ''}
		oninput={({ currentTarget }) => (condition.args.expectedValue = currentTarget.valueAsNumber)}
	/>
{:else if field.type === 'boolean'}
	<div class="flex gap-4">
		{#each [{ value: 'true', label: 'Oui' }, { value: 'false', label: 'Non' }] as option (option.value)}
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="radio"
					class="radio"
					name="condition_{field.id}"
					checked={asString === option.value}
					onchange={() => (condition.args.expectedValue = option.value)}
				/>
				<span>{option.label}</span>
			</label>
		{/each}
	</div>
{:else}
	<div class="flex gap-4 flex-wrap">
		{#each parseOptions(field.options ?? []) as option (option.value)}
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					class="checkbox"
					checked={asArray.includes(option.value)}
					onchange={({ currentTarget }) => toggle(option.value, currentTarget.checked)}
				/>
				<span>{option.label}</span>
			</label>
		{/each}
	</div>
{/if}
