<script lang="ts">
	import type { Member, User } from '@prisma/client'
	import { InputRelations, urlParam } from 'fuma'
	import { api } from '$lib/api'
	import { mdiAccountPlusOutline } from '@mdi/js'

	export let value: (Member & { user: User })[] | undefined = undefined
</script>

<InputRelations
	key="leaders"
	label="Responsables"
	{value}
	search={$api.member.search}
	slotItem={({ user }) => `${user.firstName} ${user.lastName}`}
	createTitle="Inviter un nouveau membre"
	createIcon="{mdiAccountPlusOutline},"
	createUrl={$urlParam.with({ 'form-invite': 1 })}
/>
