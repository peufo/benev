<script lang="ts">
	import type { LogTyped } from './logMap'
	import type { EmailFailureReason } from './logMap'

	type Types = 'email_sent' | 'email_failed'
	let { log }: { log: LogTyped<Types> } = $props()

	const reasonLabels: Record<EmailFailureReason, string> = {
		permanent: 'Refus définitif du relais',
		exhausted: 'Tentatives épuisées',
		shutdown: "Arrêt du serveur avant l'envoi",
		overflow: "File d'attente saturée",
	}
</script>

<p>
	{log.type === 'email_sent' ? 'Email envoyé' : "Échec d'envoi"} à
	<b>{log.data.to.join(', ')}</b>
</p>

<div class="text-base-content/70">
	<span>{log.data.subject}</span>
</div>

<div class="flex items-center flex-wrap gap-2 mt-1">
	{#if log.type === 'email_failed'}
		<span class="badge badge-sm badge-error">{reasonLabels[log.data.reason]}</span>
		<span class="text-xs text-base-content/70">
			{log.data.error} · {log.data.attempts} tentative{log.data.attempts > 1 ? 's' : ''}
		</span>
	{:else if log.data.rejected?.length}
		<span class="badge badge-sm badge-warning">
			Refusés&nbsp;: {log.data.rejected.join(', ')}
		</span>
	{/if}
</div>
