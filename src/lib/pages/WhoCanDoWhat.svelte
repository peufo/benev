<script lang="ts">
	import { rolesMap } from '$lib/MemberRole.svelte'
	import { Icon } from '$lib/material'
	import { mdiCheck, mdiChevronRight, mdiListStatus } from '@mdi/js'
	import { slide } from 'svelte/transition'

	type Permission = boolean | string

	let matrixOpen = false

	const permissions: [string, [Permission, Permission, Permission, Permission]][] = [
		['Nommer des administrateurs', [true, false, false, false]],
		["Supprimer l'événement", [true, false, false, false]],
		["Configurer l'événement", [true, true, false, false]],
		['Modifier les pages', [true, true, false, false]],
		['Créer et supprimer les secteurs', [true, true, false, false]],
		['Nommer des responsables de secteurs', [true, true, false, false]],
		[
			'Modifier les secteurs (nom, description, etc...)',
			[true, true, 'Seulement ses secteurs', false],
		],
		['Gérer les périodes', [true, true, 'Seulement les périodes de ses secteurs', false]],
		[
			'Inscrire un membre à une période',
			[true, true, 'Seulement les périodes de ses secteurs', false],
		],
		[
			'Modifier les profils de membres',
			[
				true,
				true,
				'Profils des membres inscrits à ses secteurs',
				'Son propre profil ( sauf les champs en lecture seul )',
			],
		],
		['Supprimer un membre', [true, true, 'Lui-même', 'Lui-même']],
		['Inviter un nouveau membre', [true, true, true, false]],
		['Accèder à la liste des membres et des inscriptions', [true, true, true, false]],
		['Accèder à la planification', [true, true, true, false]],
		["S'inscrire à une période", [true, true, true, true]],
		[
			'Annuler une inscription',
			[
				'Si initiée par un responsable',
				'Si initiée par un responsable',
				'Si initiée par un responsable',
				'Si initiée par lui-même',
			],
		],
		[
			'Confirmer ou décliner une inscription',
			[
				'Si initiée par le membre',
				'Si initiée par le membre',
				'Si initiée par le membre',
				'Si initiée par un responsable',
			],
		],
	]
</script>

<h3>Les rôles au sein de l'évènement</h3>

<section>
	<h4 class="flex gap-2">
		<Icon path={rolesMap.owner.icon} class="opacity-70" />
		Propriétaire
	</h4>
	<p>C'est le créateur de l’évènement.</p>
</section>

<section>
	<h4 class="flex gap-2">
		<Icon path={rolesMap.admin.icon} class="opacity-70" />
		Administrateur
	</h4>
	<p>Nommé par le propriétaire, il hérite pratiquement de tous les droits de celui-ci.</p>
</section>

<section>
	<h4 class="flex gap-2">
		<Icon path={rolesMap.leader.icon} class="opacity-70" />
		Responsable de secteur
	</h4>
	<p>
		Nommé par un administrateur ou par le propriétaire, il peut gérer tout ce qui se rapporte à son
		secteur.
	</p>
</section>

<section>
	<h4 class="flex gap-2">
		<Icon path={rolesMap.member.icon} class="opacity-70" />
		Membre
	</h4>
	<p>
		Quiconque souhaitant s’inscrire à une période de travail, il peut suivre et modifier ses
		inscriptions.
	</p>
</section>

<table class="table table-pin-rows">
	<thead>
		<tr>
			<th class="align-middle">Qui peut faire quoi ?</th>
			{#each Object.values(rolesMap) as { icon, label }}
				<th>
					<Icon path={icon} title={label} class="opacity-70" />
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each permissions as [name, values]}
			<tr>
				<td class="align-middle">
					{name}
				</td>
				{#each values as value}
					{#if value === true}
						<td><Icon path={mdiCheck} class="fill-success" /></td>
					{:else if value === false}
						<td />
					{:else}
						<td>
							<Icon path={mdiListStatus} class="fill-info" title={value} />
						</td>
					{/if}
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
