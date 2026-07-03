<script lang="ts">
	import { Drawer } from 'fuma'
	import { MilestoneForm } from '$lib/milestone'
	import type { Milestone } from '@prisma/client'

	export let milestone: Partial<Milestone> | null = null
</script>

<Drawer
	key="form_milestone"
	title="{milestone?.id ? 'Modifier le' : 'Nouveau'} jalon"
	maxWidth="400px"
	let:close
>
	<MilestoneForm
		milestone={milestone || {}}
		on:created={() => close({ replaceState: true })}
		on:updated={() => close()}
		on:deleted={() => close()}
	/>
</Drawer>
