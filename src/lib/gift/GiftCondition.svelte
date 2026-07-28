<script lang="ts">
	import type { GiftCondition } from '@prisma/client'

	interface Props {
		condition: Partial<GiftCondition>
	}

	let { condition }: Props = $props()
</script>

<div>
	{condition.type}
</div>
