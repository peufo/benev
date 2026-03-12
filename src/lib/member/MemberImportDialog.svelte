<script lang="ts">
	import { onMount, tick } from 'svelte'
	import { fly } from 'svelte/transition'
	import { Dialog, Icon, InputRelation, InputBoolean } from 'fuma'
	import {
		mdiArrowLeft,
		mdiAccountMultiplePlus,
		mdiCheckboxMarked,
		mdiCheckboxBlankOutline,
	} from '@mdi/js'
	import { eventPath } from '$lib/store'
	import { toast } from 'svelte-sonner'

	export let dialog: HTMLDialogElement
	export let title = 'Importer des membres'

	interface ImportableEvent {
		id: string
		name: string
		memberCount: number
		startDate: string | null
		endDate: string | null
	}

	interface SourceMember {
		id: string
		firstName: string
		lastName: string
		email: string | null
		phone: string | null
		profileData: Array<{ fieldName: string; value: any }>
	}

	interface Field {
		id: string
		name: string
		label: string | null
		type: string
		required: boolean
	}

	interface FieldMapping {
		sourceFieldId: string
		targetFieldId: string | null
		sourceFieldName: string
		targetFieldName: string | null
		sourceFieldType: string
		targetFieldType: string | null
	}

	// State management
	let step: 'events' | 'members' | 'fields' | 'confirm' | 'results' = 'events'
	let selectedEvent: ImportableEvent | null = null
	let sourceMembers: SourceMember[] = []
	let selectedMemberIds: Set<string> = new Set()
	let sourceFields: Field[] = []
	let targetFields: Field[] = []
	let fieldMappings: FieldMapping[] = []
	let importResults: any = null
	let isLoading = false

	// UI state
	let offsetWidth: number
	let inputRelationEvent: InputRelation<ImportableEvent>

	async function loadImportableEvents(): Promise<ImportableEvent[]> {
		const response = await fetch(`${$eventPath}/admin/members/import`)
		const data = await response.json()
		return data.events || []
	}

	async function loadSourceMembers(eventId: string) {
		isLoading = true
		try {
			const response = await fetch(`${$eventPath}/admin/members/import?sourceEventId=${eventId}`)
			const data = await response.json()

			if (data.type === 'members_and_fields') {
				sourceMembers = data.members
				sourceFields = data.sourceFields
				targetFields = data.targetFields
				fieldMappings = data.suggestedMappings
				step = 'members'
			}
		} catch (error) {
			toast.error('Erreur lors du chargement des membres')
		} finally {
			isLoading = false
		}
	}

	function handleSelectEvent(event: ImportableEvent) {
		setTimeout(async () => {
			selectedEvent = event
			await loadSourceMembers(event.id)
			await tick()
			dialog.focus()
		}, 0)
	}

	function toggleMemberSelection(memberId: string) {
		if (selectedMemberIds.has(memberId)) {
			selectedMemberIds.delete(memberId)
		} else {
			selectedMemberIds.add(memberId)
		}
		selectedMemberIds = selectedMemberIds // trigger reactivity
	}

	function toggleSelectAll() {
		if (selectedMemberIds.size === sourceMembers.length) {
			selectedMemberIds.clear()
		} else {
			selectedMemberIds = new Set(sourceMembers.map((m) => m.id))
		}
		selectedMemberIds = selectedMemberIds // trigger reactivity
	}

	function updateFieldMapping(sourceFieldId: string, targetFieldId: string | null) {
		const mapping = fieldMappings.find((m) => m.sourceFieldId === sourceFieldId)
		if (mapping) {
			mapping.targetFieldId = targetFieldId
			if (targetFieldId) {
				const targetField = targetFields.find((f) => f.id === targetFieldId)
				mapping.targetFieldName = targetField?.name || null
				mapping.targetFieldType = targetField?.type || null
			} else {
				mapping.targetFieldName = null
				mapping.targetFieldType = null
			}
		}
		fieldMappings = fieldMappings // trigger reactivity
	}

	function handleFieldMappingChange(sourceFieldId: string, e: Event) {
		const target = e.target as HTMLSelectElement
		updateFieldMapping(sourceFieldId, target.value || null)
	}

	async function executeImport() {
		if (!selectedEvent || selectedMemberIds.size === 0) return

		isLoading = true
		try {
			const importOptions = {
				sourceEventId: selectedEvent.id,
				targetEventId: $eventPath.split('/')[1], // Extract eventId from path
				selectedMemberIds: Array.from(selectedMemberIds),
				fieldMappings,
				preserveTeamAssignments: false,
				sendInvitationEmails: false,
			}

			const response = await fetch(`${$eventPath}/admin/members/import`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(importOptions),
			})

			if (!response.ok) {
				throw new Error(await response.text())
			}

			importResults = await response.json()
			step = 'results'

			if (importResults.success && importResults.importedCount > 0) {
				toast.success(`${importResults.importedCount} membres importés avec succès`)
			}
		} catch (error) {
			toast.error(`Erreur lors de l'import: ${error}`)
		} finally {
			isLoading = false
		}
	}

	function resetDialog() {
		step = 'events'
		selectedEvent = null
		sourceMembers = []
		selectedMemberIds.clear()
		sourceFields = []
		targetFields = []
		fieldMappings = []
		importResults = null
		inputRelationEvent?.clear()
	}

	async function goBack() {
		if (step === 'members') {
			step = 'events'
			selectedEvent = null
			await tick()
			inputRelationEvent?.clear()
		} else if (step === 'fields') {
			step = 'members'
		} else if (step === 'confirm') {
			step = 'fields'
		} else if (step === 'results') {
			resetDialog()
		}
	}

	function goToFieldMapping() {
		if (selectedMemberIds.size === 0) {
			toast.warning('Veuillez sélectionner au moins un membre à importer')
			return
		}
		step = 'fields'
	}

	function goToConfirmation() {
		step = 'confirm'
	}

	// Keyboard navigation
	onMount(() => {
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				if (step !== 'events') {
					goBack()
				} else {
					dialog.close()
				}
			} else if (event.key === 'Backspace' && step !== 'events') {
				goBack()
			}
		}
		dialog.addEventListener('keydown', handleKeydown)
		return () => {
			dialog.removeEventListener('keydown', handleKeydown)
		}
	})
