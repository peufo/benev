<script lang="ts">
	import { LinkIcon, RotateCcwIcon, UnlinkIcon } from '@lucide/svelte'
	import { fade } from 'svelte/transition'
	import { invalidateAll } from '$app/navigation'
	import { ButtonDelete, InputBoolean, InputNumber, InputString, tip } from 'fuma'
	import type { PageData } from './$types'
	import { InputMedia } from '$lib/material/media'
	import { FORMAT_CARD } from '$lib/constant'
	import { SaveBar } from '$lib/ui'
	import { enhanceForm } from '$lib/enhanceForm'
	import InputColorMap from './InputColorMap.svelte'
	import InputFieldSelect from './InputFieldSelect.svelte'
	import InputColorPalette from './InputColorPalette.svelte'
	import InputColor from './InputColor.svelte'
	import { deleteBadge, updateBadge } from './badge.remote'

	interface Props {
		badge: PageData['badge']
		/** Joué après un enregistrement: l'aperçu est un PDF que seul le serveur sait rendre. */
		onsaved?: () => void
	}

	let { badge, onsaved }: Props = $props()

	const uid = $props.id()
	const formId = `${uid}-badge`
	const deleteFormId = `${uid}-delete`
	const remoteForm = $derived(updateBadge.for(badge.id))

	let formElement = $state<HTMLFormElement>()
	let saveBar = $state<ReturnType<typeof SaveBar>>()
	/**
	 * Le `reset()` natif rend leurs valeurs aux champs de fuma, qui portent un `defaultValue`.
	 * Les champs cachés écrits par du code — relations, médias, nuancier — n'en ont pas: les
	 * remonter est le seul moyen de leur rendre l'enregistrement chargé.
	 */
	let resetToken = $state(0)

	let lockAspectRatio = $state(true)

	// Les deux dimensions se pilotent l'une l'autre: la source de vérité est le champ, pas
	// `badge`, qui n'en donne que la valeur de départ.
	const width = $derived(remoteForm.fields.width.value() ?? badge.width)
	const height = $derived(remoteForm.fields.height.value() ?? badge.height)
	const isDefaultFormat = $derived(width === FORMAT_CARD.x && height === FORMAT_CARD.y)

	// Sélections et couleurs pilotent le nuancier et ce qui est soumis: elles vivent ici, et
	// se reprennent depuis `badge` à chaque réinitialisation.
	function seed() {
		return {
			typeField: badge.typeField,
			accessDaysField: badge.accessDaysField,
			accessSectorsField: badge.accessSectorsField,
			labelField: badge.labelField,
			colorMap: { ...badge.colorMap },
		}
	}
	let draft = $state(seed())

	/**
	 * Le verrou de ratio repilote l'**autre** dimension, jamais celle qu'on saisit: réécrire
	 * le champ sous les doigts en déplacerait le curseur à chaque frappe.
	 */
	function lockHeightTo(nextWidth: number) {
		if (!lockAspectRatio || Number.isNaN(nextWidth)) return
		setSize(remoteForm.fields.height, nextWidth / FORMAT_CARD.aspect)
	}
	function lockWidthTo(nextHeight: number) {
		if (!lockAspectRatio || Number.isNaN(nextHeight)) return
		setSize(remoteForm.fields.width, nextHeight * FORMAT_CARD.aspect)
	}
	function setSize(field: { set: (value: number) => void }, value: number) {
		field.set(Math.round(value * 100) / 100)
		// `set()` n'émet aucun évènement de formulaire: sans annonce, la barre ne voit rien.
		saveBar?.refresh()
	}

	const RatioIcon = $derived(lockAspectRatio ? LinkIcon : UnlinkIcon)
</script>

<!-- HTML interdit les <form> imbriqués: ce formulaire vide n'existe que pour porter l'action,
son bouton vit dans la barre d'actions du formulaire principal, associé par l'attribut `form`. -->
<form {...deleteBadge} id={deleteFormId} class="hidden"></form>

<!-- `id` après le spread: `enhance()` pose ses propres attributs, et les siens gagneraient. -->
<form
	{...remoteForm.enhance(
		enhanceForm({
			success: 'Badge enregistré',
			onsuccess: async () => {
				// Le nom se répercute sur la barre latérale, et l'aperçu est rendu par le serveur.
				await invalidateAll()
				saveBar?.rebase()
				onsaved?.()
			},
		})
	)}
	id={formId}
	bind:this={formElement}
	class="flex flex-col gap-2"
