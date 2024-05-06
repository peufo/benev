<script lang="ts">
	import type { Team, Member, User, Event, Field } from '@prisma/client'

	import { page } from '$app/stores'

	import { InputText, InputTextarea, InputDate, Form } from 'fuma'
	import { eventPath } from '$lib/store'

	import { MemberConditions } from '$lib/member'
	import InputLeaders from '$lib/team/InputLeaders.svelte'

	let klass = ''
	export { klass as class }
	export let event: Event & { memberFields: Field[] }
	export let team: (Team & { leaders: (Member & { user: User })[] }) | undefined = undefined
</script>

<Form data={team} class={klass} action="{$eventPath}/teams?/team" on:success>
	<InputText
		key="name"
		label="Nom du secteur"
		class="mt-6"
		value={team?.name}
		input={{ autofocus: true }}
	/>

	{#if $page.data.member?.roles.includes('admin')}
		<InputLeaders value={team?.leaders} />
	{/if}
	<InputTextarea key="description" label="Description" value={team?.description || ''} />

	{#if event.selfSubscribeAllowed}
		<InputDate
			key="closeSubscribing"
			label="Fin des inscriptions"
			value={team?.closeSubscribing}
			hint={event.closeSubscribing && !team?.closeSubscribing
				? `Par défaut: ${event.closeSubscribing.toLocaleDateString()}`
				: ''}
		/>
	{/if}

	<MemberConditions conditions={team?.conditions || []} memberFields={event.memberFields} />
</Form>
