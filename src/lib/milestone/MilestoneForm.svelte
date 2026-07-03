<script lang="ts">
	import { modelMilestoneCreate } from '$lib/models'
	import { eventPath } from '$lib/store'
	import { daytz } from '$lib/dayjs'
	import type { Milestone } from '@prisma/client'
	import { Form, InputText } from 'fuma'
	import type { ComponentType } from 'svelte'
	import InputTzDateTime from './InputTzDateTime.svelte'

	export let milestone: Partial<Milestone> = {}

	const MilestoneForm: ComponentType<Form<typeof modelMilestoneCreate, Milestone>> = Form
</script>

<MilestoneForm
	action="{$eventPath}?/milestone"
	model={modelMilestoneCreate}
	data={milestone}
	on:created
	on:updated
	on:deleted
	on:success
>
	<InputText
		key="name"
		label="Nom"
		value={milestone.name}
		input={{ autocomplete: 'off', autofocus: true }}
	/>
	<InputTzDateTime key="timestamp" label="Date" value={daytz(milestone.timestamp)} />
</MilestoneForm>
