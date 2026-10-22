<script lang="ts">
	import {
		ArrowRightIcon,
		CalendarIcon,
		ClipboardPasteIcon,
		FileSpreadsheetIcon,
	} from '@lucide/svelte'
	import { goto } from '$app/navigation'
	import { InputBoolean } from 'fuma'
	import { eventPath } from '#lib/eventPath.js'
	import { Placeholder, Section, Surface } from '#lib/ui/index.js'
	import { importSource } from './importSource.svelte'

	let { data } = $props()

	const source = importSource.get()
	let pasted = $state('')
	let pastedHeader = $state(true)

	async function handleFile(event: Event & { currentTarget: HTMLInputElement }) {
		const file = event.currentTarget.files?.[0]
		if (!file) return
		source.setCsv(file)
		await goto(eventPath('/admin/members/import/text'))
	}

	async function handlePasted() {
		source.setPasted(pasted, pastedHeader)
		await goto(eventPath('/admin/members/import/text'))
	}
</script>

<div class="max-w-3xl mx-auto w-full space-y-3">
	<Surface back title="Importer des membres" subtitle="D'où viennent les membres à importer ?" />

	<Section
		id="source-csv"
		title="Depuis un fichier CSV"
		subtitle="Une ligne par membre, une colonne par information."
		icon={FileSpreadsheetIcon}
	>
		<input
			type="file"
			accept=".csv,text/csv"
			class="file-input w-full"
			aria-label="Fichier CSV"
			onchange={handleFile}
		/>
	</Section>

	<Section
		id="source-paste"
		title="Coller des données"
		subtitle="Une sélection copiée dans un tableur, ou une liste d'adresses."
		icon={ClipboardPasteIcon}
	>
		<!-- Pas de lecture du presse-papier par l'API: elle demande une permission, et Firefox la
		     refuse aux pages. Le collage au clavier marche partout. -->
		<div class="flex flex-col gap-2">
			<textarea
				class="textarea w-full font-mono text-sm"
				rows="6"
				aria-label="Données collées"
				placeholder="Colle ici des lignes copiées depuis Excel, Numbers ou Google Sheets"
				bind:value={pasted}></textarea>
			<div class="flex flex-wrap items-center gap-2">
				<InputBoolean
					label="La première ligne contient les en-têtes"
					bind:checked={pastedHeader}
					class="w-auto"
				/>
				<button
					type="button"
					class="btn btn-primary ml-auto"
					disabled={!pasted.trim()}
					onclick={handlePasted}
				>
					Continuer
					<ArrowRightIcon size={20} />
				</button>
			</div>
		</div>
	</Section>

	<Section
		id="source-event"
		title="Depuis un autre évènement"
		subtitle="Ses membres et leurs profils. Tu dois en être admin."
		icon={CalendarIcon}
	>
		{#if data.importableEvents.length}
			<ul class="flex flex-col">
				{#each data.importableEvents as event (event.id)}
					<li>
						<a
							class="menu-item"
							href={eventPath('/admin/members/import/event/[sourceEventId]', {
								sourceEventId: event.id,
							})}
						>
							<span class="grow font-medium">{event.name}</span>
							<span class="text-sm text-base-content/70">
								{event.memberCount}
								{event.memberCount > 1 ? 'membres' : 'membre'}
								{#if event.startDate}
									· {event.startDate.getFullYear()}
								{/if}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<Placeholder class="h-24 text-center">Aucun autre évènement dont tu es admin.</Placeholder>
		{/if}
	</Section>
</div>
