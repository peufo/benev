<script lang="ts">
	import type { Component } from 'svelte'
	import { MailCheckIcon, MailXIcon, type IconProps } from '@lucide/svelte'
	import type { LogType } from '@prisma/client'
	import type { OptionRecord } from 'fuma'
	import { Pagination, tip } from 'fuma'
	import { InputOptionInParam } from '$lib/ui'
	import dayjs from '$lib/dayjs'
	import type { EmailFailureReason } from '$lib/log'

	let { data } = $props()

	// Seuls les types réellement écrits sont proposés au filtre: `LogType` déclare le vocabulaire
	// à venir, la barre ne montre que ce dont il existe des lignes.
	const typesMap: Partial<OptionRecord<LogType>> &
		Record<string, { label: string; icon: Component<IconProps>; class: string }> = {
		email_sent: { label: 'Email envoyé', icon: MailCheckIcon, class: 'text-success' },
		email_failed: { label: 'Email en échec', icon: MailXIcon, class: 'text-error' },
	}

	const reasonLabels: Record<EmailFailureReason, string> = {
		permanent: 'Refus définitif du relais',
		exhausted: 'Tentatives épuisées',
		shutdown: `Arrêt du serveur avant l'envoi`,
		overflow: `File d'attente saturée`,
	}
</script>

<div class="max-w-7xl mx-auto">
	<InputOptionInParam key="type" options={typesMap} />

	<table class="table border">
		<thead>
			<tr>
				<td>Type</td>
				<td>Date</td>
				<td>Évènement</td>
				<td>Destinataires</td>
				<td>Sujet</td>
				<td>Détail</td>
			</tr>
		</thead>
		<tbody>
			{#each data.logs as log (log.id)}
				{@const type = typesMap[log.type]}
				<tr>
					<td>
						{#if type}
							{@const TypeIcon = type.icon}
							<span class="inline-flex" use:tip={{ content: type.label }}>
								<TypeIcon class={type.class} />
							</span>
						{:else}
							<span class="badge badge-ghost badge-sm">{log.type}</span>
						{/if}
					</td>

					<td>
						<span use:tip={{ content: dayjs(log.createdAt).format('DD.MM.YYYY HH:mm:ss') }}>
							{dayjs(log.createdAt).fromNow()}
						</span>
					</td>

					<td>
						{#if log.event}
							<a href="/{log.event.id}" class="link">{log.event.name}</a>
						{:else}
							<span class="opacity-50">—</span>
						{/if}
					</td>

					<td>{'to' in log.data ? log.data.to.join(', ') : ''}</td>
					<td>{'subject' in log.data ? log.data.subject : ''}</td>

					<td>
						{#if 'error' in log.data}
							<div class="flex flex-col gap-1">
								<span class="badge badge-error badge-sm">
									{reasonLabels[log.data.reason]}
								</span>
								<span class="text-xs opacity-70">
									{log.data.error} · {log.data.attempts} tentative(s)
								</span>
							</div>
						{:else if 'messageId' in log.data}
							<div class="flex flex-col gap-1">
								<span class="text-xs opacity-70">{log.data.response}</span>
								{#if log.data.rejected?.length}
									<span class="badge badge-warning badge-sm">
										Refusés: {log.data.rejected.join(', ')}
									</span>
								{/if}
							</div>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	{#if !data.logs.length}
		<p class="text-center opacity-60 py-8">Aucune entrée</p>
	{/if}

	<div class="flex justify-end mt-2">
		<Pagination />
	</div>
</div>
