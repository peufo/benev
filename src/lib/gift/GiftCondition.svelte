<script lang="ts">
	import type { GiftCondition } from '@prisma/client'

	export let condition: Partial<GiftCondition>
</script>

<div>
	{condition.type}
</div>