>
	<InputString
		field={remoteForm.fields.name}
		label="Nom de la configuration"
		value={badge.name}
		autocomplete="off"
	/>

	<div class="flex gap-2 items-end">
		<InputNumber
			field={remoteForm.fields.width}
			label="Largeur (mm)"
			value={badge.width}
			step="0.01"
			class="w-28"
			oninput={(event) => lockHeightTo(event.currentTarget.valueAsNumber)}
		/>
		<button
			type="button"
			class="btn btn-sm btn-ghost btn-square mb-1"
			onclick={() => (lockAspectRatio = !lockAspectRatio)}
			use:tip={{ content: 'Conserver le ratio' }}
		>
			<RatioIcon size={18} />
		</button>
		<InputNumber
			field={remoteForm.fields.height}
			label="Hauteur (mm)"
			value={badge.height}
			step="0.01"
			class="w-28"
			oninput={(event) => lockWidthTo(event.currentTarget.valueAsNumber)}
		/>
		{#if !isDefaultFormat}
			<button
				in:fade
				type="button"
				class="btn btn-sm btn-ghost btn-square mb-1"
				onclick={() => {
					setSize(remoteForm.fields.width, FORMAT_CARD.x)
					setSize(remoteForm.fields.height, FORMAT_CARD.y)
				}}
			>
				<span class="inline-flex" use:tip={{ content: 'Restaurer les dimensions par défaut' }}>
					<RotateCcwIcon size={18} />
				</span>
			</button>
		{/if}
	</div>

	{#key resetToken}
		<fieldset class="fieldset">
			<span class="label">Illustrations</span>
			<div class="flex gap-4 items-center justify-around">
				<InputMedia
					label="Image de fond"
					key="backgroundId"
					value={badge.backgroundId}
					oninput={() => saveBar?.refresh()}
				/>
				<InputMedia
					label="Logo"
					key="logoId"
					value={badge.logoId}
					oninput={() => saveBar?.refresh()}
				/>
			</div>
		</fieldset>

		<InputFieldSelect
			field={remoteForm.fields.accessDaysField}
			label="Champ accès 1 (Liste à choix multiple)"
			bind:value={draft.accessDaysField}
			type="multiselect"
		/>
		<InputFieldSelect
			field={remoteForm.fields.accessSectorsField}
			label="Champ accès 2 (Liste à choix multiple)"
			bind:value={draft.accessSectorsField}
			type="multiselect"
		/>
		<InputFieldSelect
			field={remoteForm.fields.labelField}
			label="Champ: Label (Liste à choix ou text)"
			bind:value={draft.labelField}
			type="select"
			typesAccepted={['select', 'string']}
		/>
		<InputFieldSelect
			field={remoteForm.fields.typeField}
			label="Champ: Type de membre (Liste à choix)"
			bind:value={draft.typeField}
			type="select"
		/>

		<fieldset class="fieldset">
			<span class="label">Couleurs par type de membre</span>
			<div class="flex flex-wrap items-start gap-1">
				<InputColorMap
					field={draft.typeField}
					bind:value={draft.colorMap}
					onchange={() => saveBar?.refresh()}
				/>
				<InputColor name="colorDefault" label="Par défaut" value={badge.colorDefault} />
			</div>
		</fieldset>
	{/key}

	<!-- Le nuancier est une `<datalist>` partagée par tous les sélecteurs de couleur. -->
	<InputColorPalette />

	<div class="flex gap-4 items-end">
		<InputNumber
			field={remoteForm.fields.accessCellSize}
			label="Taille des cellules"
			value={badge.accessCellSize}
			class="w-28"
		/>
		<InputBoolean
			field={remoteForm.fields.versoEnabled}
			label="Afficher le verso"
			checked={badge.versoEnabled}
			class="grow"
		/>
	</div>

	<div class="flex pt-2">
		<ButtonDelete form={deleteFormId} formaction={deleteBadge.action} class="btn-sm" />
	</div>
</form>

<SaveBar
	bind:this={saveBar}
	form={formElement}
	{formId}
	key={badge.id}
	pending={remoteForm.pending > 0}
	onreset={() => {
		draft = seed()
		resetToken++
	}}
/>
