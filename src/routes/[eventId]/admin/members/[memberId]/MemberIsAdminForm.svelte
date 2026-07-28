<script lang="ts">
	import type { PageData } from './$types'
	import { useForm } from '$lib/fuma'
	import { rolesMap } from '$lib/member/MemberRole.svelte'
	import { Icon, USE_COERCE_BOOLEAN } from '$lib/fuma'

	interface Props {
		memberProfile: PageData['memberProfile'];
	}

	let { memberProfile }: Props = $props();
	let isAdmin = $derived(memberProfile.roles.includes('admin'))
	const { enhance } = useForm()
</script>

<form action="?/set_isAdmin" method="post" use:enhance class="contents">
	<input type="hidden" name="isAdmin" value="{USE_COERCE_BOOLEAN}{!isAdmin}" />
	<button class="menu-item">
		<Icon path={rolesMap[isAdmin ? 'member' : 'admin'].icon} size={20} />
		<span>{isAdmin ? 'Retirer' : 'Attribuer'} le rôle d'administrateur</span>
	</button>
</form>
