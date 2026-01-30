<script lang="ts">
	import { MEMBER_FIELD_TYPE } from '$lib/constant'
	import type { Field } from '@prisma/client'
	import { Icon } from 'fuma'

	export let field: Field
</script>

<div class="flex gap-2">
	<Icon path={MEMBER_FIELD_TYPE[field.type].icon} class="opacity-70" />
	<span>
		{field.name}
	</span>
</div>
