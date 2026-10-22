<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { UploadIcon, UsersIcon } from '@lucide/svelte'
	import { eventPath } from '#lib/eventPath.js'
	import { plural } from '#lib/utils.js'
	import { Surface } from '#lib/ui/index.js'
	import type { ImportResult } from '#lib/member/memberImport.remote.js'
	import { importSource } from '../importSource.svelte'

	const source = importSource.get()

	// Le rapport ne vit que le temps de la session de navigation: le journal, lui, reste.
	onMount(() => {
		if (!source.report) goto(eventPath('/admin/members'), { replace: true })
	})

	const results = $derived(source.report?.results ?? [])
	const counts = $derived(Object.groupBy(results, ({ status }) => status))
	const invited = $derived(results.filter((result) => result.invited).length)

	// Ce qui demande un geste d'abord: les lignes écartées ou en échec.
	const order: Record<ImportResult['status'], number> = { failed: 0, skipped: 1, imported: 2 }
	const sorted = $derived(
		results.toSorted((a, b) => order[a.status] - order[b.status] || a.line - b.line)
	)

	const STATUS = {
		imported: { label: 'Importé', title: 'Importés', class: 'badge-success' },
		skipped: { label: 'Écarté', title: 'Écartés', class: 'badge-warning' },
		failed: { label: 'Échec', title: 'Échecs', class: 'badge-error' },
	} satisfies Record<ImportResult['status'], { label: string; title: string; class: string }>
</script>

{#if source.report}
	<div class="max-w-3xl mx-auto w-full space-y-3">
		<Surface title="Rapport d'import" subtitle="Depuis « {source.report.source} »">
			<dl class="grid grid-cols-3 gap-2 px-2">
				{#each Object.entries(STATUS) as [status, { title }] (status)}
					<div>
						<dt class="text-sm text-base-content/70">{title}</dt>
						<dd class="text-2xl font-bold">
							{counts[status as ImportResult['status']]?.length ?? 0}
						</dd>
					</div>
				{/each}
			</dl>
			<p class="px-2 pt-3 text-sm text-base-content/70">
				{invited
					? plural(invited, 'invitation envoyée par e-mail', 'invitations envoyées par e-mail')
					: 'Aucune invitation envoyée par e-mail'}
			</p>

			<div class="flex flex-wrap justify-end gap-2 border-t border-soft pt-4 mt-4">
				<a class="btn btn-ghost" href={eventPath('/admin/members/import')}>
					<UploadIcon size={20} class="opacity-70" />
					Importer d'autres membres
				</a>
				<a class="btn btn-primary" href={eventPath('/admin/members')}>
					<UsersIcon size={20} />
					Voir les membres
				</a>
			</div>
		</Surface>

		<Surface title="Détail par ligne">
			<div class="overflow-x-auto">
				<table class="table table-sm">
					<thead>
						<tr>
							<th class="w-0">#</th>
							<th>Membre</th>
							<th>État</th>
						</tr>
					</thead>
					<tbody>
						{#each sorted as result (result.line)}
							<tr>
								<td class="text-base-content/50">{result.line}</td>
								<td>
									{#if result.memberId}
										<a
											class="link link-hover font-medium"
											href={eventPath('/admin/members/[memberId]', { memberId: result.memberId })}
										>
											{result.name}
										</a>
									{:else}
										<span class="font-medium">{result.name || 'Sans nom'}</span>
									{/if}
									{#if result.email}
										<span class="block text-xs text-base-content/70">{result.email}</span>
									{/if}
								</td>
								<td>
									<span class="badge badge-sm badge-soft {STATUS[result.status].class}">
										{STATUS[result.status].label}
									</span>
									{#if result.reason}
										<span class="block text-xs text-base-content/70">{result.reason}</span>
									{:else if result.invited}
										<span class="block text-xs text-base-content/70">Invitation envoyée</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Surface>
	</div>
{/if}
