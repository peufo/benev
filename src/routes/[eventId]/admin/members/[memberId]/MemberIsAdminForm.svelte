<script lang="ts">
	import type { PageData } from './$types'
	import { rolesMap } from '$lib/member/MemberRole.svelte'
	import { Icon } from '$lib/fuma-legacy'
	import { setMemberIsAdmin } from '$lib/member/memberAdmin.remote'

	interface Props {
		memberProfile: PageData['memberProfile']
	}

	let { memberProfile }: Props = $props()
	let isAdmin = $derived(memberProfile.roles.includes('admin'))
</script>

<form {...setMemberIsAdmin} class="contents">
	<!-- `as('hidden', bool)` prefixe le `name` de `b:`, que SvelteKit relit en booléen. -->
	<input {...setMemberIsAdmin.fields.isAdmin.as('hidden', !isAdmin)} />
	<button class="menu-item">
		<Icon path={rolesMap[isAdmin ? 'member' : 'admin'].icon} size={20} />
		<span>{isAdmin ? 'Retirer' : 'Attribuer'} le rôle d'administrateur</span>
	</button>
</form>
