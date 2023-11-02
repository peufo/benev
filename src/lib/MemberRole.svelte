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
	let klass = ''
	export { klass as class }
	export let mode: 'badge' | 'icon' = 'badge'

	const roles: Record<MemberRole, { icon: string; label: string }> = {
		owner: { label: 'Propriétaire', icon: mdiCrownOutline },
		admin: { label: 'Administrateur', icon: mdiStarOutline },
		leader: { label: 'Responsable', icon: mdiShieldAccountOutline },
		member: { label: 'Membre', icon: mdiAccountCircleOutline },
	}
</script>

{#if mode === 'badge'}
	<div class="badge badge-ghost badge-lg font-normal opacity-80 {klass}">
		<Icon path={roles[role].icon} class="-translate-x-1" size={22} />
		<span>{roles[role].label}</span>
	</div>
{:else if role !== 'member'}
	<Icon
		path={roles[role].icon}
		class="opacity-70"
		size={22}
		title={roles[role].label}
		disableTitlePropagation
	/>
{/if}
