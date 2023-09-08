<script lang="ts">
	import { Member, User } from '@prisma/client'
	import { Icon, InputRelations } from '$lib/material'
	import { api } from '$lib/api'
	import { mdiAccountPlusOutline } from '@mdi/js'

	export let key: string
	export let label = ''

	export let value: (Member & { user: User })[] | undefined = undefined
	export let inviteDialog: HTMLDialogElement
</script>

<InputRelations
	{key}
	{label}
	placeholder="Chercher un membre"
	getItems={$api.member.findMany}
	search={$api.member.search}
	{value}
>
	<!-- Good type -->
	<span slot="badge" let:item>
		{item.user.firstName}
		{item.user.lastName}
	</span>

	<!-- Bad type (any) -->
	<div slot="listItem" let:item class="flex w-full">
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
