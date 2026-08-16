<script lang="ts">
	import { Drawer } from 'fuma'
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
	class="surface-drawer"
>
	{#snippet children({ close })}
		<MilestoneForm
			milestone={milestone || {}}
			oncreated={() => close({ replaceState: true })}
			onupdated={() => close()}
			ondeleted={() => close()}
		/>
	{/snippet}
</Drawer>
