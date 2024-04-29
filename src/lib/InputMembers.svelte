<script lang="ts">
	import type { Member, User } from '@prisma/client'
	import { Icon, InputRelations } from 'fuma'
	import { api } from '$lib/api'
	import { mdiAccountPlusOutline } from '@mdi/js'

	export let key: string
	export let label = ''

	export let value: (Member & { user: User })[] | undefined = undefined
	export let inviteDialog: HTMLDialogElement
</script>

<InputRelations {key} {label} placeholder="Chercher un membre" search={$api.member.search} {value}>
	<span slot="item" let:item>
		{item.user.firstName}
		{item.user.lastName}
	</span>

	<div slot="suggestion" let:item class="contents items-end">
		<span>{item.user.firstName} {item.user.lastName}</span>
		<div class="grow" />
		<span style="font-size: 0.6rem;">{item.user.email}</span>
	</div>

	<div slot="append">
		<button type="button" class="btn btn-square" on:click={() => inviteDialog.showModal()}>
			<Icon path={mdiAccountPlusOutline} title="Inviter un nouveau membre" />
		</button>
	</div>
</InputRelations>
