<script lang="ts">
	import type { Member, User } from '@prisma/client'
	import { mdiAccountPlusOutline } from '@mdi/js'
	import { InputRelations, urlParam } from 'fuma'
	import { api } from '$lib/api'

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
