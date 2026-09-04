<script lang="ts">
	import { rolesMap } from '$lib/member/MemberRole.svelte'
	import { ROLE_DESCRIPTIONS } from '$lib/member/roles'
	import { PERMISSION_ROLES } from './permissions'
</script>

{#each PERMISSION_ROLES as role (role)}
	{@const { icon: RoleIcon, label } = rolesMap[role]}
	<section>
		<h4 class="flex gap-2">
			<RoleIcon class="opacity-70" />
			{label}
		</h4>
		<p>{ROLE_DESCRIPTIONS[role]}</p>
	</section>
{/each}
