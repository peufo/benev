<script lang="ts">
	import { MEMBER_FIELD_TYPE } from '$lib/constant'
	import type { Field } from '@prisma/client'

	interface Props {
		field: Field
	}

	let { field }: Props = $props()
	const FieldIcon = $derived(MEMBER_FIELD_TYPE[field.type].icon)
</script>

<div class="flex gap-2">
	<FieldIcon class="ml-auto" />
	<span>{field.name}</span>
</div>
