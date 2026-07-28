<script lang="ts">
	import { Drawer } from '$lib/fuma'
	import { MilestoneForm } from '$lib/milestone'
	import type { Milestone } from '@prisma/client'

	interface Props {
		milestone?: Partial<Milestone> | null
	}

	let { milestone = null }: Props = $props()
</script>

<Drawer
	key="form_milestone"
	title="{milestone?.id ? 'Modifier le' : 'Nouveau'} jalon"
	maxWidth="400px"
>
	{#snippet children({ close })}
		<MilestoneForm
			milestone={milestone || {}}
			on:created={() => close({ replaceState: true })}
			on:updated={() => close()}
			on:deleted={() => close()}
		/>
	{/snippet}
</Drawer>
