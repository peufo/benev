<script lang="ts">
	import { CopyPlusIcon } from '@lucide/svelte'
	import type { Period, Team } from '@prisma/client'
	import { Drawer, InputNumber } from 'fuma'
	import { enhanceForm } from '#lib/enhanceForm.js'
	import { formatDatetime, formatDay, formatRangeHour } from '#lib/formatRange.js'
	import { Placeholder } from '#lib/ui/index.js'
	import { cloneTeamForm } from './team.remote'

	interface Props {
		team: Pick<Team, 'id' | 'name' | 'closeSubscribing'> & {
			periods: Pick<Period, 'id' | 'start' | 'end'>[]
		}
		oncloned?: (clone: Team) => void
	}

	let { team, oncloned }: Props = $props()

	const DAY = 1000 * 60 * 60 * 24
	const remoteForm = $derived(cloneTeamForm.for(team.id))
	let drawer = $state<ReturnType<typeof Drawer>>()
	// Le cas qui motive le bouton: le samedi à partir du vendredi.
	let deltaDays = $state(1)

	const delta = $derived((deltaDays ?? 0) * DAY)
	const periods = $derived(team.periods.toSorted((a, b) => +a.start - +b.start))
	const shift = (date: Date) => date.getTime() + delta
</script>

<button type="button" class="btn btn-sm btn-primary btn-soft" onclick={() => drawer?.open()}>
	<CopyPlusIcon size={20} />
	<span>Dupliquer</span>
</button>

<Drawer
	bind:this={drawer}
	key="form_team_clone"
	title="Dupliquer « {team.name} »"
	maxWidth="26em"
	class="surface-drawer"
	classBody="flex flex-col"
>
	{#snippet children({ close })}
		<form
			{...remoteForm.enhance(
				enhanceForm({
					success: 'Secteur dupliqué',
					onsuccess: async () => {
						const clone = remoteForm.result
						await close()
						if (clone) oncloned?.(clone)
					},
				})
			)}
			class="flex grow flex-col gap-4"
		>
			<p class="text-sm text-base-content/70">
				La copie reprend les créneaux et les responsables, sans les inscriptions.
			</p>

			<!-- La valeur liée pilote l'aperçu, le champ caché la soumet. -->
			<InputNumber label="Décalage des dates, en jours" bind:value={deltaDays} variant="block" />
			<input {...remoteForm.fields.deltaDays.as('hidden', deltaDays ?? 0)} />

			<!-- Avec le jour de la semaine, que le décalage déplace; l'heure, elle, ne bouge pas. -->
			{#if team.closeSubscribing || periods.length}
				<ul class="flex flex-col">
					{#if team.closeSubscribing}
						<li class="flex items-center justify-between gap-3 py-1.5">
							<span class="text-sm">Fin des inscriptions</span>
							<span class="flex flex-col items-end text-xs text-right">
								<span class="opacity-50 line-through">
									{formatDatetime(team.closeSubscribing)}
								</span>
								<span class="text-base-content/70">
									{formatDatetime(shift(team.closeSubscribing))}
								</span>
							</span>
						</li>
					{/if}
					{#each periods as period (period.id)}
						<li
							class="flex items-center justify-between gap-3 py-1.5 not-first:border-t border-soft"
						>
							<span class="text-sm tabular-nums">{formatRangeHour(period)}</span>
							<span class="flex flex-col items-end text-xs text-right">
								<span class="opacity-50 line-through">{formatDay(period.start)}</span>
								<span class="text-base-content/70">{formatDay(shift(period.start))}</span>
							</span>
						</li>
					{/each}
				</ul>
			{/if}
			{#if !periods.length}
				<Placeholder>Aucun créneau</Placeholder>
			{/if}

			<!-- Fond opaque: la liste des créneaux défile dessous. -->
			<div
				class="sticky bottom-0 mt-auto flex flex-row-reverse border-t border-soft bg-base-100 py-4"
			>
				<button class="btn btn-primary">
					<CopyPlusIcon size={20} />
					Dupliquer le secteur
				</button>
			</div>
		</form>
	{/snippet}
</Drawer>
