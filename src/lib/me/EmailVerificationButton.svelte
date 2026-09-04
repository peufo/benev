<script lang="ts">
	import { enhanceForm } from '$lib/enhanceForm'
	import { sendEmailVerification } from './user.remote'

	interface Props {
		class?: string
		label?: string
		/** Passé, il laisse l'appelant dire ce qui suit l'envoi. */
		sent?: boolean
	}

	let {
		class: klass = 'btn btn-primary',
		label = "M'envoyer le lien de vérification",
		sent = $bindable(false),
	}: Props = $props()

	// Le formulaire n'a pas de champ, mais il se monte à plusieurs endroits — deux instances de base
	// attachées en même temps lèveraient « A form object can only be attached to a single <form> ».
	const uid = $props.id()
	const remoteForm = $derived(sendEmailVerification.for(uid))
</script>

<form
	{...remoteForm.enhance(
		enhanceForm({ success: 'Email de vérification envoyé', onsuccess: () => (sent = true) })
	)}
	class="contents"
>
	<button formaction={remoteForm.action} class={klass} disabled={sent}>
		{sent ? 'Email envoyé' : label}
	</button>
</form>
