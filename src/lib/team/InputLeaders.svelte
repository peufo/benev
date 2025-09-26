<script lang="ts">
	import type { Member, User } from '@prisma/client'
	import { mdiAccountPlusOutline } from '@mdi/js'
	import { InputRelations, urlParam } from 'fuma'
	import { api } from '$lib/api'

	export let value: Member[] | undefined = undefined
</script>

<InputRelations
	key="leaders"
	label="Responsables"
	{value}
	search={$api.member.search}
	slotItem={({ firstName, lastName }) => `${firstName} ${lastName}`}
	createTitle="Inviter un nouveau membre"
	createIcon={mdiAccountPlusOutline}
	createUrl={$urlParam.with({ form_invite: '{}' })}
/>
