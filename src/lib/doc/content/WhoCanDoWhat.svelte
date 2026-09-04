<script lang="ts">
	import { tip } from 'fuma'
	import { CheckIcon, CircleHelpIcon, ListTodoIcon } from '@lucide/svelte'
	import { rolesMap } from '$lib/member/MemberRole.svelte'
	import { PERMISSION_ROLES, PERMISSIONS } from './permissions'
</script>

<!-- Cinq colonnes et des libellés longs: la table défile chez elle plutôt que de pousser la page. -->
<div class="not-prose overflow-x-auto">
	<table class="table table-pin-rows">
		<thead>
			<tr>
				<th class="align-middle">Qui peut faire quoi ?</th>
				{#each PERMISSION_ROLES as role (role)}
					{@const { icon: RoleIcon, label } = rolesMap[role]}
					<th>
						<span class="inline-flex" use:tip={{ content: label }}>
							<RoleIcon class="opacity-70" />
						</span>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each PERMISSIONS as { label, values } (label)}
				<tr>
					<td class="align-middle">{label}</td>
					{#each values as value, i (i)}
						{#if value === true}
							<td><CheckIcon class="text-success" /></td>
						{:else if value === false}
							<td></td>
						{:else if value === undefined}
							<td>
								<span class="inline-flex" use:tip={{ content: 'Paramétrable' }}>
									<CircleHelpIcon class="text-warning" />
								</span>
							</td>
						{:else}
							<td>
								<span class="inline-flex" use:tip={{ content: value }}>
									<ListTodoIcon class="text-info" />
								</span>
							</td>
						{/if}
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
