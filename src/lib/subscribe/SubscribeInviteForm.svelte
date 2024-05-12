<script lang="ts">
	import { mdiAccountPlusOutline } from '@mdi/js'
	import type { Member, User } from '@prisma/client'
	import type { Props as TippyProps } from 'tippy.js'
	import { createEventDispatcher } from 'svelte'
	import { InputRelation, urlParam } from 'fuma'
	import { useForm } from 'fuma/validation'
	import { enhance } from '$app/forms'
	import { api } from '$lib/api'
	import { eventPath } from '$lib/store'

	export let periodId: string
	export let tippyProps: Partial<TippyProps> = {}
	let klass = ''
	export { klass as class }

	const dispatch = createEventDispatcher<{ success: void }>()

	const form = useForm({
		successMessage: 'Inscription créée',
		onSuccess: () => {
			member = null
			dispatch('success')
		},
	})
	let member: (Member & { user: User }) | null = null
</script>

<form
	method="post"
	action="{$eventPath}/subscribes?/subscribe_create"
	use:enhance={form.submit}
	class="{klass} flex gap-2 justify-end"
>
	<input type="hidden" name="periodId" value={periodId} />
	<input type="hidden" name="memberId" value={member?.id} />

	<InputRelation
		key="member"
		placeholder="Inscrire un membre"
		search={$api.member.search}
		createTitle="Inviter un nouveau membre"
		createUrl={$urlParam.with({ 'form-invite': 1 })}
		createIcon={mdiAccountPlusOutline}
		input={{
			size: 20,
		}}
		bind:value={member}
		on:input
		{tippyProps}
	>
		<div slot="item" class="contents" let:item>
			{item?.user.firstName}
			{item?.user.lastName}
		</div>

		<div slot="suggestion" let:item class="flex gap-2 items-center w-full">
			{#if item}
				<span>{item.user.firstName} {item.user.lastName}</span>
				<div class="grow" />
				<span style="font-size: 0.6rem;">{item.user.email}</span>
			{/if}
		</div>
	</InputRelation>

	{#if member}
		<button class="btn"> Inscrire </button>
	{/if}
</form>
