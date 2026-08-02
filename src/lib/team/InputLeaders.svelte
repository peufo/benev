<script lang="ts">
	import { UserPlusIcon } from '@lucide/svelte'
	import type { Member } from '@prisma/client'
	import { component } from '$lib/ui'
	import { InputRelations } from '$lib/fuma-legacy'
	import { urlParam } from 'fuma'
	import { api } from '$lib/api'
	import MemberLink from './MemberLink.svelte'

	interface Props {
		value?: Member[] | undefined
	}

	let { value = $bindable(undefined) }: Props = $props()
</script>

<!-- `InputRelations` ne sert qu'à choisir: les ids partent dans des champs `leaders[]`. -->
{#each value ?? [] as leader (leader.id)}
	<input type="hidden" name="leaders[]" value={leader.id} />
{/each}

<InputRelations
	key="leaders_search"
	label="Responsables"
	bind:value
	search={$api.member.search}
	slotItem={({ id, firstName, lastName }) => component(MemberLink, { id, firstName, lastName })}
	slotSuggestion={({ firstName, lastName }) => `${firstName} ${lastName}`}
	createTitle="Inviter un nouveau membre"
	createIcon={UserPlusIcon}
	createUrl={urlParam.with({ form_invite: '{}' })}
/>
