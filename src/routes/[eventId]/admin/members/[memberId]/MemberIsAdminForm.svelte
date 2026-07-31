<script lang="ts">
	import type { PageData } from './$types'
	import { rolesMap } from '$lib/member/MemberRole.svelte'
	import { setMemberIsAdmin } from '$lib/member/memberAdmin.remote'

	interface Props {
		memberProfile: PageData['memberProfile']
	}

	let { memberProfile }: Props = $props()
	let isAdmin = $derived(memberProfile.roles.includes('admin'))
	const TargetRoleIcon = $derived(rolesMap[isAdmin ? 'member' : 'admin'].icon)
</script>

<form {...setMemberIsAdmin} class="contents">
	<!-- `as('hidden', bool)` prefixe le `name` de `b:`, que SvelteKit relit en booléen. -->
	<input {...setMemberIsAdmin.fields.isAdmin.as('hidden', !isAdmin)} />
	<button class="menu-item">
		<TargetRoleIcon size={20} />
		<span>{isAdmin ? 'Retirer' : 'Attribuer'} le rôle d'administrateur</span>
	</button>
</form>