</script>

<Dialog bind:dialog class="max-w-4xl overflow-x-hidden" on:close={resetDialog}>
	<h2 slot="header" class="title flex items-center gap-2" bind:offsetWidth>
		<Icon path={mdiAccountMultiplePlus} size={24} />
		{title}
	</h2>

	{#if step === 'events'}
		<div class="content" in:fly={{ x: -offsetWidth, duration: 250 }}>
			<p class="text-sm text-gray-600 mb-4">
				Sélectionnez l'événement depuis lequel importer les profils de membres.
			</p>
			<InputRelation
				bind:this={inputRelationEvent}
				flatMode
				search={loadImportableEvents}
				placeholder="Chercher un événement"
				classList="max-h-80 overflow-y-auto"
				on:input={({ detail }) => handleSelectEvent(detail.value)}
			>
				<svelte:fragment slot="suggestion" let:item>
					<div>
						<div class="font-medium">{item.name}</div>
						<div class="text-sm text-gray-500">
							{item.memberCount} membres
							{#if item.startDate}
								• {new Date(item.startDate).getFullYear()}
							{/if}
						</div>
					</div>
				</svelte:fragment>
			</InputRelation>
		</div>
	{:else if step === 'members'}
		<div class="content" in:fly={{ x: offsetWidth, duration: 250 }}>
			<div class="flex gap-2 items-center mb-4">
				<button type="button" class="btn btn-square btn-ghost btn-sm" on:click={goBack}>
					<Icon path={mdiArrowLeft} />
				</button>
				<div>
					<h3 class="title text-lg">{selectedEvent?.name}</h3>
					<p class="text-sm text-gray-600">Sélectionnez les membres à importer</p>
				</div>
			</div>

			{#if isLoading}
				<div class="flex justify-center py-8">
					<span class="loading loading-spinner loading-lg" />
				</div>
			{:else}
				<div class="border rounded-lg overflow-hidden mb-4">
					<div class="bg-gray-50 border-b p-3">
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								class="checkbox checkbox-sm"
								checked={selectedMemberIds.size === sourceMembers.length &&
									sourceMembers.length > 0}
								indeterminate={selectedMemberIds.size > 0 &&
									selectedMemberIds.size < sourceMembers.length}
								on:change={toggleSelectAll}
							/>
							<span>Sélectionner tout ({sourceMembers.length} membres)</span>
						</label>
					</div>
					<div class="max-h-80 overflow-y-auto">
						{#each sourceMembers as member}
							<div
								class="border-b last:border-b-0 p-3 hover:bg-gray-50 cursor-pointer"
								role="button"
								tabindex="0"
								on:click={() => toggleMemberSelection(member.id)}
								on:keydown={(e) => e.key === 'Enter' && toggleMemberSelection(member.id)}
							>
								<div class="flex items-start gap-3">
									<input
										type="checkbox"
										class="checkbox checkbox-sm mt-1"
										checked={selectedMemberIds.has(member.id)}
										on:change={() => toggleMemberSelection(member.id)}
									/>
									<div class="min-w-0 flex-1">
										<div class="font-medium">
											{member.firstName}
											{member.lastName}
										</div>
										<div class="text-sm text-gray-600">
											{#if member.email}
												{member.email}
											{/if}
											{#if member.phone}
												• {member.phone}
											{/if}
										</div>
										{#if member.profileData.length > 0}
											<div class="text-xs text-gray-500 mt-1">
												{member.profileData.map((p) => `${p.fieldName}: ${p.value}`).join(' • ')}
											</div>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="flex justify-between">
					<div class="text-sm text-gray-600">
						{selectedMemberIds.size} membre(s) sélectionné(s)
					</div>
					<button
						type="button"
						class="btn btn-primary"
						disabled={selectedMemberIds.size === 0}
						on:click={goToFieldMapping}
					>
						Configurer les champs
					</button>
				</div>
			{/if}
		</div>
	{:else if step === 'fields'}
		<div class="content" in:fly={{ x: offsetWidth, duration: 250 }}>
			<div class="flex gap-2 items-center mb-4">
				<button type="button" class="btn btn-square btn-ghost btn-sm" on:click={goBack}>
					<Icon path={mdiArrowLeft} />
				</button>
				<div>
					<h3 class="title text-lg">Correspondance des champs</h3>
					<p class="text-sm text-gray-600">Associez les champs source aux champs cible</p>
				</div>
			</div>

			<div class="border rounded-lg overflow-hidden mb-4">
				<div class="bg-gray-50 border-b p-3 grid grid-cols-3 gap-4 font-medium text-sm">
					<div>Champ source</div>
					<div>Champ cible</div>
					<div>Compatible</div>
				</div>
				<div class="max-h-80 overflow-y-auto">
					{#each fieldMappings as mapping}
						<div class="border-b last:border-b-0 p-3 grid grid-cols-3 gap-4 items-center">
							<div>
								<div class="font-medium">{mapping.sourceFieldName}</div>
								<div class="text-xs text-gray-500">{mapping.sourceFieldType}</div>
							</div>
							<div>
								<select
									class="select select-sm w-full"
									bind:value={mapping.targetFieldId}
									on:change={(e) => handleFieldMappingChange(mapping.sourceFieldId, e)}
								>
									<option value="">-- Ignorer ce champ --</option>
									{#each targetFields as field}
										<option value={field.id}>{field.name}</option>
									{/each}
								</select>
								{#if mapping.targetFieldType}
									<div class="text-xs text-gray-500">{mapping.targetFieldType}</div>
								{/if}
							</div>
							<div class="text-center">
								{#if mapping.targetFieldId}
									{#if mapping.sourceFieldType === mapping.targetFieldType}
										<Icon path={mdiCheckboxMarked} class="text-green-600" size={20} />
									{:else}
										<Icon path={mdiCheckboxBlankOutline} class="text-orange-500" size={20} />
									{/if}
								{:else}
									<span class="text-gray-400">-</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="flex justify-end">
				<button type="button" class="btn btn-primary" on:click={goToConfirmation}>
					Confirmer l'import
				</button>
			</div>
		</div>
	{:else if step === 'confirm'}
		<div class="content" in:fly={{ x: offsetWidth, duration: 250 }}>
			<div class="flex gap-2 items-center mb-4">
				<button type="button" class="btn btn-square btn-ghost btn-sm" on:click={goBack}>
					<Icon path={mdiArrowLeft} />
				</button>
				<div>
					<h3 class="title text-lg">Confirmation</h3>
					<p class="text-sm text-gray-600">Vérifiez les paramètres avant l'import</p>
				</div>
			</div>

			<div class="space-y-4 mb-6">
				<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<h4 class="font-medium text-blue-900 mb-2">Résumé de l'import</h4>
					<ul class="text-sm space-y-1 text-blue-800">
						<li><strong>Événement source:</strong> {selectedEvent?.name}</li>
						<li><strong>Membres à importer:</strong> {selectedMemberIds.size}</li>
						<li>
							<strong>Champs mappés:</strong>
							{fieldMappings.filter((m) => m.targetFieldId).length}
						</li>
						<li>
							<strong>Champs ignorés:</strong>
							{fieldMappings.filter((m) => !m.targetFieldId).length}
						</li>
					</ul>
				</div>

				<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
					<h4 class="font-medium text-yellow-900 mb-2">Important</h4>
					<ul class="text-sm space-y-1 text-yellow-800">
						<li>• Les membres existants (même email) seront ignorés</li>
						<li>• Les membres importés seront automatiquement validés</li>
						<li>• Cette action ne peut pas être annulée</li>
					</ul>
				</div>
			</div>

			<div class="flex justify-end gap-2">
				<button type="button" class="btn" on:click={goBack}> Retour </button>
				<button type="button" class="btn btn-primary" disabled={isLoading} on:click={executeImport}>
					{#if isLoading}
						<span class="loading loading-spinner loading-sm" />
						Import en cours...
					{:else}
						Importer {selectedMemberIds.size} membre(s)
					{/if}
				</button>
			</div>
		</div>
	{:else if step === 'results'}
		<div class="content" in:fly={{ x: offsetWidth, duration: 250 }}>
			<div class="text-center mb-6">
				<h3 class="title text-lg mb-2">Résultats de l'import</h3>
			</div>

			{#if importResults}
				<div class="space-y-4 mb-6">
					{#if importResults.success}
						<div class="bg-green-50 border border-green-200 rounded-lg p-4">
							<h4 class="font-medium text-green-900 mb-2">Import réussi !</h4>
							<p class="text-sm text-green-800">
								{importResults.importedCount} membre(s) importé(s) avec succès
							</p>
						</div>
					{/if}

					{#if importResults.skippedCount > 0}
						<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
							<h4 class="font-medium text-yellow-900 mb-2">
								Membres ignorés ({importResults.skippedCount})
							</h4>
							<div class="text-sm text-yellow-800 max-h-32 overflow-y-auto">
								{#each importResults.details.skipped as skipped}
									<div>{skipped.name} ({skipped.email}) - {skipped.reason}</div>
								{/each}
							</div>
						</div>
					{/if}

					{#if importResults.errors.length > 0}
						<div class="bg-red-50 border border-red-200 rounded-lg p-4">
							<h4 class="font-medium text-red-900 mb-2">Erreurs</h4>
							<div class="text-sm text-red-800 max-h-32 overflow-y-auto">
								{#each importResults.errors as error}
									<div>{error}</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<div class="flex justify-center">
				<button
					type="button"
					class="btn btn-primary"
					on:click={() => {
						dialog.close()
						window.location.reload() // Refresh to show new members
					}}
				>
					Terminer
				</button>
			</div>
		</div>
	{/if}
</Dialog>
