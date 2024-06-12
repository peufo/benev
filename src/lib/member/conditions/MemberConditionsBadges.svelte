<script lang="ts">
	import type { Field } from '@prisma/client'

	import {
		mdiAccountCheckOutline,
		mdiCardAccountDetailsOutline,
		mdiFilterOutline,
		mdiHumanMaleBoy,
	} from '@mdi/js'
	import type { MemberCondition } from '$lib/models'
	import { CONDITION_OPERATOR_LABEL } from './constants'
	import { Icon } from 'fuma'

	export let conditions: MemberCondition[] = []
	export let memberFields: Field[]
	let klass = ''
	export { klass as class }
</script>

{#each conditions as condition}
	<div class="badge flex gap-1 {klass}">
		{#if condition.type === 'valided'}
			<Icon path={mdiAccountCheckOutline} class="opacity-70" size={16} />
			<span>Membre approuvé</span>
		{:else if condition.type === 'age'}
			<Icon path={mdiHumanMaleBoy} class="opacity-70" size={16} />
			<span>Âge minimum: {condition.args} ans</span>
		{:else}
			<Icon path={mdiCardAccountDetailsOutline} class="opacity-70" size={16} />
			{@const field = memberFields.find(
				(f) => condition.type === 'profile' && f.id === condition.args.fieldId
			)}
			<span>{field?.name}</span>
			<span>{CONDITION_OPERATOR_LABEL[condition.args.operator].toLocaleLowerCase()}</span>
			<span>{condition.args.expectedValue}</span>
		{/if}
	</div>
{/each}
