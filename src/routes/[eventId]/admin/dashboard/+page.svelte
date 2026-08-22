<script lang="ts">
	import { ClipboardCheckIcon, ExternalLinkIcon, UsersIcon } from '@lucide/svelte'
	import { tip } from 'fuma'
	import Section from '$lib/ui/Section.svelte'
	import { InputOptionInParam } from '$lib/ui'
	import { Journal } from '$lib/log'
	import { eventPath } from '$lib/store'
	import DashboardMembers from './DashboardMembers.svelte'
	import DashboardValidations from './DashboardValidations.svelte'
	import { WAITING, waitingOf } from './waiting'

	let { data } = $props()

	// Le compte tient dans le libellé: le bouton du camp qu'on ne regarde pas annonce ce qu'il
	// cache, sinon il faut cliquer pour savoir s'il y a quelque chose.
	let waitingOptions = $derived(
		Object.fromEntries(WAITING.map(({ key, label }) => [key, `${label} (${data.nbWaiting[key]})`]))
	)

	// La table des inscriptions filtrée sur ce que la section montre: le bouton mène à la suite
	// de la même liste, pas à tout l'évènement.
	let waitingTableHref = $derived(
		`${$eventPath}/admin/subscribes?states=${JSON.stringify(['request'])}` +
			(data.waiting ? `&createdBy=${waitingOf(data.waiting).createdBy}` : '')
	)
</script>

<div class={['gap-3', data.journal ? 'lg:grid lg:grid-cols-2 max-lg:flex' : 'flex', 'flex-col']}>
	<div class="flex flex-col gap-3">
		<Section
			id="members"
			title="Derniers adhérents"
			icon={UsersIcon}
			subtitle="{data.nbMembers} adhérent{data.nbMembers > 1 ? 's' : ''} à ce jour"
			class="border-soft"
		>
			{#snippet action()}
				<a
					href="{$eventPath}/admin/members"
					class="btn btn-square btn-sm"
					use:tip={{ content: 'Ouvrir la table des membres' }}
				>
					<ExternalLinkIcon size={20} opacity={0.7} />
				</a>
			{/snippet}
			<DashboardMembers members={data.lastMembers} />
		</Section>

		<Section
			id="validations"
			title="Inscriptions en attente"
			icon={ClipboardCheckIcon}
			subtitle={data.maxSubscribes
				? `${data.nbSubscribes} inscription${data.nbSubscribes > 1 ? 's' : ''} sur les ${data.maxSubscribes} attendues`
				: 'Aucune place ouverte par les périodes'}
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
	</div>

	{#if data.journal}
		<Journal journal={data.journal} title={data.event?.name} timezone={data.event?.timezone} />
	{/if}
</div>
