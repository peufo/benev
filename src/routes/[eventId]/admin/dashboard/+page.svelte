<script lang="ts">
	import type { Component } from 'svelte'
	import type { ResolvedPathname } from '$app/types'
	import { resolve } from '$app/paths'
	import {
		ChartGanttIcon,
		ClipboardCheckIcon,
		ExternalLinkIcon,
		MapPinnedIcon,
		UserPlusIcon,
		UsersIcon,
		type IconProps,
	} from '@lucide/svelte'
	import Section from '$lib/ui/Section.svelte'
	import { InputOptionInParam } from '$lib/ui'
	import { Journal } from '$lib/log'
	import { eventPath, withSearch } from '$lib/eventPath'
	import DashboardMembers from './DashboardMembers.svelte'
	import DashboardValidations from './DashboardValidations.svelte'
	import { MEMBERS_VIEWS } from './membersView'
	import { WAITING, waitingOf } from './waiting'
	import { tip, urlParam } from 'fuma'

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
		withSearch(
			eventPath('/admin/members'),
			data.membersView === 'without'
				? `subscribes_count_accepted=${JSON.stringify({ max: 0 })}` +
						`&subscribes_count_request=${JSON.stringify({ max: 0 })}`
				: ''
		)
	)

	// Le compte tient dans le libellé: le bouton du camp qu'on ne regarde pas annonce ce qu'il
	// cache, sinon il faut cliquer pour savoir s'il y a quelque chose.
	let waitingOptions = $derived(
		Object.fromEntries(WAITING.map(({ key, label }) => [key, `${label} (${data.nbWaiting[key]})`]))
	)

	// La table des inscriptions filtrée sur ce que la section montre: le bouton mène à la suite
	// de la même liste, pas à tout l'évènement.
	let waitingTableHref = $derived(
		withSearch(
			eventPath('/admin/subscribes'),
			`states=${JSON.stringify(['request'])}` +
				(data.waiting ? `&createdBy=${waitingOf(data.waiting).createdBy}` : '') +
				(data.isAdmin ? '' : `&teams=${JSON.stringify(data.teams.map(({ id }) => id))}`)
		)
	)
</script>

{#snippet seeAllLink(
	href: ResolvedPathname,
	label: string,
	Icon: Component<IconProps> = ExternalLinkIcon
)}
	<a {href} target="_blank" class="btn btn-sm btn-square" use:tip={{ content: label }}>
		<Icon size={16} />
	</a>
{/snippet}

<div class="flex-col gap-3 overflow-hidden max-lg:flex lg:grid lg:grid-cols-2">
	<div class="flex flex-col gap-3">
		<Section
			id="members"
			title="Membres"
			icon={UsersIcon}
			subtitle="{data.nbMembers} adhérent{plurial(data.nbMembers)} à ce jour"
			class="border-soft"
		>
			{#snippet action()}
				<InputOptionInParam
					key="members"
					defaultValue="last"
					options={membersOptions}
					class="ml-auto"
				/>
				{@render seeAllLink(membersTableHref, 'Voir les membres')}
				<a
					type="button"
					class="btn btn-square btn-sm btn-secondary"
					href={urlParam.with({ form_invite: '{}' })}
					data-sveltekit-noscroll
					data-sveltekit-replacestate
					use:tip={{ content: 'Inviter des membres' }}
				>
					<UserPlusIcon size={20} />
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
				<InputOptionInParam key="waiting" options={waitingOptions} class="ml-auto" />
				{@render seeAllLink(waitingTableHref, 'Voir les inscriptions')}
			{/snippet}
			<DashboardValidations subscribes={data.toValidate} waiting={data.waiting} />
		</Section>

		<Section
			id="teams"
			title="Secteurs"
			icon={MapPinnedIcon}
			subtitle="{data.teams.length} secteur{plurial(data.teams.length)}{data.isAdmin
				? ''
				: ' à votre charge'} · {data.nbPeriods} période{plurial(data.nbPeriods)}"
		>
			{#snippet action()}
				{@render seeAllLink(eventPath('/admin/plan'), 'Voir la planification', ChartGanttIcon)}
				{@render seeAllLink(eventPath('/admin/teams'), 'Voir le liste des secteurs')}
			{/snippet}
		</Section>
	</div>

	<Journal
		journal={data.journal}
		title={data.event?.name}
		timezone={data.event?.timezone}
		class="h-main"
	>
		{#snippet before()}
			<div class="text-sm border border-hard rounded-box p-4 bg-dash mb-10">
				<h4 class="text-lg title-md">Salut 👋</h4>
				<p class="mt-1">
					Bienvenue dans l'espace de gestion de ton évènement. Trois choses pour démarrer :
				</p>

				<ul class="list-disc pl-5 my-3 flex flex-col gap-1">
					<li>
						<a href={eventPath('/admin/teams')} class="link link-hover link-primary">
							Crée tes secteurs
						</a>
						et leurs périodes de travail : c'est là-dessus que tes bénévoles s'inscrivent.
					</li>
					<li>
						<a href={eventPath('/admin/pages')} class="link link-hover link-primary">
							Soigne ta page d'accueil
						</a>, puis rends l'évènement public depuis
						<a href={eventPath('/admin/settings#status')} class="link link-hover link-primary">
							la configuration
						</a>.
					</li>
					<li>
						Ce journal garde la trace de tout ce qui bouge dans l'évènement, et tu peux y ajouter
						tes propres notes.
					</li>
				</ul>

				<p>
					Le reste est détaillé dans
					<a href={eventPath('/help')} class="link link-hover link-primary">l'aide</a>. Une
					question, un pépin ?
					<a href={resolve('/contact')} class="link link-hover link-primary">Écris-nous</a>.
				</p>
			</div>
		{/snippet}
	</Journal>
</div>
