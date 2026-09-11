<script lang="ts">
	import { MailCheckIcon } from '@lucide/svelte'
	import { resolve } from '$app/paths'
	import { Section } from '$lib/ui'
	import { enhanceForm } from '$lib/enhanceForm'
	import { logoutUser } from '$lib/me/user.remote'

	let { data } = $props()

	// `TermsAcceptDialog`, monté par le layout racine, peut porter `logoutUser` au même moment:
	// deux <form> sur une même instance lèvent « A form object can only be attached to a single
	// <form> element ».
	const logout = logoutUser.for('email_verification_mismatch')
</script>

<Section
	id="email_verification_ok"
	class="max-w-lg mx-auto"
	title="Adresse confirmée"
	icon={MailCheckIcon}
>
	<p class="mt-4 leading-relaxed">
		Le lien a confirmé l'adresse à laquelle il a été envoyé. Elle n'est pas celle du compte avec
		lequel tu es connecté·e.
	</p>

	<!-- Les deux adresses en regard plutôt qu'en phrase: elles se comparent d'un coup d'œil, et
	     une adresse longue ne se coupe plus au milieu d'un mot. -->
	<dl class="mt-4 flex flex-col gap-2 rounded-box border border-soft p-5 text-sm">
		<div class="flex flex-wrap gap-x-2">
			<dt class="text-base-content/70">Adresse confirmée</dt>
			<dd class="font-semibold break-all">{data.confirmedEmail}</dd>
		</div>
		<div class="flex flex-wrap gap-x-2">
			<dt class="text-base-content/70">Tu es connecté·e avec</dt>
			<dd class="font-semibold break-all">{data.currentEmail}</dd>
		</div>
	</dl>

	<!-- Le bouton principal d'abord dans le DOM: c'est lui que déclenche la touche Entrée. Le
	     rechargement retombe sur cette URL, où le jeton attend encore d'ouvrir la bonne session. -->
	<div class="mt-8 flex flex-wrap gap-2 flex-row-reverse justify-between">
		<form {...logout.enhance(enhanceForm({ onsuccess: () => document.location.reload() }))}>
			<button class="btn btn-primary"> Changer de compte </button>
		</form>
		<a href={resolve('/me')} class="btn"> Rester avec mon compte </a>
	</div>
</Section>
