<script lang="ts">
	import { ExternalLinkIcon } from '@lucide/svelte'
	import { page } from '$app/state'
	import { Dialog } from 'fuma'
	import dayjs from '$lib/dayjs'
	import { TERMS_VERSION } from '$lib/constant'
	import { LEGAL_DOCS } from '$lib/layout/legal'
	import { enhanceForm } from '$lib/enhanceForm'
	import { acceptTerms, logoutUser } from './user.remote'

	interface Props {
		/** L'utilisateur connecté, ou rien: la question ne se pose qu'à un compte. */
		user?: { isTermsAccepted: boolean; termsVersion: string | null }
	}

	let { user }: Props = $props()

	let dialog: HTMLDialogElement | undefined = $state()

	const effectiveDate = dayjs(TERMS_VERSION).format('D MMMM YYYY')

	/** Un compte créé par invitation n'a jamais rien accepté: ce n'est pas une mise à jour. */
	const isFirstAcceptance = $derived(!user?.isTermsAccepted)
	// Les comptes antérieurs à la version des textes n'ont pas de `termsVersion`: ils sont donc
	// tous rappelés une fois, ce qui est le but.
	const isOutdated = $derived(!!user && user.termsVersion !== TERMS_VERSION)
	/** Sur les textes eux-mêmes, la fenêtre s'efface: on ne fait pas accepter sans laisser lire. */
	const isReadingLegalDoc = $derived(LEGAL_DOCS.some(({ path }) => path === page.url.pathname))
	const isAsked = $derived(isOutdated && !isReadingLegalDoc)

	$effect(() => {
		if (!dialog) return
		const element = dialog

		// Un consentement qu'on peut écarter d'un clic ne prouve rien: `Escape` et le fond de la
		// modale — que daisyUI rend cliquable — sont neutralisés. La sortie reste ouverte, mais
		// par la déconnexion, qui est un choix.
		const blockEscape = (event: Event) => event.preventDefault()
		const blockBackdrop = (event: MouseEvent) => {
			const target = event.target as HTMLElement | null
			if (!target?.closest('.modal-backdrop')) return
			event.preventDefault()
			event.stopPropagation()
		}
		element.addEventListener('cancel', blockEscape)
		element.addEventListener('click', blockBackdrop, true)

		if (!element.open) element.showModal()

		return () => {
			element.removeEventListener('cancel', blockEscape)
			element.removeEventListener('click', blockBackdrop, true)
		}
	})
</script>

{#if isAsked}
	<Dialog bind:dialog hideCloseButton>
		{#snippet header()}
			<h2 class="title">
				{isFirstAcceptance ? 'Avant de continuer' : 'Nos conditions ont changé'}
			</h2>
		{/snippet}

		<p class="max-w-prose leading-relaxed">
			{#if isFirstAcceptance}
				Ton compte n'a pas encore accepté les textes qui encadrent benevio. Ils disent ce que le
				service fait de tes données et ce que tu peux en attendre.
			{:else}
				Les textes qui encadrent benevio ont été mis à jour. La version en vigueur prend effet le
				<b>{effectiveDate}</b>.
			{/if}
		</p>

		<ul class="mt-4 flex flex-col gap-3 rounded-2xl border border-soft p-5">
			{#each LEGAL_DOCS as doc (doc.path)}
				<li>
					<!-- Nouvel onglet: lire ne doit pas coûter la page sur laquelle on était. -->
					<a
						href={doc.path}
						target="_blank"
						rel="noopener"
						class="link link-hover link-primary inline-flex items-center gap-1.5 font-semibold"
					>
						{doc.label}
						<ExternalLinkIcon size={14} class="opacity-70" />
					</a>
					<p class="text-sm leading-snug text-base-content/70">{doc.description}</p>
				</li>
			{/each}
		</ul>

		<!-- « J'accepte » d'abord dans le DOM pour que la touche Entrée le déclenche; l'ordre
		     affiché est rétabli par `flex-row-reverse`. -->
		<form
			{...acceptTerms.enhance(enhanceForm({ success: "C'est noté, merci" }))}
			{...logoutUser.enhance(enhanceForm())}
			class="mt-6 flex flex-row-reverse flex-wrap items-center justify-between gap-2"
		>
			<button formaction={acceptTerms.action} class="btn btn-primary"> J'accepte </button>
			<button formaction={logoutUser.action} class="btn btn-ghost"> Se déconnecter </button>
		</form>
	</Dialog>
{/if}
