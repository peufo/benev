<script lang="ts">
	import type { MemberRole } from '$lib/server/permission'
	import { Icon } from '$lib/material'
	import {
		mdiShieldAccountOutline,
		mdiAccountCircleOutline,
		mdiCrownOutline,
		mdiStarOutline,
	} from '@mdi/js'

	export let role: MemberRole

	const roles: Record<MemberRole, { icon: string; label: string }> = {
		owner: { label: 'Propriétaire', icon: mdiCrownOutline },
		admin: { label: 'Administrateur', icon: mdiStarOutline },
		leader: { label: 'Responsable', icon: mdiShieldAccountOutline },
		member: { label: 'Membre', icon: mdiAccountCircleOutline },
	}
</script>

<div class="badge badge-ghost badge-lg">
	<Icon path={roles[role].icon} class="opacity-80 -translate-x-1" size={22} />
	<span>{roles[role].label}</span>
</div>
