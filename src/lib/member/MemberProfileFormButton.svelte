<script lang="ts">
	import { page } from '$app/state'
	import { PencilIcon } from '@lucide/svelte'
	import type { MemberWithComputedValues } from '$lib/server'
	import { tip, urlParam } from 'fuma'

	let { member }: { member: MemberWithComputedValues } = $props()
</script>

{#if page.data.member?.roles.includes('leader') || member.event.memberFields.filter((f) => f.memberCanWrite).length}
	<a
		href={urlParam.with({ form_member_profile: JSON.stringify(member.profileJson) })}
		data-sveltekit-replacestate
		data-sveltekit-noscroll
		class="btn btn-square btn-sm btn-secondary"
		use:tip={{ content: `Modifier le profil de ${member.firstName}` }}
	>
		<PencilIcon size={18} />
	</a>
{/if}
