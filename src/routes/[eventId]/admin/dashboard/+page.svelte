<script lang="ts">
	import { ClipboardCheckIcon, ExternalLinkIcon, MapPinnedIcon, UsersIcon } from '@lucide/svelte'
	import { tip } from 'fuma'
	import Section from '$lib/ui/Section.svelte'
	import { InputOptionInParam } from '$lib/ui'
	import { Journal } from '$lib/log'
	import { eventPath } from '$lib/store'
	import DashboardMembers from './DashboardMembers.svelte'
	import DashboardValidations from './DashboardValidations.svelte'
	import DashboardTeams from './DashboardTeams.svelte'
	import { MEMBERS_VIEWS } from './membersView'
	import { WAITING, waitingOf } from './waiting'

	let { data } = $props()

	const plurial = (n: number) => (n > 1 ? 's' : '')

	// Un responsable ne voit que ses secteurs: les chiffres de la page le disent, sinon ils
	// paraissent parler de tout l'évènement.
	let scope = $derived(data.isAdmin ? '' : ' dans vos secteurs')

	// Seul « sans inscription » porte son compte: le nombre d'adhérents est déjà dans le
	// sous-titre, et c'est celui-là qu'il faudrait sinon cliquer pour connaître.
	let membersOptions = $derived(
		Object.fromEntries(
			MEMBERS_VIEWS.map(({ key, label }) => [
				key,
				key === 'without' ? `${label} (${data.nbMembersWithoutSubscribe})` : label,
			])
		)
	)

	// La table des membres filtrée sur ce que la section montre. « Zéro inscription active »
	// s'y dit avec les deux compteurs, dont l'inclusion se limite déjà à ces deux états.
	let membersTableHref = $derived(
		`${$eventPath}/admin/members` +
			(data.membersView === 'without'
				? `?subscribes_count_accepted=${JSON.stringify({ max: 0 })}` +
					`&subscribes_count_request=${JSON.stringify({ max: 0 })}`
				: '')
	)

	// Le compte tient dans le libellé: le bouton du camp qu'on ne regarde pas annonce ce qu'il
	// cache, sinon il faut cliquer pour savoir s'il y a quelque chose.
	let waitingOptions = $derived(
		Object.fromEntries(WAITING.map(({ key, label }) => [key, `${label} (${data.nbWaiting[key]})`]))
	)

	// La table des inscriptions filtrée sur ce que la section montre: le bouton mène à la suite
	// de la même liste, pas à tout l'évènement.
	let waitingTableHref = $derived(
		`${$eventPath}/admin/subscribes?states=${JSON.stringify(['request'])}` +
			(data.waiting ? `&createdBy=${waitingOf(data.waiting).createdBy}` : '') +
			(data.isAdmin ? '' : `&teams=${JSON.stringify(data.teams.map(({ id }) => id))}`)
	)

	let nbPeriods = $derived(data.teams.reduce((acc, team) => acc + team.nbPeriods, 0))
</script>

<div class={['gap-3', data.journal ? 'lg:grid lg:grid-cols-2 max-lg:flex' : 'flex', 'flex-col']}>
	<div class="flex flex-col gap-3">
		<Section
			id="members"
			title={data.membersView === 'without' ? 'Membres sans inscription' : 'Derniers adhérents'}
			icon={UsersIcon}
			subtitle="{data.nbMembers} adhérent{plurial(data.nbMembers)} à ce jour"
			class="border-soft"
		>
			{#snippet action()}
				<InputOptionInParam key="members" defaultValue="last" options={membersOptions} />
				<a
					href={membersTableHref}
					class="btn btn-square btn-sm"
					use:tip={{ content: 'Ouvrir la table des membres' }}
				>
					<ExternalLinkIcon size={20} opacity={0.7} />
				</a>
			{/snippet}
			<DashboardMembers members={data.members} view={data.membersView} />
		</Section>

		<Section
			id="validations"
			title="Inscriptions en attente"
			icon={ClipboardCheckIcon}
			subtitle={data.maxSubscribes
				? `${data.nbSubscribes} inscription${plurial(data.nbSubscribes)} sur les ${data.maxSubscribes} attendues${scope}`
				: `Aucune place ouverte par les périodes${scope}`}
		>
			{#snippet action()}
				<InputOptionInParam key="waiting" options={waitingOptions} />
				<a
					href={waitingTableHref}
					class="btn btn-square btn-sm"
					use:tip={{ content: 'Ouvrir la table des inscriptions' }}
				>
					<ExternalLinkIcon size={20} opacity={0.7} />
				</a>
			{/snippet}
			<DashboardValidations subscribes={data.toValidate} waiting={data.waiting} />
		</Section>

		<Section
			id="teams"
			title="Secteurs"
			icon={MapPinnedIcon}
			subtitle="{data.teams.length} secteur{plurial(data.teams.length)}{data.isAdmin
				? ''
				: ' à votre charge'} · {nbPeriods} période{plurial(nbPeriods)}"
		>
			{#snippet action()}
				<a
					href="{$eventPath}/teams"
					class="btn btn-square btn-sm"
					use:tip={{ content: 'Ouvrir la page des secteurs' }}
				>
					<ExternalLinkIcon size={20} opacity={0.7} />
				</a>
			{/snippet}
			<DashboardTeams teams={data.teams} />
		</Section>
	</div>

	{#if data.journal}
		<Journal journal={data.journal} title={data.event?.name} timezone={data.event?.timezone} />
	{/if}
</div>
