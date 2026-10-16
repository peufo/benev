<script lang="ts">
	import { UploadIcon } from '@lucide/svelte'
	import { isHttpError } from '@sveltejs/kit'
	import { beforeNavigate, goto } from '$app/navigation'
	import { InputBoolean, tip } from 'fuma'
	import { eventPath } from '#lib/eventPath.js'
	import { IMPORT_BATCH_SIZE } from '#lib/models/memberImport.js'
	import { MAX_IMPORT_INVITES, type ImportRow, type SkippedRow } from '#lib/member/import/index.js'
	import { importMembers, type ImportResult } from '#lib/member/memberImport.remote.js'
	import { importSource } from '../importSource.svelte'

	interface Props {
		/** Le nom que le journal fige pour dire d'où viennent les membres. */
		sourceName: string
		rows: ImportRow[]
		skipped: SkippedRow[]
		/** Ce qui empêche d'importer, ou `null`. */
		blocker: string | null
		ignoredColumns: number
		importing: boolean
	}

	let {
		sourceName,
		rows,
		skipped,
		blocker,
		ignoredColumns,
		importing = $bindable(),
	}: Props = $props()

	const source = importSource.get()
	let sendEmail = $state(false)
	let done = $state(0)

	const withEmail = $derived(rows.filter((row) => row.email).length)
	const tooManyInvites = $derived(withEmail > MAX_IMPORT_INVITES)

	// Quitter la page laisserait l'import à moitié fait, sans rapport pour dire où il s'est arrêté.
	beforeNavigate(({ cancel }) => {
		if (importing) cancel()
	})

	function plural(count: number, singular: string, plural: string) {
		return `${count} ${count > 1 ? plural : singular}`
	}

	async function start() {
		importing = true
		done = 0
		const results: ImportResult[] = skipped.map((row) => ({ ...row, status: 'skipped' }))
		const invite = sendEmail && !tooManyInvites

		// En séquence: chaque lot fait avancer la barre, et la file d'e-mails reçoit par petits pas.
		for (let index = 0; index < rows.length; index += IMPORT_BATCH_SIZE) {
			const batch = rows.slice(index, index + IMPORT_BATCH_SIZE)
			try {
				results.push(
					...(await importMembers({ source: sourceName, sendEmail: invite, rows: batch }))
				)
			} catch (err) {
				const reason = isHttpError(err) ? err.body.message : 'Le serveur ne répond pas'
				results.push(
					...batch.map((row) => ({
						line: row.line,
						name: `${row.firstName} ${row.lastName}`.trim(),
						email: row.email ?? '',
						status: 'failed' as const,
						reason,
					}))
				)
			}
			done += batch.length
		}

		source.report = { source: sourceName, results: results.sort((a, b) => a.line - b.line) }
		importing = false
		await goto(eventPath('/admin/members/import/report'), { replaceState: true })
		// Plus de fichier: un retour arrière ramène au choix de la source, pas à un second import.
		source.csv = null
		source.table = null
	}
</script>

<div class="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-soft pt-4 mt-4 px-2">
	{#if importing}
		<div class="flex grow items-center gap-3">
			<progress
				class="progress progress-primary grow"
				value={done}
				max={rows.length}
				aria-label="Progression de l'import"
			></progress>
			<span class="text-sm tabular-nums">{done} / {rows.length}</span>
		</div>
	{:else}
		<div class="grow text-sm text-base-content/70">
			<p>
				<strong class="text-base-content">
					{plural(rows.length, 'membre à importer', 'membres à importer')}
				</strong>
				{#if skipped.length}
					·
					<span
						use:tip={{
							content: skipped.map((row) => `Ligne ${row.line}: ${row.reason}`).join('\n'),
						}}
					>
						{plural(skipped.length, 'ligne écartée', 'lignes écartées')}
					</span>
				{/if}
				{#if ignoredColumns}
					· {plural(ignoredColumns, 'colonne ignorée', 'colonnes ignorées')}
				{/if}
			</p>
		</div>

		<InputBoolean
			label="Envoyer une invitation par e-mail"
			bind:checked={sendEmail}
			disabled={!withEmail || tooManyInvites}
			hint={tooManyInvites
				? `Plus de ${MAX_IMPORT_INVITES} adresses: les invitations se renvoient depuis la fiche de chaque membre.`
				: undefined}
			class="w-auto"
		/>

		<span use:tip={{ content: blocker ?? '', disable: !blocker }}>
			<button
				type="button"
				class="btn btn-primary"
				disabled={!!blocker || !rows.length}
				onclick={start}
			>
				<UploadIcon size={20} />
				Importer {plural(rows.length, 'membre', 'membres')}
			</button>
		</span>
	{/if}
</div>
