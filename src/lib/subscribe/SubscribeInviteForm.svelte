<script lang="ts">
	import { UserPlusIcon } from '@lucide/svelte'
	import type { Member } from '@prisma/client'
	import type { Props as TippyProps } from 'tippy.js'
	import { InputRelation } from '$lib/fuma-legacy'
	import { urlParam } from 'fuma'
	import { api } from '$lib/api'
	import { useNotify } from '$lib/notify'
	import { createSubscribe } from './subscribe.remote'

	interface Props {
		periodId: string
		tippyProps?: Partial<TippyProps>
		class?: string
		member?: Member | null
		/** Transféré à InputRelation; remplace `on:input`. */
		oninput?: (value: Member) => void
		/** Remplacent les évènements de la version Svelte 4. */
		onsuccess?: () => void
	}

	let {
		periodId,
		tippyProps = {},
		class: klass = '',
		member = $bindable(null),
		oninput,
		onsuccess,
	}: Props = $props()

	const notify = useNotify()
</script>

<!-- `InputRelation` ne sert qu'à choisir le membre: la valeur soumise est le champ caché.
     Son propre champ, sérialisé en JSON, est écarté par le schéma. -->
<form
	{...createSubscribe.enhance(async ({ submit }) => {
		await submit()
		notify.success('Inscription créée')
		member = null
		onsuccess?.()
	})}
	class="{klass} flex gap-2 justify-end grow w-full"
>
	<input type="hidden" name="periodId" value={periodId} />
	<input type="hidden" name="memberId" value={member?.id} />

	<InputRelation
		key="member"
		placeholder="Inscrire un membre"
		search={$api.member.search}
		createTitle="Inviter un nouveau membre"
		createUrl={urlParam.with({ form_invite: '{}' })}
		createIcon={UserPlusIcon}
		dropdownProps={{ classWrapper: 'w-full' }}
		bind:value={member}
		{oninput}
		{tippyProps}
	>
		{#snippet item({ item })}
			<div class="contents">
				{item?.firstName}
				{item?.lastName}
			</div>
		{/snippet}

		{#snippet suggestion({ item })}
			<div class="flex gap-2 items-center w-full">
				{#if item}
					<span>{item.firstName} {item.lastName}</span>
					<div class="grow"></div>
					<span style="font-size: 0.6rem;">{item.email}</span>
				{/if}
			</div>
		{/snippet}
	</InputRelation>

	{#if member}
		<button class="btn btn-primary"> Inscrire </button>
	{/if}
</form>
