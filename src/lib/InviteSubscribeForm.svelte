<script lang="ts">
	import { mdiAccountPlusOutline } from '@mdi/js'
	import { Member, User } from '@prisma/client'
	import type { Props as TippyProps } from 'tippy.js'
	import { createEventDispatcher } from 'svelte'
	import { Dialog, Icon, InputRelation } from '$lib/material'
	import { useForm } from '$lib/form'
	import { enhance } from '$app/forms'
	import InviteForm from '$lib/InviteForm.svelte'
	import { api } from '$lib/api'
	import { eventPath } from '$lib/store'

	export let periodId: string
	export let tippyProps: Partial<TippyProps> = {}

	let newMemberDialog: HTMLDialogElement
	const dispatch = createEventDispatcher<{ success: void }>()

	const form = useForm({
		successMessage: 'Inscription crée',
		successCallback: () => {
			member = null
			dispatch('success')
		},
	})
	let member: (Member & { user: User }) | null = null
</script>

<form
	method="post"
	action="{$eventPath}/subscribes?/new_subscribe"
	use:enhance={form.submit}
	class="flex flex-col gap-2"
>
	<input type="hidden" name="periodId" value={periodId} />

	<div class="flex gap-2 items-end justify-end">
		<div class="grow max-w-sm">
			<InputRelation
				key="memberId"
				placeholder="Inscrire un membre"
				getItem={$api.member.findOne}
				search={$api.member.search}
				bind:item={member}
				on:input
				{tippyProps}
			>
				<div slot="item" class="contents" let:item>
					{item?.user.firstName}
					{item?.user.lastName}
				</div>

				<div slot="listItem" let:item class="flex gap-2 items-center w-full">
					{#if item}
						<span>{item.user.firstName} {item.user.lastName}</span>
						<div class="grow" />
						<span style="font-size: 0.6rem;">{item.user.email}</span>
					{/if}
				</div>

				<div slot="append">
					<button type="button" class="btn btn-square" on:click={() => newMemberDialog.showModal()}>
						<Icon
							path={mdiAccountPlusOutline}
							title="Inviter un nouveau membre"
							tippyProps={{ appendTo: 'parent' }}
						/>
					</button>
				</div>
			</InputRelation>
		</div>

		{#if member}
			<button class="btn"> Inscrire </button>
		{/if}
	</div>
</form>

<Dialog bind:dialog={newMemberDialog}>
	<h2 slot="header" class="card-title">Inviter un nouveau membre</h2>
	<InviteForm
		on:success={({ detail }) => {
			newMemberDialog.close()
			if (detail) member = detail
		}}
	/>
</Dialog>
