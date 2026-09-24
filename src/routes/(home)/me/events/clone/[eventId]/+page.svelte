<script lang="ts">
	import { resolve } from '$app/paths'
	import {
		ArrowLeftIcon,
		FileTextIcon,
		MapPinnedIcon,
		TableIcon,
		TextCursorInputIcon,
	} from '@lucide/svelte'
	import { InputNumber } from 'fuma'
	import { MEMBER_FIELD_TYPE, PAGE_TYPE } from '$lib/constant'
	import CloneSelector from './CloneSelector.svelte'
	import LabelTeam from './LabelTeam.svelte'
	import { cloneEvent } from './clone.remote'

	let { data } = $props()

	let deltaDays = $state(365)
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-start gap-3">
		<a href={resolve('/me/events')} class="btn btn-ghost btn-square btn-sm mt-0.5">
			<ArrowLeftIcon />
		</a>
		<div>
			<h1 class="text-2xl font-bold text-base-content">Cloner « {data.event.name} »</h1>
			<p class="text-base-content/70">
				Le nouvel évènement reprend les réglages de celui-ci. Choisis ce que tu emportes en plus.
			</p>
		</div>
	</div>

	<form {...cloneEvent} class="flex flex-col gap-6">
		<CloneSelector
			items={data.event.teams}
			key="teams"
			title="Secteurs"
			icon={MapPinnedIcon}
			subtitle="Avec leurs créneaux, décalés du nombre de jours choisi. Sans les inscriptions."
			labelAll="Tous les secteurs"
			placeholder="Aucun secteur"
			getLabel={(team) => team.name}
		>
			{#snippet append(team)}
				<LabelTeam {team} {deltaDays} />
			{/snippet}

			<!-- `InputProps` exclut `name`: la valeur liée pilote l'aperçu des dates, le champ caché
			     la soumet. -->
			<InputNumber label="Décalage des dates, en jours" bind:value={deltaDays} class="max-w-xs" />
			<input type="hidden" name="deltaDays" value={deltaDays} />
		</CloneSelector>

		<CloneSelector
			items={data.event.pages}
			key="pages"
			title="Publications"
			icon={FileTextIcon}
			labelAll="Toutes les publications"
			placeholder="Aucune publication"
			getLabel={(page) => page.title}
		>
			{#snippet append(page)}
				{@const PageIcon = PAGE_TYPE[page.type].icon}
				<PageIcon size={18} class="shrink-0 opacity-70" />
			{/snippet}
		</CloneSelector>

		<CloneSelector
			items={data.event.memberFields}
			key="fields"
			title="Champs de membres"
			icon={TextCursorInputIcon}
			labelAll="Tous les champs de membres"
			placeholder="Aucun champ"
			getLabel={(field) => field.name}
		>
			{#snippet append(field)}
				{@const FieldIcon = MEMBER_FIELD_TYPE[field.type].icon}
				<FieldIcon size={18} class="shrink-0 opacity-70" />
			{/snippet}
		</CloneSelector>

		<CloneSelector
			items={data.event.views}
			key="views"
			title="Vues"
			icon={TableIcon}
			labelAll="Toutes les vues"
			placeholder="Aucune vue"
			getLabel={(view) => view.name}
		>
			{#snippet append(view)}
				<span class="text-xs opacity-70">{view.key}</span>
			{/snippet}
		</CloneSelector>

		<div class="flex flex-row-reverse border-t border-soft pt-4">
			<button class="btn btn-primary">Cloner l'évènement</button>
		</div>
	</form>
</div>
