<script lang="ts">
	import { PencilIcon } from '@lucide/svelte'
	import { MEMBER_FIELD_TYPE } from '$lib/constant'
	import type { Field } from '@prisma/client'
	import { tip, urlParam } from 'fuma'

	interface Props {
		field: Field
		updateLink?: boolean
	}

	let { field, updateLink = false }: Props = $props()
	const FieldIcon = $derived(MEMBER_FIELD_TYPE[field.type].icon)
</script>

<div class="flex gap-2 items-center">
	<FieldIcon class="opacity-70" />
	<span>
		{field.name}
	</span>
	{#if updateLink}
		<a href={urlParam.with({ form_field: field.id })} class="btn btn-square btn-sm ml-auto">
			<span class="inline-flex" use:tip={{ content: 'Éditer le champ' }}><PencilIcon /></span>
		</a>
	{/if}
</div>
