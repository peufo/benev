<script lang="ts">
	import { MEMBER_FIELD_TYPE } from '$lib/constant'
	import type { Field } from '@prisma/client'
	import { Icon } from '$lib/fuma-legacy'

	interface Props {
		field: Field
	}

	let { field }: Props = $props()
</script>

<div class="flex gap-2">
	<Icon path={MEMBER_FIELD_TYPE[field.type].icon} class="ml-auto" />
	<span>{field.name}</span>
</div>
