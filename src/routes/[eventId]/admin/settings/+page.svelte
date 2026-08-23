<script lang="ts">
	import {
		AtSignIcon,
		CalendarIcon,
		ExternalLinkIcon,
		EyeIcon,
		IdCardIcon,
		LogInIcon,
		OctagonAlertIcon,
		PaletteIcon,
		PlusIcon,
	} from '@lucide/svelte'
	import { InputTextarea, tip, urlParam } from 'fuma'
	import { enhanceForm } from '$lib/enhanceForm'
	import { updateEvent } from '$lib/event/event.remote'
	import { theme } from '$lib/event/theme/state.svelte'
	import EventDeleteButton from '$lib/event/EventDeleteButton.svelte'
	import {
		SectionAdhesion,
		SectionApparence,
		SectionContact,
		SectionEssentiel,
	} from '$lib/event/settings'
	import { MemberFields } from '$lib/member'
	import { eventPath } from '$lib/store'
	import { SaveBar, TableOfContent, type TocSection } from '$lib/ui'
	import OnlyAdmin from '../OnlyAdmin.svelte'
	import EventStateForm from './EventStateForm.svelte'
	import Section from '$lib/ui/Section.svelte'

	let { data } = $props()

	const FORM_ID = 'event-settings'

	// Libellés courts, distincts des titres de section: le sommaire se lit en diagonale.
	const SECTIONS: TocSection[] = [
		{ id: 'status', label: 'Statut', icon: EyeIcon },
		{ id: 'essentials', label: "L'essentiel", icon: CalendarIcon },
		{ id: 'contact', label: 'Contact', icon: AtSignIcon },
		{ id: 'appearance', label: 'Identité', icon: PaletteIcon },
		{ id: 'membership', label: 'Adhésion', icon: LogInIcon },
		{ id: 'fields', label: 'Champs', icon: IdCardIcon },
		{ id: 'danger', label: 'Danger', icon: OctagonAlertIcon },
	]

	let formElement = $state<HTMLFormElement>()
	let saveBar = $state<ReturnType<typeof SaveBar>>()
	// Remonte les champs dont l'état vit dans le composant (recadrage, lieu, site web, médias
	// du thème): le `reset()` natif ne restaure que les `defaultValue` du DOM.
	let resetToken = $state(0)

	function confirmIdChange() {
		if (data.event.state !== 'published') return true
		// Tant que rien n'a été saisi, le champ n'a pas de valeur: c'est celle d'origine.
		const eventId = updateEvent.fields.id.value() ?? data.event.id
		if (data.event.id === eventId) return true
		return confirm(
			`Es tu sûr de vouloir modifier le lien de l'évènement de "/${data.event.id}" pour "${eventId} ?"`
		)
	}

	function scrollToFirstIssue({ element }: { element: HTMLFormElement }) {
		// `field.as()` pose `aria-invalid` sur tous les champs fuma: l'ordre du DOM suffit,
		// inutile de traduire le chemin de l'erreur en section.
		const firstInvalid = element.querySelector<HTMLElement>('[aria-invalid="true"]')
		// `center` plutôt que `start`: le champ fautif se relit avec ce qui l'entoure.
		firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' })
		firstInvalid?.focus({ preventScroll: true })
	}

	function handleReset() {
		// L'aperçu du site lit `theme`, que le `reset()` natif ne touche pas: il est rétabli
		// ici — après ce cycle — puis les sections remontées pour que le DOM reprenne les
		// valeurs enregistrées.
		Object.assign(theme, data.event)
		resetToken++
	}
</script>

<OnlyAdmin>
	<div class="mx-auto flex w-full max-w-2xl items-start gap-3 pb-120 lg:max-w-4xl">
		<div class="flex w-full max-w-2xl min-w-0 flex-col gap-3">
			<Section id="status" title="Statut" icon={EyeIcon}>
				<EventStateForm isOwner={data.member?.userId == data.event.ownerId} event={data.event} />
			</Section>

			<!-- `id` après le spread: `enhance()` pose ses propres attributs, et les siens gagneraient. -->
			<form
				{...updateEvent.enhance(
					enhanceForm({
						before: confirmIdChange,
						success: 'Modifications enregistrées',
						oninvalid: scrollToFirstIssue,
						onsuccess: () => saveBar?.rebase(),
					})
				)}
				id={FORM_ID}
				bind:this={formElement}
				class="flex flex-col gap-4"
			>
				<Section id="essentials" title="L'essentiel" icon={CalendarIcon}>
					{#key resetToken}
						<div class="flex flex-col gap-4">
							<SectionEssentiel fields={updateEvent.fields} event={data.event} />
							<!-- La description ne fait pas partie du socle partagé avec la création:
							     elle se rédige une fois l'évènement posé. -->
							<InputTextarea
								field={updateEvent.fields.description}
								label="Description"
								value={data.event.description || ''}
								rows={4}
							/>
						</div>
					{/key}
				</Section>

				<Section
					id="contact"
					title="Contact"
					icon={AtSignIcon}
					subtitle="Affiché dans le pied de page du site"
				>
					{#key resetToken}
						<SectionContact fields={updateEvent.fields} event={data.event} />
					{/key}
				</Section>

				<Section
					id="appearance"
					title="Identité"
					icon={PaletteIcon}
					subtitle="Affiche, logo et habillage du site"
				>
					{#key resetToken}
						<SectionApparence fields={updateEvent.fields} event={data.event} />
					{/key}
				</Section>

				<Section
					id="membership"
					title="Adhésion"
					icon={LogInIcon}
					subtitle="Ce que les membres peuvent faire seuls et les informations de compte exigées"
				>
					{#key resetToken}
						<SectionAdhesion fields={updateEvent.fields} event={data.event} />
					{/key}
				</Section>

				<!-- Chaque champ s'édite dans son tiroir et s'enregistre seul: cette section ne
				     dépend donc pas de la barre de sauvegarde, et n'a pas de `{#key resetToken}`. -->
				<Section
					id="fields"
					title="Champs du profil"
					icon={IdCardIcon}
					subtitle="Les informations demandées aux membres, en plus de leur compte"
				>
					{#snippet action()}
						<a
							class="btn btn-square btn-primary"
							href={urlParam.with({ form_field: '{}' })}
							data-sveltekit-replacestate
							data-sveltekit-noscroll
							use:tip={{ content: 'Ajouter un champ' }}
						>
							<span class="inline-flex">
								<PlusIcon />
							</span>
						</a>
					{/snippet}

					<MemberFields fields={data.event.memberFields} />

					<div class="divider"></div>

					<div class="flex justify-end">
						<a href="{$eventPath}/register?forcedStepIndex=1" target="_blank" class="btn btn-ghost">
							Aperçu du formulaire d'adhésion
							<ExternalLinkIcon size={20} class="opacity-70" />
						</a>
					</div>
				</Section>
			</form>

			<Section id="danger" title="Zone de danger" icon={OctagonAlertIcon} danger>
				<div class="flex flex-wrap items-center gap-4">
					<div class="min-w-0 grow">
						<p class="font-medium">Supprimer cet évènement</p>
						<p class="text-sm text-base-content/60">
							Les secteurs, périodes, membres et inscriptions seront perdus. Cette opération est
							irréversible.
						</p>
					</div>
					<EventDeleteButton event={data.event} />
				</div>
			</Section>
		</div>

		<TableOfContent sections={SECTIONS} title="Réglages" />
	</div>

	<SaveBar
		bind:this={saveBar}
		form={formElement}
		formId={FORM_ID}
		pending={updateEvent.pending > 0}
		onreset={handleReset}
	/>
</OnlyAdmin>
