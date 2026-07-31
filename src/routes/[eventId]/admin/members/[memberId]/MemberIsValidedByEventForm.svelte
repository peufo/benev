<script lang="ts">
	import { BanIcon, CheckIcon } from '@lucide/svelte'
	import type { PageData } from './$types'
	import { setMemberIsValidedByEvent } from '$lib/member/memberAdmin.remote'

	interface Props {
		memberProfile: PageData['memberProfile']
	}

	let { memberProfile }: Props = $props()
	const ValidationIcon = $derived(memberProfile.isValidedByEvent ? BanIcon : CheckIcon)
</script>

<form {...setMemberIsValidedByEvent} class="contents">
	<input
		{...setMemberIsValidedByEvent.fields.isValidedByEvent.as(
			'hidden',
			!memberProfile.isValidedByEvent
		)}
	/>
	<button class="menu-item w-full">
		<ValidationIcon size={21} class="opacity-80" />
		<span>{memberProfile.isValidedByEvent ? 'Désapprouver' : 'Approuver'} la participation</span>
	</button>
</form>
