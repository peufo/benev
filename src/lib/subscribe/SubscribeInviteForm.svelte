<script lang="ts">
	import { UserPlusIcon } from '@lucide/svelte'
	import type { Member } from '@prisma/client'
	import { InputSelect, tip, urlParam } from 'fuma'
	import { searchMembers } from '$lib/member/member.remote'
	import { useNotify } from '$lib/notify'
	import { createSubscribe } from './subscribe.remote'

	interface Props {
		periodId: string
		class?: string
		member?: Member | undefined
		/** Remplacent les évènements de la version Svelte 4. */
		onsuccess?: () => void
	}

	let { periodId, class: klass = '', member = $bindable(undefined), onsuccess }: Props = $props()

	const notify = useNotify()
</script>

<!-- `InputSelect` ne sert qu'à choisir le membre: la valeur soumise est le champ caché. -->
<form
	{...createSubscribe.enhance(async ({ submit }) => {
		await submit()
		notify.success('Inscription créée')
		member = undefined
		onsuccess?.()
	})}
	class="{klass} flex gap-2 justify-end grow w-full"
>
	<input type="hidden" name="periodId" value={periodId} />
	<input type="hidden" name="memberId" value={member?.id} />

	<InputSelect
		class="w-full"
		placeholder="Inscrire un membre"
		items={searchMembers}
		bind:value={member}
	>
		{#snippet selected(item)}
			<span>{item.firstName} {item.lastName}</span>
		{/snippet}

		{#snippet proposal(item)}
			<span>{item.firstName} {item.lastName}</span>
			<span class="ml-auto text-xs opacity-70">{item.email}</span>
		{/snippet}

		{#snippet append()}
			<a
				href={urlParam.with({ form_invite: '{}' })}
				class="btn btn-square btn-soft btn-sm"
				data-sveltekit-noscroll
				data-sveltekit-replacestate
				use:tip={{ content: 'Inviter un nouveau membre' }}
			>
				<UserPlusIcon size={20} />
			</a>
		{/snippet}
	</InputSelect>

	{#if member}
		<button class="btn btn-primary"> Inscrire </button>
	{/if}
</form>
