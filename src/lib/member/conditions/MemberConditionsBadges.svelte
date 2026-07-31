<script lang="ts">
	import { IdCardIcon, PersonStandingIcon, UserCheckIcon } from '@lucide/svelte'
	import type { Field } from '@prisma/client'

	import type { MemberCondition } from '$lib/models'
	import { CONDITION_OPERATOR_LABEL } from './constants'

	interface Props {
		conditions?: MemberCondition[]
		memberFields: Field[]
		class?: string
	}

	let { conditions = [], memberFields, class: klass = '' }: Props = $props()
</script>

{#each conditions as condition, i (i)}
	<div class="badge flex gap-1 {klass}">
		{#if condition.type === 'valided'}
			<UserCheckIcon class="opacity-70" size={16} />
			<span>Membre approuvé</span>
		{:else if condition.type === 'age'}
			<PersonStandingIcon class="opacity-70" size={16} />
			<span>Âge minimum: {condition.args} ans</span>
		{:else}
			<IdCardIcon class="opacity-70" size={16} />
			{@const field = memberFields.find(
				(f) => condition.type === 'profile' && f.id === condition.args.fieldId
			)}
			<span>{field?.name}</span>
			<span>{CONDITION_OPERATOR_LABEL[condition.args.operator].toLocaleLowerCase()}</span>
			<span>{condition.args.expectedValue}</span>
		{/if}
	</div>
{/each}
