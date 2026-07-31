<script lang="ts">
	import { tip } from 'fuma'
	import { CheckIcon, CircleHelpIcon, ListTodoIcon } from '@lucide/svelte'
	import { rolesMap } from '$lib/member/MemberRole.svelte'

	type Permission = boolean | string | undefined

	const permissions: [string, [Permission, Permission, Permission, Permission]][] = [
		['Nommer des administrateurs', [true, false, false, false]],
		["Supprimer l'évènement", [true, false, false, false]],
		["Configurer l'évènement", [true, true, false, false]],
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
		['Supprimer un membre', [true, true, 'Lui-même', 'Lui-même']],
		[
			'Modifier les profils de membres',
			[true, true, true, 'Son propre profil ( sauf les champs en lecture seul )'],
		],
		['Inviter un nouveau membre', [true, true, true, false]],
		['Accèder à la liste des membres et des inscriptions', [true, true, true, false]],
		['Accèder à la planification', [true, true, true, false]],
		["S'inscrire à une période", [true, true, true, undefined]],
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
	const {
		owner: { icon: OwnerIcon },
		admin: { icon: AdminIcon },
		leader: { icon: LeaderIcon },
		member: { icon: MemberIcon },
	} = rolesMap
</script>

<h3>Les rôles au sein de l'évènement</h3>

<section>
	<h4 class="flex gap-2">
		<OwnerIcon class="opacity-70" />
		Propriétaire
	</h4>
	<p>C'est le créateur de l’évènement.</p>
</section>

<section>
	<h4 class="flex gap-2">
		<AdminIcon class="opacity-70" />
		Administrateur
	</h4>
	<p>Nommé par le propriétaire, il hérite pratiquement de tous les droits de celui-ci.</p>
</section>

<section>
	<h4 class="flex gap-2">
		<LeaderIcon class="opacity-70" />
		Responsable de secteur
	</h4>
	<p>
		Nommé par un administrateur ou par le propriétaire, il peut gérer tout ce qui se rapporte à son
		secteur.
	</p>
</section>

<section>
	<h4 class="flex gap-2">
		<MemberIcon class="opacity-70" />
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
			{#each Object.values(rolesMap).slice(1) as { icon: RoleIcon, label } (label)}
				<th>
					<span class="inline-flex" use:tip={{ content: label }}>
						<RoleIcon class="opacity-70" />
					</span>
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each permissions as [name, values] (name)}
			<tr>
				<td class="align-middle">
					{name}
				</td>
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
