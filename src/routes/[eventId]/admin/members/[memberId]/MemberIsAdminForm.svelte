<script lang="ts">
	import type { PageData } from './$types'
	import { enhanceForm } from '$lib/enhanceForm'
	import { rolesMap } from '$lib/member/MemberRole.svelte'
	import { setMemberIsAdmin } from '$lib/member/memberAdmin.remote'

	interface Props {
		memberProfile: PageData['memberProfile']
		onsuccess?: () => void
	}

	let { memberProfile, onsuccess }: Props = $props()
	let isAdmin = $derived(memberProfile.roles.includes('admin'))
	const TargetRoleIcon = $derived(rolesMap[isAdmin ? 'member' : 'admin'].icon)
</script>

<form {...setMemberIsAdmin.enhance(enhanceForm({ onsuccess }))} class="contents">
	<!-- `as('hidden', bool)` prefixe le `name` de `b:`, que SvelteKit relit en booléen. -->
	<input {...setMemberIsAdmin.fields.isAdmin.as('hidden', !isAdmin)} />
	<button class="menu-item w-full">
		<TargetRoleIcon size={20} />
		<span>{isAdmin ? 'Retirer' : 'Attribuer'} le rôle d'administrateur·ice</span>
	</button>
</form>
