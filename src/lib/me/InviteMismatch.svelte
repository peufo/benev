<script lang="ts">
	import { TriangleAlertIcon } from '@lucide/svelte'
	import { invalidateAll } from '$app/navigation'
	import { Card } from '$lib/ui'
	import { enhanceForm } from '$lib/enhanceForm'
	import { dismissInvite, logoutUser } from './user.remote'

	interface Props {
		eventName: string
		/** L'adresse à laquelle le lien a été envoyé. */
		invitedEmail: string
		/** Celle de la session ouverte. */
		currentEmail: string
	}

	let { eventName, invitedEmail, currentEmail }: Props = $props()

	// `TermsAcceptDialog`, monté par le layout racine, peut porter `logoutUser` au même moment:
	// deux <form> sur une même instance lèvent « A form object can only be attached to a single
	// <form> element ». L'`action` doit venir de cette instance-ci, pas de la base.
	const logout = logoutUser.for('invite_mismatch')
</script>

<Card class="max-w-lg mx-auto">
	{#snippet title()}
		<h2 class="flex gap-2">
			<TriangleAlertIcon class="opacity-70" />
			<span>Cette invitation vise un autre compte</span>
		</h2>
	{/snippet}

	<p class="mt-4 leading-relaxed">
		Le lien d'invitation à <b>{eventName}</b> ne vise pas le compte avec lequel tu es connecté.
	</p>

	<!-- Les deux adresses en regard plutôt qu'en phrase: elles se comparent d'un coup d'œil, et
	     une adresse longue ne se coupe plus au milieu d'un mot. -->
	<dl class="mt-4 flex flex-col gap-2 rounded-2xl border border-soft p-5 text-sm">
		<div class="flex flex-wrap gap-x-2">
			<dt class="text-base-content/70">Invitation envoyée à</dt>
			<dd class="font-semibold break-all">{invitedEmail}</dd>
		</div>
		<div class="flex flex-wrap gap-x-2">
			<dt class="text-base-content/70">Tu es connecté avec</dt>
			<dd class="font-semibold break-all">{currentEmail}</dd>
		</div>
	</dl>

	<p class="mt-4 text-sm leading-relaxed text-base-content/70">
		L'adhésion se rattache à l'adresse invitée. En te déconnectant, l'inscription reprend à son nom
		— et le lien du mail reste valable dans tous les cas.
	</p>

	<!-- Le bouton principal d'abord dans le DOM: c'est lui que déclenche la touche Entrée. -->
	<form
		{...logout.enhance(enhanceForm({ onsuccess: () => document.location.reload() }))}
		{...dismissInvite.enhance(enhanceForm({ onsuccess: () => invalidateAll() }))}
		class="mt-8 flex flex-wrap gap-2"
	>
		<button formaction={logout.action} class="btn btn-primary"> Changer de compte </button>
		<button formaction={dismissInvite.action} class="btn"> Rester avec mon compte </button>
	</form>
</Card>
