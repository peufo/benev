<script lang="ts">
	import type { Member } from '@prisma/client'
	import { mdiAccountPlusOutline } from '@mdi/js'
	import { component, InputRelations, urlParam } from 'fuma'
	import { api } from '$lib/api'
	import MemberLink from './MemberLink.svelte'

	export let value: Member[] | undefined = undefined
</script>

<InputRelations
	key="leaders"
	label="Responsables"
	{value}
	search={$api.member.search}
	slotItem={({ id, firstName, lastName }) => component(MemberLink, { id, firstName, lastName })}
	slotSuggestion={({ firstName, lastName }) => `${firstName} ${lastName}`}
	createTitle="Inviter un nouveau membre"
	createIcon={mdiAccountPlusOutline}
	createUrl={$urlParam.with({ form_invite: '{}' })}
/>
