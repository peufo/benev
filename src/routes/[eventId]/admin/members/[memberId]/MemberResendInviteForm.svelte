<script lang="ts">
	import { SendIcon } from '@lucide/svelte'
	import { confirmDialog, tip } from 'fuma'
	import { enhanceForm } from '$lib/enhanceForm'
	import { resendInvite } from '$lib/member/memberAdmin.remote'

	let { email }: { email: string } = $props()
</script>

<form
	{...resendInvite.enhance(
		enhanceForm({
			// Une icône seule dans une rangée d'icônes, dont le clic écrit à un bénévole: l'adresse
			// visée se relit avant l'envoi, pas après.
			before: () =>
				confirmDialog({
					title: "Renvoyer l'invitation ?",
					message: `Un courriel partira à ${email}.`,
					confirmLabel: 'Renvoyer',
				}),
			pending: 'Envoi...',
			success: 'Invitation renvoyée',
		})
	)}
	class="contents"
>
	<button
		class="btn btn-square btn-sm btn-secondary"
		disabled={resendInvite.pending > 0}
		aria-label={`Renvoyer l'invitation à ${email}`}
		use:tip={{ content: `Renvoyer l'invitation à ${email}` }}
	>
		<SendIcon size={20} />
	</button>
</form>
